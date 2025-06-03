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

const subscribeToMessages = trpc.procedure
    .input(z.object({ userId: z.string() }))
    .subscription(async ({ input }) => {
        console.log("Subscribed to message events");
        console.log(`Client ID: ${input.userId}`);

        return observable<z.infer<typeof MessageSchema>>((emit) => { // Remove async here
            let cleanup: void | undefined;

            // Handle async subscribeUser properly
            (async () => {
                try {
                    cleanup = await subscribeUser(input.userId, (message) => {
                        console.log(`New message for user ${input.userId}:`, message);
                        emit.next(message); // Emit the message to subscribers
                    });
                } catch (error) {
                    console.error('Error setting up subscription:', error);
                    emit.error(error);
                }
            })();

            // Return cleanup function (synchronous)
            return () => {
                console.log(`Unsubscribing user ${input.userId}`);
                if (!cleanup) {
                    unsubscribeUser(input.userId);
                }
            };
        });
});

const messagesRouter = trpc.router({
    publish: publish,
    subscribeToMessages: subscribeToMessages,
});

export { messagesRouter, subscribeToMessages };