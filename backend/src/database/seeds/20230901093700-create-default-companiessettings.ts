import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const [rows] = await queryInterface.sequelize.query(
      'SELECT 1 FROM "CompaniesSettings" WHERE "companyId" = 1 LIMIT 1'
    );
    const settingsExist = Array.isArray(rows) && rows.length > 0;

    if (!settingsExist) {
      return queryInterface.bulkInsert("CompaniesSettings",
        [
          {
            companyId: 1,
            hoursCloseTicketsAuto: "9999999999",
            chatBotType: "text",
            acceptCallWhatsapp: "enabled",
            userRandom: "enabled",
            sendGreetingMessageOneQueues: "enabled",
            sendSignMessage: "enabled",
            sendFarewellWaitingTicket: "disabled",
            userRating: "disabled",
            sendGreetingAccepted: "enabled",
            CheckMsgIsGroup: "enabled",
            sendQueuePosition: "enabled",
            scheduleType: "disabled",
            acceptAudioMessageContact: "enabled",
            sendMsgTransfTicket: "enabled",
            enableLGPD: "disabled",
            requiredTag: "disabled",
            lgpdDeleteMessage: "disabled",
            lgpdHideNumber: "disabled",
            lgpdConsent: "disabled",
            lgpdLink: "",
            lgpdMessage: "",
            createdAt: new Date(),
            updatedAt: new Date(),
            DirectTicketsToWallets: false,
            closeTicketOnTransfer: false
          }
        ],
        {}
      );
    }
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("CompaniesSettings", { companyId: 1 });
  }
};
