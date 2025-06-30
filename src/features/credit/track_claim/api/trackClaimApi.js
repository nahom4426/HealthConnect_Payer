import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService();
const path = "/claims";

export function getClaimByStatus(query = {}) {
  const qs = getQueryFormObject(query);
  return api.addAuthenticationHeader().get(`${path}/allClaims${qs}`);
}
export function getClaimByID(id, query = {}) {
  const qs = getQueryFormObject(query);
  return api.addAuthenticationHeader().get(`${path}/${id}`);
}
