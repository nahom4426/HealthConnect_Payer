import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService(import.meta.env?.v_PAYER_API);

const path = "/payer/claimconnect/claim";

export function getActiveServices(query = {}) {
  const qr = getQueryFormObject(query);
  return api.addAuthenticationHeader().get(`${path}/provider/saved/list${qr}`);
}
