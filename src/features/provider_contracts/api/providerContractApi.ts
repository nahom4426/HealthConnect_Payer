import ApiService from "@/service/ApiService";
import type { AsyncResponse } from "@/types/interface";
import type { ProviderContract } from "../store/providerContractStore";

const api = new ApiService();
const basePath = '/payer-provider-contract';

export function getProviderContracts(query = {}) {
  return api.addAuthenticationHeader().get<ProviderContract[]>(`${basePath}/provider/lists`, {
    params: query
  });
}

export function getProviderContractById(id: string): Promise<AsyncResponse<ProviderContract>> {
  return api.addAuthenticationHeader().get(`${basePath}/${id}`);
}

export function createProviderContract(data: any): Promise<AsyncResponse<ProviderContract>> {
  console.log('Creating provider contract with data:', data);
  return api.addAuthenticationHeader().post(`${basePath}`, data);
}

export function updateProviderContract(id: string, data: Partial<ProviderContract>): Promise<AsyncResponse<ProviderContract>> {
  // Ensure data has the correct format
  const formattedData = {
    contractUuid: id,
    ...data,
    status: data.status || 'ACTIVE'
  };
  
  // Use the correct endpoint for editing a provider contract
  return api.addAuthenticationHeader().put(`${basePath}/edit`, formattedData);
}

export function changeProviderContractStatus(uuid: string, status: string): Promise<AsyncResponse<ProviderContract>> {
  return api.addAuthenticationHeader().put(`${basePath}/${uuid}/status`, { status });
}

export function deleteProviderContract(id: string): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().delete(`${basePath}/${id}`);
}

export function importProviderContracts(file: File): Promise<AsyncResponse<any>> {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.addAuthenticationHeader().post(`${basePath}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function downloadProviderContractTemplate(): Promise<Blob> {
  return api.addAuthenticationHeader().get(`${basePath}/template`, {
    responseType: 'blob'
  });
}