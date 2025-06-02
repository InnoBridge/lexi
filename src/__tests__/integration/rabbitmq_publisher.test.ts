import * as dotenv from 'dotenv';
import path from 'path';
import { RabbitMQClient } from '@/queue/rabbitmq_client';
import { QueueClient } from '@/queue/queue_client';
import { Message } from '@/models/message';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const RABBITMQ_URL = process.env.RABBITMQ_URL;

const initializationClient = async (url: string): Promise<QueueClient> => {
    const client = new RabbitMQClient();
    try {
        await client.initializeQueue(url);
        console.log('Connected to RabbitMQ');
        return client;
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        throw error;
    }
};

const publishMessageTest = async (client: QueueClient): Promise<void> => {
    console.log('Starting publishMessageTest...');

    const message: Message = 
        {
            chatId: 'chat-123',
            messageId: 'message-123',
            userIds: ['123', '456'],
            senderId: '123',
            content: 'Hello, this is a new test message!',
            createdAt: new Date().getTime(),
        };

    try {
        await client.publishMessage(message);
        console.log('Message published successfully');
    } catch (error) {
        console.error('Failed to publish message:', error);
        throw error;
    }
};

const removeQueueTest = async (client: QueueClient, queueName: string): Promise<void> => {
    console.log(`Starting removeQueueTest`);
    try {
        await client.removeQueue(queueName);
        console.log(`Queue ${queueName} removed successfully`);
    } catch (error) {
        console.error(`Failed to remove queue ${queueName}:`, error);
        throw error;
    }
};

const shutdownTest = async (client: QueueClient): Promise<void> => {
    console.log('Starting shutdownTest...');
    try {
        await client.shutdown();
        console.log('RabbitMQ client shutdown successfully');
    } catch (error) {
        console.error('Failed to shutdown RabbitMQ client:', error);
        throw error;
    }
};

(async function main() {
    try {
        const client = await initializationClient(RABBITMQ_URL!);
        
        await publishMessageTest(client);
        
        // await removeQueueTest(client, 'user-user-123');
        // await removeQueueTest(client, 'user-user-456');

        await shutdownTest(client);

        console.log("🎉 RabbitMQ Publisher integration test passed");
    } catch (err) {
        console.error("❌ RabbitMQ Publisher integration test failed:", err);
        process.exit(1);
    }
})();
