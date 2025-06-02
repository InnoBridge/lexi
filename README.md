# trpc
```bash
npm install @trpc/server @trpc/client ws zod
```
```bash
npm i --save-dev @types/express @types/ws
```

## usage
in your server file
```typescript
import { trpcExpressAdapter } from '@innobridge/lexi';

const { trpcExpressHandler, createWebSocketServer, applyWSSHandlerToServer } = trpcExpressAdapter;

const app = express();
app.use(express.json());

app.use('/trpc', trpcExpressHandler);

const server = app.listen(+PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/docs`);
});
  
const wss = createWebSocketServer(server);
applyWSSHandlerToServer(wss);
```

# rabbitmq
```bash
npm install amqplib
npm i --save-dev @types/amqplib
```

RabbitMQ message has 2 parts
- payload
- label

label only describes the message with a label (an exchange name and
optionally a topic tag) 

Consumers attach to a broker server and subscribe to a queue, the consumer only receives the payload, the label doesn't get pass to the consumer so unless specified the consumer does not have information about producer.

Producer and consumer communicates to rabbitmq through channels. First the application opens a tcp connection with rabbitmq broker, once connection is established your app creates an AMQP channel. Your app can publish message or subscribe to queue through a channel.

The reason for a channel is because setting up and tearing down tcp connection is expensive, channels is less resource intensive in the situation where your application is subscribed to multiple queues it can be done through different channels.

There are 3 parts to rabbitmq
- exchange: is where producers publish their message to
- binding: routes messages from an exchange to particular queue/s
- queues: where consumers receives messages from

There are ways consumers receive message from queue
- `basic.consume`: This will place a channel in `receive` mode until it unsubscribes, the consumer will auto receive message from queue as soon it arrives to the queue.
- `basic.get`: This will only receive one message from queue, unless the channel is set `basic.get` again. It basically subscribe and unsubscribe everytime you receive a message. Resource intensive.

- routing key: A queue is bounded to an exchange by a routing key. There is a routing key in the message and one in binding.

If you publish a message to an exchange, it will have a routing key (it will be an empty key if you don't specify), RabbitMQ will try to match the routing key in its bindings. If they match the message will be delivered to the queue. If the message binding key don't match any bind patterns it will be "black holed". 

## Exchanges
There are 4 types of exchanges in RabbitMQ
- Direct Exchange
- Topic Exchange
- Fanout Exchange
- Header Exchange

### Direct Exchange
```typescript
await channel.assertExchange('direct-exchange', 'direct');
await channel.bindQueue('user-queue', 'direct-exchange', 'user.123');

// Message with routing key 'user.123' goes to user-queue
channel.publish('direct-exchange', 'user.123', Buffer.from('message'));
```
- Exact match of routing keys
- One-to-one routing

Default exchange is direct, it is specify with empty string
```typescript
// These are equivalent:
channel.sendToQueue('jobs', Buffer.from('message'));

// Is the same as:
channel.publish('', 'jobs', Buffer.from('message'));
//               ↑    ↑
//        default exchange  routing key = queue name
```

### Topic Exchange
```typescript
await channel.assertExchange('topic-exchange', 'topic');
await channel.bindQueue('email-queue', 'topic-exchange', 'user.email.*');
await channel.bindQueue('all-queue', 'topic-exchange', 'user.#');

// Matches 'user.email.*' pattern
channel.publish('topic-exchange', 'user.email.welcome', Buffer.from('message'));
```
Pattern matching with wild cards:
- `*`: one word
- `#`: zero or more words

### Fanout Exchange
```typescript
await channel.assertExchange('fanout-exchange', 'fanout');
await channel.bindQueue('queue1', 'fanout-exchange', ''); // routing key ignored
await channel.bindQueue('queue2', 'fanout-exchange', '');

// Goes to ALL bound queues regardless of routing key
channel.publish('fanout-exchange', 'any-key', Buffer.from('message'));
```
- Broadcasts to all bound queues
- ignore routing keys

### Header Exchange
```typescript
await channel.assertExchange('headers-exchange', 'headers');
await channel.bindQueue('priority-queue', 'headers-exchange', '', {
    'x-match': 'all',
    'priority': 'high',
    'type': 'urgent'
});

// Matches based on message headers, not routing key
channel.publish('headers-exchange', '', Buffer.from('message'), {
    headers: { priority: 'high', type: 'urgent' }
});
```
Header-based routing instad of routing keys
- `x-match: 'all'`: all headers must match
- `x-match: 'any'`: any headers can match