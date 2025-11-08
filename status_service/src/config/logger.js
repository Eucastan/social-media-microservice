import { createLogger, format, transports } from 'winston';
import dotenv from 'dotenv';
dotenv.config();

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(), 
    format.errors({ stack: true }), 
    format.json()
  ),
  defaultMeta: { service: 'status-service' },
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error', maxsize: 5_000_000 }),
    new transports.File({ filename: 'logs/combined.log', maxsize: 10_000_000 })
  ]
});

export default logger;
