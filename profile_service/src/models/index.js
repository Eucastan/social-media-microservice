import sequelize from '../config/database.js';
import pkg from 'sequelize';
const { DataTypes } = pkg;
import ProfileModel from './Profile.js';

export const Profile = ProfileModel(sequelize, DataTypes);

export async function syncModels() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true }); 
}

export { sequelize };