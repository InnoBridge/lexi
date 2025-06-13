import { isDatabaseClientSet, getDatabaseClient } from '@/api/database';
import { Chat, Message } from '@/models/chats';

const getChatByConnectionId = async (connectionId: number): Promise<Chat | null> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    return await getDatabaseClient()!.getChatByConnectionId(connectionId);
};

const getChatByChatId = async (chatId: string): Promise<Chat | null> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    return await getDatabaseClient()!.getChatByChatId(chatId);
};

const getChatsByUserId = async (chatId: string, updatedAfter?: number, limit?: number, offset?: number): Promise<Chat[]> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    return await getDatabaseClient()!.getChatsByUserId(chatId, updatedAfter, limit, offset);
};

const addChat = async (chatId: string, connectionId: number, userId1: string, userId2: string): Promise<Chat> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    return await getDatabaseClient()!.addChat(chatId, connectionId, userId1, userId2);
};

const updateChatLastUpdated = async (chatId: string, updatedAt: number): Promise<Chat | null> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    return await getDatabaseClient()!.updateChatLastUpdated(chatId, updatedAt);
};

const deleteChat = async (chatId: string): Promise<void> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    return await getDatabaseClient()!.deleteChat(chatId);
};

const getMessagesByChatId = async (chatId: string, createdAfter?: number, limit?: number, offset?: number): Promise<Message[]> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    return await getDatabaseClient()!.getMessagesByChatId(chatId, createdAfter, limit, offset);
};

const getMessagesByUserId = async (userId: string, createdAfter?: number, limit?: number, offset?: number): Promise<Message[]> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    return await getDatabaseClient()!.getMessagesByUserId(userId, createdAfter, limit, offset);
};

const addMessage = async (messageId: string, chatId: string, senderId: string, content: string): Promise<Message> => {
    if (!isDatabaseClientSet()) {
        throw new Error("Database client not initialized. Call initializeDatabase first.");
    }
    return await getDatabaseClient()!.addMessage(messageId, chatId, senderId, content);
};

export {
    getChatByConnectionId,
    getChatByChatId,
    getChatsByUserId,
    addChat,
    updateChatLastUpdated,
    deleteChat,
    getMessagesByChatId,
    getMessagesByUserId,
    addMessage
};