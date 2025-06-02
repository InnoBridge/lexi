import { trpc } from '@/trpc/server/trpc';
import { z } from 'zod';
import { observable } from '@trpc/server/observable';
import { EventEmitter } from 'stream';

const eventEmitter = new EventEmitter();

const getUser = trpc.procedure.query(() => {
    return { id: 1, name: 'John Doe' };
});

const get = trpc.procedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
        // Simulate fetching a user by ID
        return { id: input.userId };
    });

const update = trpc.procedure
    .input(z.object({ userId: z.string(), name: z.string() }))
    .output(z.object({ id: z.string(), name: z.string() }))
    .mutation(req => {
        eventEmitter.emit("update", req.input);
        return { id: req.input.userId, name: req.input.name };
    });

const onUpdate = trpc.procedure
    .input(z.object({ clientId: z.string() }))  // ← Add input
    .subscription(({ input }) => {
        console.log("Subscribed to update events");
        console.log(`Client ID: ${input.clientId}`);
        // Return async generator instead of observable
        return (async function* () {
            try {
                while (true) {
                    // Wait for the next update event
                    const updateData: any = await new Promise(resolve => {
                        eventEmitter.once("update", resolve);
                    });

                    // Filter by clientId if needed
                    if (updateData.userId === input.clientId) {
                        yield updateData;
                    }
                }
            } finally {
                // Cleanup happens automatically when generator ends
                console.log(`Unsubscribed client: ${input.clientId}`);
            }
        })();
    });


const usersRouter = trpc.router({
    // Define your tRPC routes here
    getUser: getUser,
    get: get,
    update: update,
    onUpdate: onUpdate,
});

export { usersRouter };