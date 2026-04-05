import { isObject } from "lodash";
import SocketWorker from "./SocketWorker"

export function socketConnection(params) {
  let userId = "";
  let companyId = "";

  if (isObject(params)) {
    if (isObject(params?.user)) {
      companyId = params.user.companyId;
      userId = params.user.id;
    } else {
      companyId = params?.companyId;
      userId = params?.userId;
    }
  }

  return SocketWorker(companyId, userId)
}
