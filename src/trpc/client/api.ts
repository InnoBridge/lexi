import { 
  createTRPCClient, 
  createWSClient,
  httpBatchLink, 
  TRPCClient, 
  wsLink 
} from '@trpc/client';
import { AppRouter } from '@/trpc/server/routes/router';
import WebSocket from 'ws';
import { Message } from '@/models/message';

let client: TRPCClient<AppRouter> | null = null;
let wsClient: ReturnType<typeof createWSClient> | null = null; // Store wsClient reference



const initializeTRPCClient = (url: string): void => {
  const host = url.replace(/^https?:\/\//, '');

  wsClient = createWSClient({
    url: `ws://${host}/trpc`,
    WebSocket: WebSocket as any,
  });
  client = createTRPCClient<AppRouter>({
    links: [
      wsLink({
        client: wsClient,
      }),
      httpBatchLink({
        url: `http://${host}/trpc`,
        headers: () => ({
          // 'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer`
        }),
      }),
      // Keep WebSocket for subscriptions only

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
  return client.users.getUser.query();
};

const get = (userId: { userId: string }) => {
  if (!client) {
    throw new Error('TRPC client is not initialized. Call initiateClient first.');
  }
  return client.users.get.query(userId);
};

const update = (userId: { userId: string, name: string }) => {
  if (!client) {
    throw new Error('TRPC client is not initialized. Call initiateClient first.');
  }
  return client.users.update.mutate(userId);
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
  return client.users.onUpdate.subscribe({ clientId: clientId }, {
    onData: (data) => {
      console.log('Update received:', data);
    },
    onError: (error) => {
      console.error('Error in subscription:', error);
    },
  });
};

const publishMessage = (message: Message) => {
  if (!client) {
    throw new Error('TRPC client is not initialized. Call initiateClient first.');
  }
  return client.messages.publish.mutate(message);
};

const subscribeToMessages = (userId: string, messageHandler: (message: Message) => void) => {
    if (!client) {
        throw new Error('TRPC client is not initialized. Call initializeTRPCClient first.');
    }
    
    return client.messages.subscribeToMessages.subscribe(
        { userId }, // Input
        {
            onData: (message) => { // Output - the complete message object
                // Process the message
                messageHandler(message);
            },
            onError: (error) => {
                console.error('Subscription error:', error);
            },
        }
    );
};


// Add cleanup function
const cleanup = () => {
  if (wsClient) {
    wsClient.close();
    wsClient = null;
  }
  client = null;
};

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
  publishMessage,
  subscribeToMessages,
  cleanup,
  client
};