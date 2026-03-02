export default (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define(
    "RefreshToken",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isRevoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: "refresh_tokens",
    }
  );

  // Associations
  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, { foreignKey: "userId" });
  };

  return RefreshToken;
};
