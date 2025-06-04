import { 
  createTRPCClient, 
  createWSClient,
  httpBatchLink, 
  TRPCClient, 
  wsLink,
  splitLink
} from '@trpc/client';
import { AppRouter } from '@/trpc/server/routes/router';
import WebSocket from 'ws';
import { Message } from '@/models/message';

let client: TRPCClient<AppRouter> | null = null;
let wsClient: ReturnType<typeof createWSClient> | null = null; // Store wsClient reference
let httpLink: ReturnType<typeof httpBatchLink> | null = null;


const initializeTRPCClient = (url: string): void => {
  const host = url.replace(/^https?:\/\//, '');

  wsClient = createWSClient({
    url: `ws://${host}/trpc`,
    WebSocket: WebSocket as any,
  });
  
  httpLink = httpBatchLink({
    url: `http://${host}/trpc`,
    headers: () => ({
      // 'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer`
    }),
  });

  client = createTRPCClient<AppRouter>({
    links: [
      splitLink({
        condition(op) {
          return op.type === 'subscription';
        },
        true: wsLink({
          client: wsClient,
        }),
        false: httpLink,
      }),
    ],
  });
};

const publishMessage = (message: Message) => {
  if (!client) {
    throw new Error('TRPC client is not initialized. Call initiateClient first.');
  }
  return client.messages.publish.mutate(message);
};

const subscribeToMessages = (
    userId: string, 
    messageHandler: (message: Message) => void
): Promise<any> => {
    if (!client) {
        throw new Error('TRPC client is not initialized. Call initializeTRPCClient first.');
    }
    
    return new Promise((resolve, reject) => {
        const subscription = client!.messages.subscribeToMessages.subscribe(
            { userId },
            {
                onStarted: () => {
                    console.log('Subscription established and ready');
                    resolve(subscription); // Resolve with subscription object when ready
                },
                onData: (message) => {
                    messageHandler(message);
                },
                onError: (error) => {
                    console.error('Subscription error:', error);
                    reject(error); // Reject promise on error
                },
            }
        );
    });
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
  publishMessage,
  subscribeToMessages,
  cleanup,
  client
};