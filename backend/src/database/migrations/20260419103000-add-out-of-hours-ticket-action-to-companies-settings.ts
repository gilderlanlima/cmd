import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("CompaniesSettings", "outOfHoursTicketAction", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("CompaniesSettings", "outOfHoursTicketAction");
  }
};
