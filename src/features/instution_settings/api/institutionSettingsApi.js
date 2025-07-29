import ApiService from "@/service/ApiService";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService();
const basePath = '/payer';

export function getActiveInstitutions(params) {
  return api.addAuthenticationHeader().get(`${basePath}/list`, { params });
}
export function getPayersWithoutContract(params) {
  return api.addAuthenticationHeader().get(`${basePath}/without-active-contract`, { params });
}
export function updateInstitutionStatus(id, status) {
  return api.addAuthenticationHeader().put(`${basePath}/${id}/status`, { status });
}

export function getInstitutionById(id) {
  return api.addAuthenticationHeader().get(`${basePath}/${id}`);
}

export function registerInstitution(formData) {
  return api.addAuthenticationHeader().post(`${basePath}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function getPayersWithContractForLoggedInProvider(params) {
  const auth = useAuthStore();
  const providerUuid = auth.auth?.user?.providerUuid;

  if (!providerUuid) {
    return Promise.reject(new Error("Provider UUID not found in auth store"));
  }

  const url = `/provider/providers/${providerUuid}/payers-with-contract`;
  return api.addAuthenticationHeader().get(url, { params });
}

export async function updateInstitution(uuid, formData) {
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

  } catch (error) {
    return {
      success: false,
      error: error?.response?.data?.message || error.message || 'Unknown error'
    };
  }
}

export function changeInstitutionStatus(id, status) {
  return api.addAuthenticationHeader().put(`${basePath}/${id}/status`, { status });
}


export function deleteInstitutionStatus(id, status) {
  return api.addAuthenticationHeader().delete(`${basePath}/${id}/status`, { status });
}

export function importInstitutions(file) {
  const formData = new FormData();
  formData.append('file', file);

  return api.addAuthenticationHeader().post(`${basePath}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function downloadInstitutionTemplate() {
  return api.addAuthenticationHeader().get(`${basePath}/template`, {
    responseType: 'blob'
  });
}

export function importPayerPersons(id = {}, data, config = {}) {
  const qr = getQueryFormObject(id);
  return api.addAuthenticationHeader().post(`${basePath}/import${qr}`, data, {
    ...config,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
