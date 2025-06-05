import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService(import.meta.env?.v_API_URL);

const path = "/payer/claimconnect";

export function getInsuredMembers(query = {}) {
  const qr = getQueryFormObject(query);
  return api
    .addAuthenticationHeader()
    .get(`${path}/provider/search/insuredperson/${qr}`);
}
