import amqp from 'amqplib';

// await channel.assertQueue('user-123', { durable: true });
// channel.sendToQueue('user-123', Buffer.from(msg), { persistent: true });
const msg = { number: 19 };
const connect = async (url: string) => {
    try {
        const connection = await amqp.connect(url);
        const channel = await connection.createChannel();
        const result = await channel.assertQueue("jobs");
        channel.sendToQueue("jobs", Buffer.from(
            JSON.stringify(msg)
        ), { persistent: true });
        console.log('Message sent to RabbitMQ:', msg);      
        await channel.close();  

        console.log('Connected to RabbitMQ');
        return connection;
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        throw error;
    }
};

export {
    connect
};