import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("Stories", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      caption: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      mediaPath: {
        type: DataTypes.STRING,
        allowNull: false
      },
      mediaName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      mediaType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex("Stories", ["companyId"]);
    await queryInterface.addIndex("Stories", ["userId"]);
    await queryInterface.addIndex("Stories", ["isActive", "expiresAt"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("Stories");
  }
};
