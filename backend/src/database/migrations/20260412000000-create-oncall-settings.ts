import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("OnCallSettings", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      phone: {
        type: DataTypes.STRING,
        allowNull: false
      },
      intervalMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 15
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      schedules: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      lastNotificationAt: {
        type: DataTypes.DATE,
        allowNull: true
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

    await queryInterface.addIndex("OnCallSettings", ["companyId"], {
      name: "idx_oncall_company_id"
    });

    await queryInterface.addIndex("OnCallSettings", ["userId"], {
      name: "idx_oncall_user_id"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("OnCallSettings", "idx_oncall_user_id");
    await queryInterface.removeIndex("OnCallSettings", "idx_oncall_company_id");
    await queryInterface.dropTable("OnCallSettings");
  }
};
