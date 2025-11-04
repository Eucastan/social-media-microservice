import dotenv from "dotenv";
dotenv.config();

import amqp from "amqplib";
import { logger } from "./logger.js";

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

const consume = async (exchange, queue, routingKeys = [], onMessage) => {
  const ch = await ensureChannel();
  await ch.assertExchange(exchange, 'topic', { durable: true });
  const q = await ch.assertQueue(queue, { durable: true });

  for (const key of routingKeys) {
    await ch.bindQueue(q.queue, exchange, key);
  }

  await ch.consume(q.queue, (msg) => {
    if (msg !== null) {
      try {
        const content = JSON.parse(msg.content.toString());
        onMessage(content);

      } catch (err) {
        logger.error("Failed to parse message", err);

      } finally {
        ch.ack(msg);
        
      }
    }
  });
  logger.info(`Consumer listening on queue "${queue}" for keys: ${routingKeys}`);
};


process.on('SIGINT', async () => {
  if (connection) {
    await connection.close();
    logger.info('RabbitMQ connection closed gracefully');
  }
  process.exit(0);
});

export { connectMQ, publishEvent, consume };
