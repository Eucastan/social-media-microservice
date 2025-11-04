import sequelize from '../configs/database.js';
import pkg from 'sequelize';
const { DataTypes } = pkg;
import UserModel from './User.js';

export const User = UserModel(sequelize, DataTypes);

export async function syncModels() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true }); 
}

export { sequelize };