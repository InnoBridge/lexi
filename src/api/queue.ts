import { QueueClient } from '@/queue/queue_client';
import { RabbitMQClient } from '@/queue/rabbitmq_client';

let client: QueueClient | null = null;

const initializeQueue = async (url: string): Promise<QueueClient> => {
    if (client) {
        console.warn('Queue client is already initialized. Returning existing instance.');
        return client;
    }

    try {
        client = new RabbitMQClient();
        await client.initializeQueue(url);
        console.log('RabbitMQ client initialized successfully');
        return client;
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        throw error;
    }
};

const publishMessage = async (message: any): Promise<void> => {
    if (!client) {
        throw new Error('Queue client not initialized. Call initializeQueue first.');
    }
    
    try {
        await client.publishMessage(message);
        console.log('Message published successfully');
    } catch (error) {
        console.error('Failed to publish message:', error);
        throw error;
    }
};

const subscribeUser = async (userId: string, callback: (message: any) => void): Promise<void> => {
    if (!client) {
        throw new Error('Queue client not initialized. Call initializeQueue first.');
    }

    try {
        await client.subscribeUser(userId, callback);
        console.log(`Subscribed to user queue ${userId} successfully`);
    } catch (error) {
        console.error(`Failed to subscribe to user queue ${userId}:`, error);
        throw error;
    }
};

const unsubscribeUser = async (userId: string): Promise<void> => {
    if (!client) {
        throw new Error('Queue client not initialized. Call initializeQueue first.');
    }

    try {
        await client.unsubscribeUser(userId);
        console.log(`Unsubscribed from user queue ${userId} successfully`);
    } catch (error) {
        console.error(`Failed to unsubscribe from user queue ${userId}:`, error);
        throw error;
    }
};

const removeQueue = async (queueName: string): Promise<void> => {
    if (!client) {
        throw new Error('Queue client not initialized. Call initializeQueue first.');
    }

    try {
        await client.removeQueue(queueName);
        console.log(`Queue ${queueName} removed successfully`);
    } catch (error) {
        console.error(`Failed to remove queue ${queueName}:`, error);
        throw error;
    }
};

const removeExchange = async (exchangeName: string): Promise<void> => {
    if (!client) {
        throw new Error('Queue client not initialized. Call initializeQueue first.');
    }

    try {
        await client.removeExchange(exchangeName);
        console.log(`Exchange ${exchangeName} removed successfully`);
    } catch (error) {
        console.error(`Failed to remove exchange ${exchangeName}:`, error);
        throw error;
    }
};

const shutdown = async (): Promise<void> => {
    if (!client) {
        throw new Error('Queue client not initialized. Call initializeQueue first.');
    }

    try {
        await client.shutdown();
        client = null; // Clear the client after shutdown
        console.log('RabbitMQ client shutdown successfully');
    } catch (error) {
        console.error('Failed to shutdown RabbitMQ client:', error);
        throw error;
    }
};

export {
    initializeQueue,
    publishMessage,
    subscribeUser,
    unsubscribeUser,
    removeQueue,
    removeExchange,
    shutdown,
};