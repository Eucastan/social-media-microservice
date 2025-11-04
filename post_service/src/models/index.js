import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";
import PostModel from "./Post.js";
import MediaModel from "./Media.js";
import RepostModel from "./Repost.js";
import UserRefModel from "./UserRef.js";
import { logger } from "../config/logger.js";

// Initialize models
const Post = PostModel(sequelize, DataTypes);
const Media = MediaModel(sequelize, DataTypes);
const Repost = RepostModel(sequelize, DataTypes);
const UserRef = UserRefModel(sequelize, DataTypes);

// Define associations
const models = { Post, Media, Repost, UserRef };

if (Post.associate) Post.associate(models);
if (Media.associate) Media.associate(models);
if (Repost.associate) Repost.associate(models);
if (UserRef.associate) UserRef.associate(models);

export async function syncModels() {
  try {
    await sequelize.authenticate();
    logger.info("Database connection established successfully.");

    await sequelize.sync({ alter: true }); // Change to false in production
    logger.info("All models were synchronized successfully.");
    
  } catch (error) {
    logger.error("Error syncing database:", error);
    throw error;
  }
}


export { sequelize, Post, Media, Repost, UserRef };
