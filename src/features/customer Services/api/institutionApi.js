import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService(import.meta.env?.v_API_URL);

const path = "/provider/claimconnect/payer-provider-contract";

export function getInstitutions(query = {}) {
  const qr = getQueryFormObject(query);
  return api
    .addAuthenticationHeader()
    .get(`${path}/active/institution/lists${qr}`);
}
