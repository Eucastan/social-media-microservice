export default (sequelize, DataTypes) => {
  const Media = sequelize.define("Media", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mediaUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mediaType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    storageKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: "media",
    timestamps: true,
    freezeTableName: true, // avoid Sequelize pluralizing
  });

  Media.associate = (models) => {
    Media.belongsTo(models.Post, {
      foreignKey: "postId",
      as: "post",
      onDelete: "CASCADE",
    });
  };

  return Media;
};