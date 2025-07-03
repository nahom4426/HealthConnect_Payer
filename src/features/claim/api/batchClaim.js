import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService();
const path = "/claims";

export function approveBatchClaims(id, query = {}) {
  const qs = getQueryFormObject(query);
  return api.addAuthenticationHeader().put(`${path}/${id}/status${qs}`);
}
