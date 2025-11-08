import dotenv from 'dotenv';
dotenv.config();
import { Op } from 'sequelize';
import { Status } from '../models/index.js';
import { publishEvent } from '../config/mq.js';
import logger from '../config/logger.js';

export async function startExpireWorker() {
  const intervalSec = Number(process.env.EXPIRE_CHECK_INTERVAL_SECONDS || 60);
  logger.info('Starting expire worker, interval %d seconds', intervalSec);

  async function checkExpired() {
    try {
      const now = new Date();
      const [count] = await Status.update(
        { expired: true },  // values to update
        { where: { expired: false, expiresAt: { [Op.lte]: now } } }
      );

      if (count === 0) return;

      const expiredRows = await Status.findAll({
        where: { 
          expired: false, 
          expiresAt: { [Op.lte]: now } 
        }
      });


      for (const s of expiredRows) {
        s.expired = true;
        await s.save();
        const exchange = process.env.EVENT_EXCHANGE || "social.events";
        await publishEvent(exchange, 'status.expired', { 
          event: 'status.expired',
          service: 'status-service',
          timestamp: new Date().toISOString(),
          data: { id: s.id, userId: s.userId }
        });

        logger.info('Status expired %s by user %s', s.id, s.userId);
      }
    } catch (err) {
      logger.error('Expire worker error: %o', err);
    }
  }

  // run immediately then interval
  await checkExpired();
  setInterval(checkExpired, intervalSec * 1000);
}
