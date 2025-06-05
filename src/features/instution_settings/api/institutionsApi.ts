import ApiService from "@/service/ApiService";
import type { AsyncResponse } from "@/types/interface";
import type { ActiveInstitution } from "../store/InstitutionsStore";

const api = new ApiService();
const basePath = '';

export function getActiveInstitutions(params: { page: number; limit: number; search?: string }): Promise<AsyncResponse<ActiveInstitution[]>> {
  return api.addAuthenticationHeader().get(`${basePath}/payer/list`, { 
    params: {
      ...params,
      status: 'ACTIVE'
    }
  });
}

export function getInActiveInstitutions(params: { page: number; limit: number; search?: string }): Promise<AsyncResponse<ActiveInstitution[]>> {
  return api.addAuthenticationHeader().get(`${basePath}/payer/list`, { 
    params: {
      ...params,
      status: 'SUSPENDED'
    }
  });
}
export function getInstitutionById(id: string): Promise<AsyncResponse<ActiveInstitution>> {
  return api.addAuthenticationHeader().get(`${basePath}/${id}`);
}

export function updateInstitutionStatus(id: string, status: string): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().put(`${basePath}/${id}/status`, { status });
}
export function changeInstutionStatus(payerUuid: string, payerStatus: 'ACTIVE' | 'INACTIVE'): Promise<AsyncResponse<Provider>> {
  return api.addAuthenticationHeader().put(`${basePath}/payer/updateInstitutionStatus/${payerUuid}`, null, {
    params: { payerStatus }
  });
}