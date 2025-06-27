import ApiService from "@/service/ApiService";
import type { AsyncResponse } from "@/types/interface";
import type { ActiveInstitution } from "../store/InstitutionsStore";
import axios from "axios";

const api = new ApiService();
const basePath = '/payer'; // Corrected base path

export function getActiveInstitutions(params: { page: number; limit: number; search?: string }): Promise<AsyncResponse<ActiveInstitution[]>> {
  return api.addAuthenticationHeader().get(`${basePath}/list`, { params });
}
export function updateInstitutionStatus(id: string, status: string): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().put(`${basePath}/${id}/status`, { status });
}

export function getInstitutionById(id: string): Promise<AsyncResponse<ActiveInstitution>> {
  return api.addAuthenticationHeader().get(`${basePath}/${id}`);
}

export function registerInstitution(formData: FormData): Promise<AsyncResponse<ActiveInstitution>> {
  return api.addAuthenticationHeader().post(`${basePath}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}



export async function updateInstitution(uuid: string, formData: FormData) {
  try {
    const response = await api.addAuthenticationHeader().put(`${basePath}/${uuid}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return {
      success: response.status >= 200 && response.status < 300,
      data: response.data,
    };

  } catch (error: any) {
    return {
      success: false,
      error: error?.response?.data?.message || error.message || 'Unknown error'
    };
  }
}


export function changeInstitutionStatus(id: string, status: string): Promise<AsyncResponse<ActiveInstitution>> {
  return api.addAuthenticationHeader().put(`${basePath}/${id}/status`, { status });
}
export function deleteInstitutionStatus(id: string, status: string): Promise<AsyncResponse<ActiveInstitution>> {
  return api.addAuthenticationHeader().delete(`${basePath}/${id}/status`, { status });
}
export function importInstitutions(file: File): Promise<AsyncResponse<any>> {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.addAuthenticationHeader().post(`${basePath}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function downloadInstitutionTemplate(): Promise<Blob> {
  return api.addAuthenticationHeader().get(`${basePath}/template`, {
    responseType: 'blob'
  });
}
















