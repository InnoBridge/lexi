import * as dotenv from 'dotenv';
import path from 'path';
import { 
    initializeTRPCClient, 
    getHello, 
    greetings, 
    getUser,
    get,
    update,
    log,
    secretData,
    publishMessage,
    cleanup
} from '@/trpc/client/api';
import { Message } from '@/models/message';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SERVER_URL = process.env.SERVER_URL;


async function testClient() {
    console.log('Starting TRPC client tests...');
    console.log('getHello response:', await getHello());
    console.log('greetings response:', await greetings('Example User'));
    console.log('getUser response:', await getUser());
    console.log('get response:', await get({userId: "123"}));
    console.log('update response:', await update({userId: "123", name: "Updated User"}));
    console.log('Logging message response:', await log('Hello from the client!'));
    console.log('Secret data response:', await secretData());
};

const sendMessage = async () => {
    console.log('Starting message publishing test...');
    const message: Message = 
        {
            chatId: 'chat-123',
            messageId: 'message-123',
            userIds: ['123', '456'],
            senderId: '123',
            content: 'Hello, this is a new test message!',
            createdAt: new Date().getTime(),
        };

    await publishMessage(message);
    console.log('Message published successfully');
};

(async function main() {
    try {
        // sync test
        initializeTRPCClient(SERVER_URL!);

        // promise tests in order
        // await testClient();
        await sendMessage();

        console.log("🎉 All integration tests passed");

        cleanup(); // Cleanup after tests
    } catch (err) {
        console.error("❌ Integration tests failed:", err);
        process.exit(1);
    }
})();