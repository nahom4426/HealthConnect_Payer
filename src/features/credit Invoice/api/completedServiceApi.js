import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService(import.meta.env?.v_API_URL);

const path = "/provider/claimconnect/claim";

export function getCompletedClaim(query = {}) {
  const qr = getQueryFormObject(query);
  return api.addAuthenticationHeader().get(`${path}/completed/list${qr}`);
}
export function getRequestedPayment(query = {}) {
  console.log(query);
  const qr = getQueryFormObject(query);
  return api.addAuthenticationHeader().get(`${path}/payment-requests${qr}`);
}

export function getPaidClaims(query = {}) {
  const qr = getQueryFormObject(query);
  return api.addAuthenticationHeader().get(`${path}/paid-requests${qr}`);
}
export function requestPayment(query = {}, data) {
  const qr = getQueryFormObject(query);
  return api
    .addAuthenticationHeader()
    .post(`${path}/payment-request/create${qr}`, data);
}
