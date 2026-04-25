import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Users", "followMeEnabled", {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn("Users", "followMePhone", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ""
    });

    await queryInterface.addColumn("Users", "followMeWhatsappId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Whatsapps",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });

    await queryInterface.addColumn("Users", "followMeSchedule", {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Users", "followMeSchedule");
    await queryInterface.removeColumn("Users", "followMeWhatsappId");
    await queryInterface.removeColumn("Users", "followMePhone");
    await queryInterface.removeColumn("Users", "followMeEnabled");
  }
};
