import dotenv from "dotenv";
dotenv.config();

import amqp from "amqplib";
import logger from "./logger.js";

let connection = null;
let channel = null;
let retryTimeout = null;

const connectMQ = async () => {
  const url = process.env.RABBITMQ_URL || "amqp://localhost";
  try {
    connection = await amqp.connect(url);
    channel = await connection.createConfirmChannel();

    logger.info("RabbitMQ connected successfully");

    connection.on("error", (err) => {
      logger.error("RabbitMQ connection error:", err);
      
    });

    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed, retrying...");
      //To prevent infinite retry loops if the connection fails instantly many times, you can throttle retries slightly.
      if (!retryTimeout) {
        retryTimeout = setTimeout(() => {
          retryTimeout = null;
          connectMQ();
        }, 5000);
      }
    });

    channel.on("error", (err) => {
      logger.error("RabbitMQ channel error:", err);
    });

    channel.on("close", () => {
      logger.warn("RabbitMQ channel closed, recreating...");
      connectMQ();
    });

    return channel;
  } catch (err) {
    logger.error("RabbitMQ connect error", err);
    if (!retryTimeout) {
      retryTimeout = setTimeout(() => {
        retryTimeout = null;
        connectMQ();
      }, 5000);
    }
  }
};

const ensureChannel = async () => {
  if (!channel) {
    logger.info("No active channel. Reconnecting...");
    await connectMQ();
  }
  return channel;
};

const publishEvent = async (exchange, routingKey, data) => {
  if (!exchange || !routingKey) {
    throw new Error("Exchange and routingKey are required");
  }
  
  const confirmChannel = await ensureChannel();
  await confirmChannel.assertExchange(exchange, "topic", { durable: true });
  
  const message = Buffer.from(JSON.stringify(data));
  
  await new Promise((resolve, reject) => {
    confirmChannel.publish(
      exchange, 
      routingKey, 
      message, 
      { persistent: true }, 
      (err, ok) => (err ? reject(err) : resolve(ok))
    );
  });

  logger.info(`Event published: ${exchange} -> ${routingKey}`);

};

export async function consumeUser(){
  if (!channel) throw new Error('RabbitMQ not ready');

  const exchange = process.env.EVENT_EXCHANGE || 'social.events';
  await channel.assertExchange(exchange, "topic", { durable: true });

  const q = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(q.queue, exchange, "user.created");
  
  channel.consume(q.queue, async (msg) => {
    if (!msg) return;
    const data = JSON.parse(msg.content.toString());

    logger.info('Received user.created event: %o', data);

    // Create a blank profile when a new user is created
    await Profile.create({ 
      userId: data.userId,
      displayName: data.displayName || '',
      bio: '',
      location: '',
      socialLinks: {},
      avatarUrl: null,
      coverUrl: null,
    });

    const exchange = process.env.EVENT_EXCHANGE || "social.events";
    await publishEvent(exchange, 'profile.created', { 
      userId: data.userId 
    });
    
    logger.info(`Profile created for user ${data.userId}`);

    channel.ack(msg);
  });
}

process.on("SIGINT", async () => {
  if (connection) {
    await connection.close();
    logger.info("RabbitMQ connection closed gracefully");
  }
  process.exit(0);
});

export { connectMQ, publishEvent };