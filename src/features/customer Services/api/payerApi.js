import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService();

const path = "/provider/claimconnect";

export function getAllPayers(id) {
  // const qr = getQueryFormObject(query);
  return api.addAuthenticationHeader().get(`${path}/payers/dropdown/${id}`);
}
