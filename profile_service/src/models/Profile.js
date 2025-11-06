export default (sequelize, DataTypes) => {
  const Profile = sequelize.define('Profile', {
    userId: { 
        type: DataTypes.INTEGER, 
        primaryKey: true,
        unique: true
    }, 
    displayName: { 
        type: DataTypes.STRING(100), 
        allowNull: true 
    },
    bio: { 
        type: DataTypes.TEXT, 
        allowNull: true 
    },
    location: { 
        type: DataTypes.STRING(100), 
        allowNull: true 
    },
    avatarKey: { 
        type: DataTypes.STRING, 
        allowNull: true 
    }, // s3 key
    avatarUrl: { 
        type: DataTypes.STRING, 
        allowNull: true 
    }, // public url
    coverKey: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
    coverUrl: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
    socialLinks: { 
        type: DataTypes.JSON, 
        allowNull: true 
    },
  }, {
    tableName: 'profiles',
    timestamps: true,
  });

  return Profile;
};
