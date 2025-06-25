import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService();
const path = "/dependant";
const path1 = "groups";

export function createNewGroup(id, query = {}) {
  return api.addAuthenticationHeader().get(`${path}/list/${id}`, {
    params: query,
  });
}
export function getGroup(id, query = {}) {
  return api.addAuthenticationHeader().get(`${path1}/payerGroups/${id}`, {
    params: query,
  });
}
export function createGroup(data) {
  console.log(data);

  return api.addAuthenticationHeader().post(`${path1}`, data);
}
