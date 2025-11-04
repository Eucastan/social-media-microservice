export default (sequelize, DataTypes) => {
  const UserRef = sequelize.define("UserRef", {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: "user_ref",
    timestamps: true,
    freezeTableName: true,
  });

  UserRef.associate = (models) => {
    UserRef.hasMany(models.Post, {
      foreignKey: "userId",
      as: "posts",
      onDelete: "CASCADE",
    });

    UserRef.hasMany(models.Repost, {
      foreignKey: "userId",
      as: "reposts",
      onDelete: "CASCADE",
    });
  };

  return UserRef;
};