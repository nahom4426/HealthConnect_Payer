import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService(import.meta.env?.v_API_URI);

const path = "/provider/claimconnect/claim";

export function fetchRequestedForPayment(query = {}) {
  const qr = getQueryFormObject(query);
  return api
    .addAuthenticationHeader()
    .get(`${path}/payment-request/detail${qr}`);
}
