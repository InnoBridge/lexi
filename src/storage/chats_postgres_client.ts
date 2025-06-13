import { PoolClient } from 'pg';
import { BasePostgresClient } from '@/storage/base_postgres_client';
import { ChatsDatabaseClient } from '@/storage/chats_database_client';
import {
    CREATE_CHATS_TABLE_QUERY,
    INDEX_CHATS_QUERY,
    CREATE_MESSAGES_TABLE_QUERY,
    INDEX_MESSAGES_QUERY,
    GET_CHAT_BY_CONNECTION_ID_QUERY,
    GET_CHAT_BY_CHAT_ID_QUERY,
    GET_CHATS_BY_USER_ID_QUERY,
    ADD_CHAT_QUERY,
    UPDATE_CHAT_LAST_UPDATED_QUERY,
    DELETE_CHAT_QUERY,
    GET_MESSAGES_BY_CHAT_ID_QUERY,
    GET_MESSAGES_BY_USER_ID_QUERY,
    ADD_MESSAGE_QUERY
} from '@/storage/queries';
import { PostgresConfiguration } from '@/models/configuration';
import { Chat, Message } from '@/models/chats';

class ChatsPostgresClient extends BasePostgresClient implements ChatsDatabaseClient {
    constructor(config: PostgresConfiguration) {
        super(config);

        // Register migration for chats and messages tables
        this.registerMigration(0, async (client: PoolClient) => {
            await this.createChatsTable(client);
            await this.createMessagesTable(client);
            await this.queryWithClient(client, INDEX_CHATS_QUERY);
            await this.queryWithClient(client, INDEX_MESSAGES_QUERY);
        });
    }

    async createChatsTable(client: PoolClient): Promise<void> {
        await this.queryWithClient(client, CREATE_CHATS_TABLE_QUERY);
    }

    async createMessagesTable(client: PoolClient): Promise<void> {
        await this.queryWithClient(client, CREATE_MESSAGES_TABLE_QUERY);
    }

    async getChatByConnectionId(connectionId: number): Promise<Chat | null> {
        const result = await this.query(GET_CHAT_BY_CONNECTION_ID_QUERY, [connectionId]);
        if (result.rows.length === 0) {
            return null;
        }
        return mapToChat(result.rows[0]);
    }

    async getChatByChatId(chatId: string): Promise<Chat | null> {
        const result = await this.query(GET_CHAT_BY_CHAT_ID_QUERY, [chatId]);
        if (result.rows.length === 0) {
            return null;
        }
        return mapToChat(result.rows[0]);
    }

    async getChatsByUserId(
        userId: string, 
        updatedAfter?: number, 
        limit: number = 20, 
        offset: number = 0
    ): Promise<Chat[]> {
        const result = await this.query(GET_CHATS_BY_USER_ID_QUERY, [
            userId,
            updatedAfter || null,
            limit,
            offset
        ]);
        return result.rows.map(mapToChat);
    }

    async addChat(
        chatId: string, 
        connectionId: number, 
        userId1: string, 
        userId2: string
    ): Promise<Chat> {
        const result = await this.query(ADD_CHAT_QUERY, [chatId, connectionId, userId1, userId2]);
        return mapToChat(result.rows[0]);
    }


    async updateChatLastUpdated(chatId: string, updatedAt: number): Promise<Chat | null> {
        const result = await this.query(UPDATE_CHAT_LAST_UPDATED_QUERY, [chatId, updatedAt]);
        if (result.rows.length === 0) {
            return null;
        }
        return mapToChat(result.rows[0]);
    }

    async deleteChat(chatId: string): Promise<void> {
        await this.query(DELETE_CHAT_QUERY, [chatId]);
    }

    async getMessagesByChatId(
        chatId: string,
        createdAfter?: number, 
        limit: number = 50, 
        offset: number = 0
    ): Promise<Message[]> {
        const result = await this.query(GET_MESSAGES_BY_CHAT_ID_QUERY, [
            chatId, 
            createdAfter || null,
            limit, 
            offset
        ]);
        return result.rows.map(mapToMessage);
    }

    async getMessagesByUserId(
        userId: string, 
        createdAfter?: number, 
        limit: number = 50, 
        offset: number = 0
    ): Promise<Message[]> {
        const result = await this.query(GET_MESSAGES_BY_USER_ID_QUERY, [
            userId, 
            createdAfter || null,
            limit, 
            offset
        ]);
        return result.rows.map(mapToMessage);
    }

    async addMessage(
        messageId: string,
        chatId: string,
        senderId: string,
        content: string
    ): Promise<Message> {
        const client = await this.pool.connect();
        try {
            await this.queryWithClient(client, 'BEGIN');  // Start transaction
            const result = await this.queryWithClient(client, ADD_MESSAGE_QUERY, [
                messageId, 
                chatId, 
                senderId, 
                content
            ]);
            const message = mapToMessage(result.rows[0]);
            await this.queryWithClient(client, UPDATE_CHAT_LAST_UPDATED_QUERY, [message.chatId, message.createdAt]);
            await this.queryWithClient(client, 'COMMIT');
            return message;
        } catch (error) {
            await this.queryWithClient(client, 'ROLLBACK');
            console.error('Failed to add message for chat: ', chatId, error);
            throw error;
        } finally {
            client.release();
        }
    }
}

const mapToChat = (row: any): Chat => {
    return {
        chatId: row.chat_id,
        connectionId: row.connection_id,
        userId1: row.user_id1,
        userId2: row.user_id2,
        createdAt: new Date(row.created_at).getTime(),
        updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined
    };
};

const mapToMessage = (row: any): Message => {
    return {
        messageId: row.message_id,
        chatId: row.chat_id,
        senderId: row.sender_id,
        content: row.content,
        createdAt: new Date(row.created_at).getTime()
    };
};

export {
    ChatsPostgresClient
};