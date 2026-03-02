"use strict";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("refresh_tokens", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      token: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users", 
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      isRevoked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("refresh_tokens");
  },
};