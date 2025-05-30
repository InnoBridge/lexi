import { initTRPC, TRPCError } from '@trpc/server';
import { createContext } from './context';

 const trpc = initTRPC
    .context<Awaited<ReturnType<typeof createContext>>>()
    .create();

const isAdminMiddleware = trpc.middleware(({ ctx, next }) => {

    return next({ ctx: { user: {id: 1}}})
});

const adminProcedure = trpc.procedure.use(isAdminMiddleware);

export { trpc, adminProcedure };