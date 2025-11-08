import SequelizePkg from 'sequelize';
import sequelize from '../config/database.js';
import StatusModel from './Status.js';
import logger from "../config/logger.js";

const { DataTypes } = SequelizePkg;

export const Status = StatusModel(sequelize, DataTypes);

export async function syncModels() {
  try {
    await sequelize.authenticate();
    logger.info("Database authentication successful");

    await sequelize.sync({ alter: true });
    logger.info("Database synced successfully");

  } catch (error) {
    logger.error("Failed to sync");
    throw error;
  }
}

export { sequelize };