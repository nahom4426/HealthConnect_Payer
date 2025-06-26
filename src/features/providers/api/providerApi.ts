import ApiService from "@/service/ApiService";
import type { AsyncResponse } from "@/types/interface";
import type { Provider } from "../store/providersStore";

const api = new ApiService();
const basePath = '/provider';

export function getProviders(query = {}) {
  return api.addAuthenticationHeader().get<Provider[]>(`${basePath}/list`, {
    params: query
  });
}
export function getContaractedProviders(id:any,query = {}) {
  return api.addAuthenticationHeader().get(`payer/${id}/providers-with-contract`, {
    params: query
  });
}

export function getProviderById(id: string): Promise<AsyncResponse<Provider>> {
  return api.addAuthenticationHeader().get(`${basePath}/${id}`);
}



export function createProvider(formData: FormData): Promise<AsyncResponse<ActiveInstitution>> {
  return api.addAuthenticationHeader().post(`${basePath}/createProvider`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
export function changeProviderStatus(providerId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<AsyncResponse<Provider>> {
  return api.addAuthenticationHeader().put(`${basePath}/${providerId}/status`, null, {
    params: { status }
  });
}
// ✅ Safer and matches backend behavior
export async function updateProvider(uuid: string, formData: FormData) {
  try {
    const response = await api.put(`/provider/${uuid}`, formData, {
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





// export function changeProviderStatus(uuid: string, status: string): Promise<AsyncResponse<Provider>> {
//   return api.addAuthenticationHeader().put(`${basePath}/${uuid}/status`, { status });
// }

export function deleteProvider(id: string): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().delete(`${basePath}/${id}`);
}

export function importProviders(file: File): Promise<AsyncResponse<any>> {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.addAuthenticationHeader().post(`${basePath}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function downloadProviderTemplate(): Promise<Blob> {
  return api.addAuthenticationHeader().get(`${basePath}/template`, {
    responseType: 'blob'
  });
}
