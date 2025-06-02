import * as dotenv from 'dotenv';
import path from 'path';
import amqp  from 'amqplib';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });


const RABBITMQ_URL = process.env.RABBITMQ_URL;

const createConnection = async (url: string): Promise<amqp.ChannelModel> => {
    try {
        const connection = await amqp.connect(url);
        console.log('Connected to RabbitMQ');
        return connection;
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        throw error;
    }
}
    const msg = { number: 19 };

const publishToQueue = async (
    connection: amqp.ChannelModel, 
    queueName: string, 
    message: any) => {
    
    let channel: amqp.Channel;
    try {
        channel = await connection.createChannel();
        const result = await channel.assertQueue(queueName, { durable: true });
        channel.sendToQueue(queueName, Buffer.from(
            JSON.stringify(message)
        ), { persistent: true });
        console.log('Message sent to RabbitMQ:', msg);      
    } catch (error) {
        console.error('Failed to publish to RabbitMQ', error);
        throw error;
    } finally {
        await channel!.close();  
    }
};

const consumeFromQueue = async (
    connection: amqp.ChannelModel, 
    queueName: string
) => {
    let channel: amqp.Channel;
    try {
        channel = await connection.createChannel();
        const result = await channel.assertQueue(queueName, { durable: true });
        console.log(`Waiting for messages in queue: ${queueName}`);
        
        channel.consume(queueName, (msg) => {
            console.log(`Received message from queue ${queueName}:`, msg?.content.toString());
            // channel.ack(msg!);  // Acknowledge the message
        }, {noAck: true}); // Automatically acknowledge messages
    } catch (error) {
        console.error(`Failed to consume from queue ${queueName}`, error);
        throw error;
    } finally {
        setTimeout(async () => {
            console.log('Closing consumer channel after delay...');
            await channel.close();
        }, 5000);
    }
};

const deleteQueue = async (connection: amqp.ChannelModel, queueName: string) => {
    let channel: amqp.Channel;
    try {
        channel = await connection.createChannel();
        const result = await channel.deleteQueue(queueName);
        console.log(`Queue ${queueName} deleted`, result);
    } catch (error) {
        console.error(`Failed to delete queue ${queueName}`, error);
        throw error;
    } finally {
        await channel!.close();  
    }
};

const closeConnection = async (connection: amqp.ChannelModel) => {
    try {
        setTimeout(async () => {
            console.log('Closing connection channel after delay...');
        await connection.close();
        }, 5000);
        console.log('RabbitMQ connection closed');
    } catch (error) {
        console.error('Failed to close RabbitMQ connection:', error);
    }
};

(async function main() {
    try {
        // sync test
        const connection = await createConnection(RABBITMQ_URL!);

        // promise tests in order
        await publishToQueue(connection, 'jobs', { number: 19 });
        // await deleteQueue(connection, 'jobs');
        await consumeFromQueue(connection, 'jobs');
        await closeConnection(connection);
        console.log("🎉 All integration tests passed");
    } catch (err) {
        console.error("❌ Integration tests failed:", err);
        process.exit(1);
    }
})();