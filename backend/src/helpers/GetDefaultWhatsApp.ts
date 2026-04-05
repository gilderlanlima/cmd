import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";
import GetDefaultWhatsAppByUser from "./GetDefaultWhatsAppByUser";

const GetDefaultWhatsApp = async (
  companyId: number,
  userId?: number
): Promise<Whatsapp> => {
  const connectedByCompany = await Whatsapp.findOne({
    where: { status: "CONNECTED", companyId },
    order: [["updatedAt", "DESC"]]
  });

  const defaultByCompany = await Whatsapp.findOne({
    where: { isDefault: true, companyId },
    order: [["updatedAt", "DESC"]]
  });

  const latestByCompany = await Whatsapp.findOne({
    where: { companyId },
    order: [["updatedAt", "DESC"]]
  });

  if (userId) {
    const whatsappByUser = await GetDefaultWhatsAppByUser(userId);

    if (whatsappByUser?.status === "CONNECTED") {
      return whatsappByUser;
    }

    if (connectedByCompany) {
      return connectedByCompany;
    }

    if (whatsappByUser) {
      return whatsappByUser;
    }
  }

  if (defaultByCompany?.status === "CONNECTED") {
    return defaultByCompany;
  }

  if (connectedByCompany) {
    return connectedByCompany;
  }

  if (defaultByCompany) {
    return defaultByCompany;
  }

  if (latestByCompany) {
    return latestByCompany;
  }

  throw new AppError(`ERR_NO_DEF_WAPP_FOUND in COMPANY ${companyId}`);
};

export default GetDefaultWhatsApp;
