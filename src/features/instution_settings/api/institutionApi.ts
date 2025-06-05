import ApiService from "@/service/ApiService";

const api = new ApiService();
const path = '/payer';

export function getInstitutionAlerts(query = {}) {
  return api.addAuthenticationHeader().get(`${path}/list`, {
    params: query
  });
}