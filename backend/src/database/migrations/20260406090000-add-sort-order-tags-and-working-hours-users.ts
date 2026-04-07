import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Tags", "sortOrder", {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn("Users", "workingHours", {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null
    });

    await queryInterface.sequelize.query(`
      UPDATE "Tags"
      SET "sortOrder" = "ordered"."rownum"
      FROM (
        SELECT id, ROW_NUMBER() OVER (
          PARTITION BY "companyId", kanban
          ORDER BY "createdAt" ASC, id ASC
        ) AS rownum
        FROM "Tags"
      ) AS "ordered"
      WHERE "Tags".id = "ordered".id
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Users", "workingHours");
    await queryInterface.removeColumn("Tags", "sortOrder");
  }
};
