import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService();
const path = "/claims";
const baseUrl = import.meta.env.v_API_URI;

export function claimApproval(id) {
  return api.addAuthenticationHeader().post(`${path}/createBatchClaim/${id}`);
}
