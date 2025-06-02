import { 
  createTRPCClient, 
  createWSClient,
  httpBatchLink, 
  TRPCClient, 
  wsLink 
} from '@trpc/client';
import { AppRouter } from '@/trpc/server/routes/router';
import WebSocket from 'ws';  // ← Add this import
let client: TRPCClient<AppRouter> | null = null;

const initializeTRPCClient = (url: string): void => {
  const host = url.replace(/^https?:\/\//, '');
  client = createTRPCClient<AppRouter>({
    links: [
      wsLink({
        client: createWSClient({
          url: `ws://${host}/trpc`,
          WebSocket: WebSocket as any,  // ← Pass WebSocket implementation
        }),
      }),
      httpBatchLink({
        url: `http://${host}/trpc`,
        headers: () => ({
          // 'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer`
        }),
      }),
    ],
  });
};

const getHello = () =>  {
  if (!client) {
    throw new Error('TRPC client is not initialized. Call initiateClient first.');
  }
  return client.getHello.query();
};

const greetings = (name: string) => {
  if (!client) {
    throw new Error('TRPC client is not initialized. Call initiateClient first.');
  }
  return client.greetings.query({ name: name });
};

const getUser = () => {
  if (!client) {
    throw new Error('TRPC client is not initialized. Call initiateClient first.');
  }
  return client.getUser.query();
};

const get = (userId: { userId: string }) => {
  if (!client) {
    throw new Error('TRPC client is not initialized. Call initiateClient first.');
  }
  return client.get.query(userId);
};

const update = (userId: { userId: string, name: string }) => {
  if (!client) {
    throw new Error('TRPC client is not initialized. Call initiateClient first.');
  }
  return client.update.mutate(userId);
};

const log = (message: string) => {
  if (!client) {
    throw new Error('TRPC client is not initialized. Call initiateClient first.');
  }
  return client.log.mutate(message);
};

const secretData = () => {
  if (!client) {
    throw new Error('TRPC client is not initialized. Call initiateClient first.');
  }
  return client.secretData.query();
};

const onUpdate = (clientId: string) => {
  if (!client) {
    throw new Error('TRPC client is not initialized. Call initiateClient first.');
  }
  return client.onUpdate.subscribe({ clientId: clientId }, {
    onData: (data) => {
      console.log('Update received:', data);
    },
    onError: (error) => {
      console.error('Error in subscription:', error);
    },
  });
}

export { 
  initializeTRPCClient, 
  getHello, 
  greetings, 
  getUser,
  get,
  update,
  log,
  secretData,
  onUpdate,
  client
};