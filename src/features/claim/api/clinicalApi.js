import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService();
const path = "/integration/pharmacy";

export function approveClaim(id, query = {}) {
  const qs = getQueryFormObject(query);
  return api
    .addAuthenticationHeader()
    .put(`${path}/claim/update-status/${id}${qs}`);
}
