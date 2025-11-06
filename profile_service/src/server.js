import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';
import logger from './config/logger.js';
import { syncModels } from './models/index.js';
import { connectMQ } from './config/mq.js';

const PORT = Number(process.env.PORT || 5001);

(async () => {
  try {
    await syncModels();

    await connectMQ();
    
    app.listen(PORT, () => logger.info(`Profile Service running on ${PORT}`));
  } catch (err) {
    logger.error('Failed to start: %o', err);
    process.exit(1);
  }
})();

