import ApiService from "@/service/ApiService";
import { useAuthStore } from '@/stores/auth';

const api = new ApiService();
const basePath = '/payer-provider-contract';

export function getPayerContracts(query = {}) {
  const authStore = useAuthStore();
  const providerUuid = authStore.auth?.user?.providerUuid;

  if (!providerUuid) {
    throw new Error('Payer UUID not found in auth store');
  }

  return api.addAuthenticationHeader().get(`${basePath}/all`, {
    params: {
      providerUuid,
      page: 0,
      size: 10,
      sort: 'startDate',
      ...query
    }
  });
}

export function getPayerContractById(id) {
  return api.addAuthenticationHeader().get(`${basePath}/${id}`);
}

export function createPayerContract(formData) {
  return api.addAuthenticationHeader().post(basePath, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function updatePayerContract(uuid, formData) {
  return api.addAuthenticationHeader().put(`${basePath}/${uuid}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function changePayerContractStatus(contractId, status) {
  return api.addAuthenticationHeader().patch(`${basePath}/${contractId}/status`, null, {
    params: { status }
  });
}

export function deletePayerContract(id) {
  return api.addAuthenticationHeader().delete(`${basePath}/${id}`);
}

export function importPayerContracts(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.addAuthenticationHeader().post(`${basePath}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function downloadPayerContractTemplate() {
  return api.addAuthenticationHeader().get(`${basePath}/template`, {
    responseType: 'blob'
  });
}

export function addInsuredToContract(contractHeaderUuid, payload) {
  return api.addAuthenticationHeader().post(
    `${basePath}/${contractHeaderUuid}/add-insured`,
    payload
  );
}
export function searchInsuredByInstitution(id, query = {}, config = {}) {
  return api.addAuthenticationHeader()
    .get(`/insuredperson/by-payer/${id}`, {
      params: {
        ...query,
        contractUuid: query.contractUuid // ensure contractUuid is in the query
      },
      ...config
    })
    .then(response => {
      console.log("API raw response:", response);
      return response.data;
    })
    .catch(error => {
      console.error("API error:", error);
      throw error;
    });
}

// Helper function for safe API responses
export async function safeApiCall(apiCall) {
  try {
    const response = await apiCall;
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error?.response?.data?.message || error.message || 'Unknown error'
    };
  }
}