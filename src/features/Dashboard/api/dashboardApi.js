import ApiService from "@/service/ApiService";

const api = new ApiService();
const path = '/dashboard/report';

export function getReports(query = {}) {
  return api.addAuthenticationHeader().get(`${path}`, {
    params: query
  });
}