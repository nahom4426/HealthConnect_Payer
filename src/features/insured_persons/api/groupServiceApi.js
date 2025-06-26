import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService();
const path = "/dependant";
const path1 = "groups";

export function addServiceToGroup(id, query = {}) {
  return api.addAuthenticationHeader().get(`${path}/list/${id}`, {
    params: query,
  });
}
export function getGroup(id, query = {}) {
  return api.addAuthenticationHeader().get(`${path1}/payerGroups/${id}`, {
    params: query,
  });
}
export function createGroup(id, data) {
  return api.addAuthenticationHeader().post(`${path1}/createGroup/${id}`, data);
}

export function updateGroup(id, data) {
  return api.addAuthenticationHeader().post(`${path1}/${id}`, data);
}
export function getGroupInsured(id, data) {
  return api
    .addAuthenticationHeader()
    .get(`${path1}/membersAndServices/${id}`, data);
}

export function addMembersToGroup(id, data) {
  return api
    .addAuthenticationHeader()
    .put(`${path1}/addMembersToGroup/${id}`, data);
}
