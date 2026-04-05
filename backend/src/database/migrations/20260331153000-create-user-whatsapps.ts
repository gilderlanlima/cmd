module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("UserWhatsapps", {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      whatsappId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Whatsapps", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addConstraint("UserWhatsapps", {
      fields: ["userId", "whatsappId"],
      type: "unique",
      name: "user_whatsapps_user_whatsapp_unique"
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint(
      "UserWhatsapps",
      "user_whatsapps_user_whatsapp_unique"
    );
    await queryInterface.dropTable("UserWhatsapps");
  }
};
