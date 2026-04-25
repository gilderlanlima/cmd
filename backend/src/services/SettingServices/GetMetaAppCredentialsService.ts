import { Op } from "sequelize";
import Setting from "../../models/Setting";

interface Response {
  appId: string;
  appSecret: string;
}

const GetMetaAppCredentialsService = async (
  companyId?: number
): Promise<Response> => {
  let appId = process.env.FACEBOOK_APP_ID || "";
  let appSecret = process.env.FACEBOOK_APP_SECRET || "";

  if (companyId) {
    const settings = await Setting.findAll({
      where: {
        companyId,
        key: {
          [Op.in]: ["metaAppId", "metaAppSecret"]
        }
      }
    });

    const appIdSetting = settings.find(setting => setting.key === "metaAppId");
    const appSecretSetting = settings.find(
      setting => setting.key === "metaAppSecret"
    );

    appId = appIdSetting?.value || appId;
    appSecret = appSecretSetting?.value || appSecret;
  }

  return {
    appId,
    appSecret
  };
};

export default GetMetaAppCredentialsService;
