interface Message {
    messageId: string;
    chatId: string;
    senderId: string;
    userIds: string[];
    createdAt: number;
    content: string;
};

export {
    Message
};