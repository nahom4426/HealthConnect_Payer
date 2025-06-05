import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService();

const path = "provider/claimconnect/service";

export function getAllServices(id, query = {}) {
  const qr = getQueryFormObject(query);
  return api.addAuthenticationHeader().get(`${path}/search/${id}${qr}`);
}
export function getServiceByid(id) {
  return api.addAuthenticationHeader().get(`${path}/${id}`);
}
export function updateService(id, data) {
  return api.addAuthenticationHeader().put(`${path}/${id}`, data);
}
export function createService(query = {}, data) {
  const qr = getQueryFormObject(query);
  return api.addAuthenticationHeader().post(`${path}${qr}`, data);
}
export function removeService(id) {
  return api.addAuthenticationHeader().delete(`${path}/${id}`);
}

export function addUsedServices(id, data) {
  return api.addAuthenticationHeader().post(`${path}?providerUuid=${id}`, data);
}
