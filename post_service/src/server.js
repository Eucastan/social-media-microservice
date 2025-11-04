import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { syncModels } from './models/index.js'; 
import { connectMQ } from './config/mq.js';
import { handleUserEvents } from "./consumers/userConsumer.js";    
import { logger } from './config/logger.js';

const PORT = process.env.PORT || 6000;

async function start() {
  try {
    await syncModels();

    // RabbitMQ connection
    await connectMQ();
    logger.info("Connected to message queue");

    await handleUserEvents();

    app.listen(PORT, () => {
      console.log(`Post service listening on port ${PORT}`);
      logger.info(`Post service started on port ${PORT}`);
    });
    
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
