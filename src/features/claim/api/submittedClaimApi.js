import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService();
const path = "/claims";

export function getSubmittedClaims(status, query = {}) {
  return api.addAuthenticationHeader().get(`${path}/status/${status}`, {
    params: query,
  });
}
