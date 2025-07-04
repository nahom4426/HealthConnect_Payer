import ApiService from "@/service/ApiService";

const api = new ApiService();
const basePath = "/payer-provider-contract";
export function createNewContract(data) {
  return api.addAuthenticationHeader().post(`${basePath}`, data);
}
export function getPayerContractById(id) {
  return api.addAuthenticationHeader().get(`${basePath}/${id}`);
}

export function updatePayerContract(id, data) {
  return api.addAuthenticationHeader().put(`${basePath}/${id}`, data);
}