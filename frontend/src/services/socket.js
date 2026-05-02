import { isObject } from "lodash";
import SocketWorker from "./SocketWorker";

export function socketConnection(params) {
  let userId = "";
  let companyId = "";
  if (isObject(params)) {
    companyId = params?.user?.companyId || params?.companyId || "";
    userId = params?.user?.id || params?.userId || "";
  }

  if (!companyId || !userId) {
    return null;
  }

  return SocketWorker(companyId, userId);
}
