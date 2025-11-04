export default (sequelize, DataTypes) => {
  const Post = sequelize.define("Post", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    likeCounts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    repostCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: "posts",
    timestamps: true,
    freezeTableName: true,
  });

  Post.associate = (models) => {
    Post.hasMany(models.Media, {
      foreignKey: "postId",
      as: "media",
      onDelete: "CASCADE",
    });

    Post.hasMany(models.Repost, {
      foreignKey: "originalPostId",
      as: "reposts",
      onDelete: "CASCADE",
    });

    Post.belongsTo(models.UserRef, {
      foreignKey: "userId",
      as: "userInfo",
      onDelete: "CASCADE",
    });
  };

  return Post;
};