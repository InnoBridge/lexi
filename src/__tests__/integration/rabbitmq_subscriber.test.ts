import * as dotenv from 'dotenv';
import path from 'path';
import { RabbitMQClient } from '@/queue/rabbitmq_client';
import { QueueClient } from '@/queue/queue_client';
import { Message } from '@/models/message';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const userId = process.argv[2] || 'default-user-123';

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

const subscribeToUserQueue = async (client: QueueClient, userId: string): Promise<void> => {
    console.log(`Subscribing to user queue for userId: ${userId}`);
    try {
        await client.subscribeUser(userId, (message) => {
            console.log(`Received message for user ${userId}:`, message.content);
        });
        console.log(`Subscribed to user queue ${userId} successfully`);
    } catch (error) {
        console.error(`Failed to subscribe to user queue ${userId}:`, error);
        throw error;
    }
}

(async function main() {
    try {
        const client = await initializationClient(RABBITMQ_URL!);
        
        await subscribeToUserQueue(client, userId);
        
        // setTimeout(async () => {
        //     console.log('Closing connection channel after delay...');
        //     await client.unsubscribeUser(userId);
        // }, 5000);

        console.log("🎉 RabbitMQ Subscriber integration test passed");
    } catch (err) {
        console.error("❌ RabbitMQ Subscriber integration test failed:", err);
        process.exit(1);
    }
})();
