import { Message } from '@/models/message';

interface QueueClient {
    initializeQueue(url: string): Promise<void>;
    publishMessage(message: Message): Promise<void>;
    subscribeUser(userId: string, onMessage: (msg: Message) => void): Promise<void>;
    unsubscribeUser(userId: string): Promise<void>;
    removeQueue(queueName: string): Promise<void>;
    removeExchange(exchangeName: string): Promise<void>;
    shutdown(): Promise<void>;
};

export {
    QueueClient,
};