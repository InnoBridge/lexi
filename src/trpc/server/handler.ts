import * as trpcExpress from '@trpc/server/adapters/express';
import express from 'express';
import { router } from '@/trpc/server/routes/router';
import { createContext } from '@/trpc/server/context';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import { WebSocketServer } from 'ws';
import http from 'http';

const trpcExpressHandler: express.Handler = trpcExpress.createExpressMiddleware({
    router: router,
    createContext: createContext,
});

const createWebSocketServer = (server: http.Server): WebSocketServer => new WebSocketServer({ server });

export type AppRouter = typeof router;

const applyWSSHandlerToServer = (wss: WebSocketServer ) => 
    applyWSSHandler({
        wss,
        router: router,
        createContext: createContext,
    });

export { trpcExpressHandler, createWebSocketServer, applyWSSHandlerToServer };