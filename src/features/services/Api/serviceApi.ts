import ApiService from "@/service/ApiService";
import type { AsyncResponse } from "@/types/interface";
import type { Service } from "../store/servicesStore"; // Adjust based on your service type

const api = new ApiService();
const basePath = '/healthConnectProvider/service'; // Updated base path

// Function to search services by provider UUID
export function searchServices(providerUuid: string, query = {}): Promise<AsyncResponse<Service[]>> {
  return api.addAuthenticationHeader().get<Service[]>(`${basePath}/search/${providerUuid}`, {
    params: query
  });
}

// Function to get a service by ID
export function getServiceById(id: string): Promise<AsyncResponse<Service>> {
  return api.addAuthenticationHeader().get(`${basePath}/${id}`);
}

// Function to create a new service
export function createService(formData: FormData): Promise<AsyncResponse<Service>> {
  return api.addAuthenticationHeader().post(`${basePath}/create`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// Function to update a service
export async function updateService(uuid: string, formData: FormData): Promise<AsyncResponse<Service>> {
  try {
    const response = await api.put(`${basePath}/${uuid}`, formData, {
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

// Function to delete a service
export function deleteService(id: string): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().delete(`${basePath}/${id}`);
}

// Function to import services
export function importServices(file: File): Promise<AsyncResponse<any>> {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.addAuthenticationHeader().post(`${basePath}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// Function to download a service template
export function downloadServiceTemplate(): Promise<Blob> {
  return api.addAuthenticationHeader().get(`${basePath}/template`, {
    responseType: 'blob'
  });
}