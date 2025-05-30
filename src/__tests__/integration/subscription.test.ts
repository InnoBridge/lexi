import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { 
    initializeTRPCClient, 
    onUpdate
} from '@/trpc/client/api';

const SERVER_URL = process.env.SERVER_URL;

const userId = process.argv[2] || 'default-user-123';

async function testClient() {
    console.log('Starting TRPC client tests...');
    await onUpdate(userId);
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