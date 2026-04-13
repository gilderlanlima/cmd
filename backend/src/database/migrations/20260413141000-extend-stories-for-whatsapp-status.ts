import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.changeColumn("Stories", "userId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });

    await queryInterface.addColumn("Stories", "whatsappId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Whatsapps", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });

    await queryInterface.addColumn("Stories", "sourceType", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "panel"
    });

    await queryInterface.addColumn("Stories", "sourceJid", {
      type: DataTypes.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn("Stories", "sourceMessageId", {
      type: DataTypes.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn("Stories", "authorName", {
      type: DataTypes.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn("Stories", "authorAvatar", {
      type: DataTypes.TEXT,
      allowNull: true
    });

    await queryInterface.addIndex("Stories", ["companyId", "sourceType", "sourceMessageId"], {
      unique: true,
      name: "stories_company_source_message_unique"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("Stories", "stories_company_source_message_unique");
    await queryInterface.removeColumn("Stories", "authorAvatar");
    await queryInterface.removeColumn("Stories", "authorName");
    await queryInterface.removeColumn("Stories", "sourceMessageId");
    await queryInterface.removeColumn("Stories", "sourceJid");
    await queryInterface.removeColumn("Stories", "sourceType");
    await queryInterface.removeColumn("Stories", "whatsappId");

    await queryInterface.changeColumn("Stories", "userId", {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    });
  }
};
