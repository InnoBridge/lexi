import { trpc, adminProcedure } from '@/trpc/server/trpc';
import { z } from 'zod';
import { usersRouter } from '@/trpc/server/routes/users';

const getHelloRoute = trpc.procedure.query(() => {
        return 'Hello from tRPC!';
});

const greetingsRoute = trpc.procedure
    .input(z.object({name: z.string()}))
    .query(({ input }) => {
        return `Hello, ${input.name}!`;
    });

const getUser = trpc.procedure.query(() => {
    return { id: 1, name: 'John Doe' };
});

const log = trpc.procedure
    .input(v => {
        if (typeof v === 'string') return v;

        throw new Error("Invalid input: Expected string");
    })
    .mutation(req => {
        console.log(`Client Says: ${req.input}`);
        return true;
    });

const secretData = adminProcedure.query(({ ctx }) => { 
    console.log(`Admin user ID:`);
    console.log(ctx.user);
    return "Super top secret admin data";
});

const appRouter = trpc.router({
    // Define your tRPC routes here
    getHello: getHelloRoute,
    greetings: greetingsRoute,
    log: log,
    secretData: secretData,
});

const router = trpc.mergeRouters(appRouter, usersRouter);

export { router };
export type AppRouter = typeof router;