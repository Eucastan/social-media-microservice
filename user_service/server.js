import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import logger from './src/configs/logger.js';
import { syncModels } from './src/models/index.js';
import { connectMQ } from './src/configs/mq.js';

const PORT = Number(process.env.PORT || 5000);

(async () => {
  try {
    await syncModels();
    logger.info("Database synced");

    await connectMQ();
    logger.info("Connected to RabbitMQ");

    app.listen(PORT, () => logger.info(`User Service running on ${PORT}`));
  } catch (err) {
    logger.error('Failed to start: %o', err);
    process.exit(1);
  }
})();