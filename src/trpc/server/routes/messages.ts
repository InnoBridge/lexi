import { trpc } from '@/trpc/server/trpc';
import { z } from 'zod';
import { 
    publishMessage,
    subscribeUser,
    unsubscribeUser 
} from '@/api/queue';
import { observable } from '@trpc/server/observable';

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

// Updated to use async generator instead of observable
const subscribeToMessages = trpc.procedure
    .input(z.object({ userId: z.string() }))
    .subscription(async function* ({ input }) {
        console.log("Subscribed to message events");
        console.log(`Client ID: ${input.userId}`);

        // Create a promise-based message queue
        const messageQueue: Array<z.infer<typeof MessageSchema>> = [];
        let cleanup: void | undefined;
        let isActive = true;

        try {
            // Subscribe to messages
            cleanup = await subscribeUser(input.userId, (message) => {
                console.log(`New message for user ${input.userId}:`, message);
                if (isActive) {
                    messageQueue.push(message);
                }
            });

            // Yield messages as they arrive
            while (isActive) {
                if (messageQueue.length > 0) {
                    const message = messageQueue.shift();
                    if (message) {
                        yield message;
                    }
                }
                
                // Small delay to prevent busy waiting
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        } catch (error) {
            console.error('Error in subscription:', error);
            throw error;
        } finally {
            // Cleanup when subscription ends
            isActive = false;
            if (!cleanup) {
                unsubscribeUser(input.userId);
            }
        }
    });

const messagesRouter = trpc.router({
    publish: publish,
    subscribeToMessages: subscribeToMessages,
});

export { messagesRouter, subscribeToMessages };