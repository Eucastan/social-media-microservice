import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import logger from './config/logger.js';
import { syncModels } from './models/index.js';
import { connectMQ } from './config/mq.js';
import { startExpireWorker } from './utils/expireWorker.js';

const PORT = Number(process.env.PORT || 6030);

(async () => {
  try {
    await syncModels();

    await connectMQ();
    logger.info('RabbitMQ ready');

    // start worker that marks expired statuses and publishes events
    startExpireWorker();

    app.listen(PORT, () => {
      logger.info(`Status Service listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
})();
