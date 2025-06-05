import ApiService from "@/service/ApiService";

const api = new ApiService();
const path = '/institutions';

export function getInstitutionAlerts(query = {}) {
  return api.addAuthenticationHeader().get(`${path}/list`, {
    params: query
  });
}