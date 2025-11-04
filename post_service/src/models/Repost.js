export default (sequelize, DataTypes) => {
  const Repost = sequelize.define("Repost", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    originalPostId: {
      type: DataTypes.INTEGER, 
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: "repost",
    timestamps: true,
    freezeTableName: true,
  });

  Repost.associate = (models) => {
    Repost.belongsTo(models.Post, {
      foreignKey: "originalPostId",
      as: "originalPost",
      onDelete: "CASCADE",
    });

    Repost.belongsTo(models.UserRef, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return Repost;
};