import { BaseDatabaseClient } from './base_database_client';
import { Chat, Message } from '@/models/chats';

interface ChatsDatabaseClient extends BaseDatabaseClient {
    getChatByConnectionId(connectionId: number): Promise<Chat | null>;
    getChatByChatId(chatId: string): Promise<Chat | null>;
    getChatsByUserId(userId: string, updatedAfter?: number, limit?: number, offset?: number): Promise<Chat[]>;
    addChat(chatId: string, connectionId: number, userId1: string, userId2: string): Promise<Chat>;
    updateChatLastUpdated(chatId: string, updatedAt: number): Promise<Chat | null>;
    deleteChat(chatId: string): Promise<void>;
    getMessagesByChatId(chatId: string, createdAfter?: number, limit?: number, offset?: number): Promise<Message[]>;
    getMessagesByUserId(userId: string, createdAfter?: number, limit?: number, offset?: number): Promise<Message[]>;
    addMessage(messageId: string, chatId: string, senderId: string, content: string): Promise<Message>;
};

export {
    ChatsDatabaseClient,
};