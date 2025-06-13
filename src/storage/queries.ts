const CREATE_VERSION_TABLE_QUERY = 
    `CREATE TABLE IF NOT EXISTS messenger_schema_versions (
        version INTEGER PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`;

const GET_SCHEMA_VERSION_QUERY = 
    `SELECT COALESCE(MAX(version), 0) as version FROM user_schema_versions`;

const UPDATE_SCHEMA_VERSION_QUERY = 
    `INSERT INTO messenger_schema_versions (version) VALUES ($1)`;

const CREATE_CHATS_TABLE_QUERY = 
    `CREATE TABLE IF NOT EXISTS chats (
        chat_id        TEXT PRIMARY KEY,
        connection_id  INTEGER NOT NULL,
        user_id1       TEXT NOT NULL,
        user_id2       TEXT NOT NULL,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ,
        CONSTRAINT chk_user_order CHECK (user_id1 < user_id2)
    )`;

const INDEX_CHATS_QUERY = 
    `CREATE INDEX IF NOT EXISTS idx_chats_user_id1 ON chats(user_id1);
     CREATE INDEX IF NOT EXISTS idx_chats_user_id2 ON chats(user_id2);
     CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at);
     CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at);`;

const CREATE_MESSAGES_TABLE_QUERY = 
    `CREATE TABLE IF NOT EXISTS messages (
        message_id     TEXT PRIMARY KEY,
        chat_id        TEXT NOT NULL,
        sender_id      TEXT NOT NULL,
        content        TEXT NOT NULL,
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_messages_chat 
            FOREIGN KEY (chat_id) REFERENCES chats(chat_id) ON DELETE CASCADE
    )`;

const INDEX_MESSAGES_QUERY =
    `CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
     CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
     CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at DESC);
     CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);`;

const GET_CHAT_BY_CONNECTION_ID_QUERY = 
    `SELECT chat_id, connection_id, user_id1, user_id2, created_at, updated_at
     FROM chats 
     WHERE connection_id = $1`;

const GET_CHAT_BY_CHAT_ID_QUERY = 
    `SELECT chat_id, connection_id, user_id1, user_id2, created_at, updated_at
     FROM chats 
     WHERE chat_id = $1`;

const GET_CHATS_BY_USER_ID_QUERY = 
    `SELECT chat_id, connection_id, user_id1, user_id2, created_at, updated_at
     FROM chats 
     WHERE (user_id1 = $1 OR user_id2 = $1)
       AND ($2::BIGINT IS NULL OR updated_at > to_timestamp($2::BIGINT/1000.0) OR (updated_at IS NULL AND created_at > to_timestamp($2::BIGINT/1000.0)))
     ORDER BY updated_at DESC NULLS LAST, created_at DESC
     LIMIT $3 OFFSET $4`;

const ADD_CHAT_QUERY = 
    `INSERT INTO chats (chat_id, connection_id, user_id1, user_id2)
     VALUES ($1, $2, $3, $4)
     RETURNING chat_id, connection_id, user_id1, user_id2, created_at, updated_at`;

const UPDATE_CHAT_LAST_UPDATED_QUERY = 
    `UPDATE chats 
     SET updated_at = to_timestamp($2::BIGINT/1000.0)
     WHERE chat_id = $1
     RETURNING chat_id, connection_id, user_id1, user_id2, created_at, updated_at`;

const DELETE_CHAT_QUERY = 
    `DELETE FROM chats WHERE chat_id = $1`;

const GET_MESSAGES_BY_CHAT_ID_QUERY = 
    `SELECT message_id, chat_id, sender_id, content, created_at
     FROM messages 
     WHERE chat_id = $1
       AND ($2::BIGINT IS NULL OR created_at > to_timestamp($2::BIGINT/1000.0))
     ORDER BY created_at DESC
     LIMIT $3 OFFSET $4`;

const GET_MESSAGES_BY_USER_ID_QUERY = 
    `SELECT m.message_id, m.chat_id, m.sender_id, m.content, m.created_at
     FROM messages m
     JOIN chats c ON m.chat_id = c.chat_id
     WHERE (c.user_id1 = $1 OR c.user_id2 = $1)
       AND ($2::BIGINT IS NULL OR m.created_at > to_timestamp($2::BIGINT/1000.0))
     ORDER BY m.created_at DESC
     LIMIT $3 OFFSET $4`;

const ADD_MESSAGE_QUERY = 
    `INSERT INTO messages (message_id, chat_id, sender_id, content)
     VALUES ($1, $2, $3, $4)
     RETURNING message_id, chat_id, sender_id, content, created_at`;

export {
    CREATE_VERSION_TABLE_QUERY,
    GET_SCHEMA_VERSION_QUERY,
    UPDATE_SCHEMA_VERSION_QUERY,
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
};