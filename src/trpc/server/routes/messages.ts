import { trpc } from '@/trpc/server/trpc';
import { z } from 'zod';
import { 
    publishMessage,
    subscribeUser,
    unsubscribeUser 
} from '@/api/queue';
import { EventEmitter } from 'events';

const MessageSchema = z.object({
    chatId: z.string(),
    messageId: z.string(),
    userIds: z.array(z.string()),
    senderId: z.string(),
    content: z.string(),
    createdAt: z.number(),
});

const publish = trpc.procedure
    .input(MessageSchema)
    .mutation(async ({ input }) => { 
        await publishMessage(input);
        return { success: true };
});

// Switch to eventemitter - much more reliable!
const subscribeToMessages = trpc.procedure
    .input(z.object({ userId: z.string() }))
    .subscription(async function* ({ input, signal }) {
        console.log(`🔄 Setting up subscription for user: ${input.userId}`);
        
        const emitter = new EventEmitter();
        let hasSubscribed = false;
        let isConnectionClosed = false;

        try {
            // Subscribe to RabbitMQ
            await subscribeUser(input.userId, (message) => {
                console.log(`📨 New message for user ${input.userId}:`, message);
                emitter.emit('message', message);
            });

            hasSubscribed = true;
            console.log(`✅ Successfully subscribed to queue for user: ${input.userId}`);

            // Listen for abort signal (when client disconnects)
            signal?.addEventListener('abort', () => {
                console.log(`🛑 Client disconnected for user: ${input.userId}`);
                isConnectionClosed = true;
                emitter.emit('close');
            });

            // Yield messages as they arrive
            while (!signal?.aborted) {
                const message = await new Promise<any>((resolve, reject) => {
                    const onMessage = (msg: any) => {
                        cleanup();
                        resolve(msg); // ✅ Just resolve directly
                    };
                    
                    const onClose = () => {
                        cleanup();
                      if (isConnectionClosed) {
                            // Normal disconnect - don't treat as error
                            resolve(null); // Signal end of stream
                        } else {
                            reject(new Error('Connection closed unexpectedly'));
                        }
                                        };
                    
                    emitter.once('message', onMessage);
                    emitter.once('close', onClose);
                    
                    // Cleanup listeners
                    const cleanup = () => {
                        emitter.off('message', onMessage);
                        emitter.off('close', onClose);
                    };
                });

                // If we got null (normal disconnect), break the loop
                if (message === null) {
                    console.log(`✅ Normal disconnect for user: ${input.userId}`);
                    break;
                }

                yield message;
            }

        } catch (error) {
            // Only log actual errors, not normal disconnects
            if (!isConnectionClosed) {
                console.error(`❌ Error in subscription for user ${input.userId}:`, error);
                throw error;
            }
        } finally {
            if (hasSubscribed) {
                if (isConnectionClosed) {
                    console.log(`👋 Client ${input.userId} disconnected normally - cleaning up`);
                } else {
                    console.log(`🧹 Cleaning up subscription for user: ${input.userId}`);
                }
                
                try {
                    await unsubscribeUser(input.userId);
                } catch (cleanupError) {
                    console.error(`⚠️ Error during cleanup for user ${input.userId}:`, cleanupError);
                    // Don't re-throw cleanup errors
                }
            }
        }
    });

const messagesRouter = trpc.router({
    publish: publish,
    subscribeToMessages: subscribeToMessages,
});

export { messagesRouter, subscribeToMessages };