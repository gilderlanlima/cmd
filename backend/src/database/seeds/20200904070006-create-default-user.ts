import { QueryInterface } from "sequelize";
import { hash } from "bcryptjs";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async t => {
      const [userRows] = await queryInterface.sequelize.query(
        'SELECT 1 FROM "Users" WHERE id = 1 LIMIT 1',
        { transaction: t }
      );
      const userExists = Array.isArray(userRows) && userRows.length > 0;

      if (!userExists) {
        const passwordHash = await hash("bolso1234", 8);
        return queryInterface.bulkInsert('Users', [{
          name: "Admin",
          email: "admin@ideianobolso.com",
          profile: "admin",
          passwordHash,
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          super: true
        }], { transaction: t });
      }
    });
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Users", { id: 1 });
  }
};
