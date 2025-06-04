import { trpc, adminProcedure } from '@/trpc/server/trpc';
import { messagesRouter } from '@/trpc/server/routes/messages';

const router = trpc.router({
    messages: messagesRouter
});

export { router };
export type AppRouter = typeof router;