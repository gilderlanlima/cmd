import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Tickets", "lastMessageAt", {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    });

    // Preenche tickets existentes com a data da ultima mensagem real,
    // em vez de depender de updatedAt (que pode ter sido tocado por
    // outras rotinas, como reatribuicao automatica de fila).
    await queryInterface.sequelize.query(`
      UPDATE "Tickets"
      SET "lastMessageAt" = "lastMsg"."createdAt"
      FROM (
        SELECT DISTINCT ON ("ticketId") "ticketId", "createdAt"
        FROM "Messages"
        ORDER BY "ticketId", "createdAt" DESC
      ) AS "lastMsg"
      WHERE "Tickets".id = "lastMsg"."ticketId"
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Tickets", "lastMessageAt");
  }
};
