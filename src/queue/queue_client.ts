import { Message } from '@/models/message';

interface QueueClient {
    // connect(): Promise<void>;
    // disconnect(): Promise<void>;
    // publish(queue: string, message: any): Promise<void>;
    // subscribe(queue: string, callback: (message: any) => void): Promise<void>;
    // unsubscribe(queue: string): Promise<void>;
    // purgeQueue(queue: string): Promise<void>;
    // getQueueMessageCount(queue: string): Promise<number>;
    // shutdown(): Promise<void>;


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