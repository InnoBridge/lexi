import { 
    initializeQueue,
    subscribeUser
} from '@/api/queue';

const userId = process.argv[2] || 'default-user-123';

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

const subscribeToUserQueue = async (userId: string): Promise<void> => {
    console.log(`Subscribing to user queue for userId: ${userId}`);
    try {
        await subscribeUser(userId, (message) => {
            console.log(`Received message for user ${userId}:`, message.content);
        });
        console.log(`Subscribed to user queue ${userId} successfully`);
    } catch (error) {
        console.error(`Failed to subscribe to user queue ${userId}:`, error);
        throw error;
    }
};

(async function main() {
    try {
        // Initialize RabbitMQ client
        await initializeQueueTest(RABBITMQ_URL!);

        await subscribeToUserQueue(userId);
        console.log("🎉 RabbitMQ Subscriber integration test passed");
    } catch (err) {
        console.error("❌ RabbitMQ Subscriber integration test failed:", err);
        process.exit(1);
    }
})();