import * as dotenv from 'dotenv';
import path from 'path';
import { 
    initializeQueue,
    publishMessage,
    shutdown
} from '@/api/queue';
import { Message } from '@/models/message';

const RABBITMQ_URL = process.env.RABBITMQ_URL;

const initializeQueueTest = async (url: string) => {
    console.log(`Initializing RabbitMQ client with URL: ${url}`);
    try {
        await initializeQueue(url);
        console.log('RabbitMQ client initialized successfully');
    } catch (error) {
        console.error('Failed to initialize RabbitMQ client:', error);
        throw error;
    }
};

const publishMessageTest = async () => {
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
        await publishMessage(message);
        console.log('Message published successfully');
    } catch (error) {
        console.error('Failed to publish message:', error);
        throw error;
    }
};

const shutdownTest = async () => {
    console.log('Starting shutdownTest...');
    try {
        await shutdown();
        console.log('RabbitMQ client shutdown successfully');
    } catch (error) {
        console.error('Failed to shutdown RabbitMQ client:', error);
        throw error;
    }
};

(async function main() {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });

    try {
        // Initialize RabbitMQ client
        await initializeQueueTest(RABBITMQ_URL!);

        // Publish a message
        await publishMessageTest();

        // Shutdown the RabbitMQ client
        await shutdownTest();

        console.log("🎉 All integration tests passed");
    } catch (err) {
        console.error("❌ Integration tests failed:", err);
        process.exit(1);
    }
})();