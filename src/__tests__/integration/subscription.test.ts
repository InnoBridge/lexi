import * as dotenv from 'dotenv';
import path from 'path';
import { 
    initializeTRPCClient, 
    onUpdate,
    subscribeToMessages
} from '@/trpc/client/api';
import { Message } from '@/models/message';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });


const SERVER_URL = process.env.SERVER_URL;

const userId = process.argv[2] || 'default-user-123';

// async function testClient() {
//     console.log('Starting TRPC client tests...');
//     await onUpdate(userId);
// };

const subscribeToMessagesTest = async () => {
    console.log('Starting message subscription test...');
    const messages: Message[] = [];
    const subscription = await subscribeToMessages(userId, (message: Message) => {
        console.log('Received message:', JSON.stringify(message, null, 2));
        messages.push(message);
    });
    console.log("Read messages:", messages);
    console.log('Subscribed to messages for user:', userId);
};

(async function main() {
    try {
        // sync test
        initializeTRPCClient(SERVER_URL!);

        // promise tests in order
        // await testClient();
        await subscribeToMessagesTest();

        console.log("🎉 All integration tests passed");
    } catch (err) {
        console.error("❌ Integration tests failed:", err);
        process.exit(1);
    }
})();