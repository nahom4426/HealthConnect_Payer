import ApiService from "@/service/ApiService";
import type { AsyncResponse } from "@/types/interface";
import type { PayerContract } from "../store/payerContractStore";
import { useAuthStore } from '@/stores/auth';

const api = new ApiService();
const basePath = '/payer-provider-contract';

export function getPayerContracts(query = {}) {
  const authStore = useAuthStore();
  const payerUuid = authStore.auth?.user?.payerUuid;

  if (!payerUuid) {
    throw new Error('Payer UUID not found in auth store');
  }

  return api.addAuthenticationHeader().get<PayerContract[]>(basePath, {
    params: {
      payerUuid,
      page: 0,
      size: 10,
      sort: 'startDate',
      ...query
    }
  });
}

export function getPayerContractById(id: string): Promise<AsyncResponse<PayerContract>> {
  return api.addAuthenticationHeader().get(`${basePath}/${id}`);
}

export function createPayerContract(formData: FormData): Promise<AsyncResponse<PayerContract>> {
  return api.addAuthenticationHeader().post(basePath, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function updatePayerContract(uuid: string, formData: FormData): Promise<AsyncResponse<PayerContract>> {
  return api.addAuthenticationHeader().put(`${basePath}/${uuid}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function changePayerContractStatus(contractId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<AsyncResponse<PayerContract>> {
  return api.addAuthenticationHeader().patch(`${basePath}/${contractId}/status`, null, {
    params: { status }
  });
}

export function deletePayerContract(id: string): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().delete(`${basePath}/${id}`);
}

export function importPayerContracts(file: File): Promise<AsyncResponse<PayerContract[]>> {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.addAuthenticationHeader().post(`${basePath}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function downloadPayerContractTemplate(): Promise<Blob> {
  return api.addAuthenticationHeader().get(`${basePath}/template`, {
    responseType: 'blob'
  });
}

// Helper function for safe API responses
export async function safeApiCall<T>(apiCall: Promise<AsyncResponse<T>>): Promise<AsyncResponse<T>> {
  try {
    const response = await apiCall;
    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.response?.data?.message || error.message || 'Unknown error'
    };
  }
}