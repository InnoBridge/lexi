import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { 
    initializeTRPCClient, 
    getHello, 
    greetings, 
    getUser,
    get,
    update,
    log,
    secretData
} from '@/trpc/client/api';

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


(async function main() {
    try {
        // sync test
        initializeTRPCClient(SERVER_URL!);

        // promise tests in order
        await testClient();
 

        console.log("🎉 All integration tests passed");
    } catch (err) {
        console.error("❌ Integration tests failed:", err);
        process.exit(1);
    }
})();