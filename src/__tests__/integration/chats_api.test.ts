import * as dotenv from 'dotenv';
import path from 'path';
import { initializeDatabase } from '@/api/database';
import { PostgresConfiguration } from '@/models/configuration';
import { 
    getChatByConnectionId,
    getChatByChatId,
    getChatsByUserId,
    addChat,
    updateChatLastUpdated,
    deleteChat,
    getMessagesByChatId,
    getMessagesByUserId,
    addMessage
} from '@/api/chats';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const DATABASE_URL = process.env.DATABASE_URL;

const initializeApis = async() => {
    const config = {
        connectionString: DATABASE_URL
    } as PostgresConfiguration;
    await initializeDatabase(config);
};

const chatsTest = async () => {
    console.log('Starting chatsTest ...');
    
    const chatId = 'chat123';
    const connectionId = 1;
    const userId1 = 'user1';
    const userId2 = 'user2';

    const newChat = await addChat(chatId, connectionId, userId1, userId2);
    console.log('New chat added:', newChat);

    const getChatById = await getChatByChatId(newChat.chatId);
    console.log('Get chat by ID:', getChatById);

    const getChatByConnection = await getChatByConnectionId(connectionId);
    console.log('Get chat by connection ID:', getChatByConnection);

    const chatsByUser = await getChatsByUserId(userId1);
    console.log('Get chats by user ID:', chatsByUser);

    // Test updateChatLastUpdated
    await updateChatLastUpdated(newChat.chatId, Date.now());
    const updatedChat = await getChatByChatId(newChat.chatId);
    console.log('Updated chat last updated:', updatedChat);

    // Test deleteChat
    await deleteChat(newChat.chatId);

    console.log('chatsTest completed');
};

const messagesWhereChatDontExistTest = async () => {
    console.log('Starting messagesTest ...');

    const chatId = 'chat123';
    const messageId = 'message123';
    const senderId = 'user1';
    const content = 'Hello, world!';
    try {
       const newMessage = await addMessage(messageId, chatId, senderId, content);
        console.log('New message added:', newMessage);
    } catch (error: any) {
        console.error(error.message);
    }
};

const messagesTest = async () => {
    console.log('Starting messagesTest ...');

    const chatId = 'chat123';
    const connectionId = 1;
    const userId1 = 'user1';
    const userId2 = 'user2';
    const messageId = 'message123';
    const senderId = userId1;
    const content = 'Hello, world!';

    try {
        const newChat = await addChat(chatId, connectionId, userId1, userId2);
        console.log('New chat added:', newChat);
        const newMessage = await addMessage(messageId, chatId, senderId, content);
        console.log('New message added:', newMessage);
        const retrievedMessages = await getMessagesByChatId(chatId);
        console.log('Retrieved messages:', retrievedMessages);
        const messagesByUser = await getMessagesByUserId(userId1);
        console.log('Messages by user:', messagesByUser);
    } catch (error: any) {
        console.error('Error during messages test:', error.message);
        throw error;
    } finally {
        try {
            await deleteChat(chatId);
            const messagesAfterDelete = await getMessagesByUserId(userId1);
            console.log('Messages after chat deletion:', messagesAfterDelete);
            console.log('Chat deleted successfully');
        } catch (deleteError) {
            console.error('Error deleting chat:', deleteError);
        }
    }
};

(async function main() {
    try {
        // test
        await initializeApis();

        await chatsTest();
        await messagesWhereChatDontExistTest();
        await messagesTest();
        console.log("🎉 All integration tests passed");
    } catch (err) {
        console.error("❌ Integration tests failed:", err);
        process.exit(1);
    }
})();