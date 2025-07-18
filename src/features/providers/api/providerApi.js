import ApiService from "@/service/ApiService";

const api = new ApiService();
const basePath = '/provider';

export function getProviders(query = {}) {
  return api.addAuthenticationHeader().get(`${basePath}/list`, {
    params: query
  });
}

export function getAllProviders(query = {}) {
  return api.addAuthenticationHeader().get(`${basePath}/list/withOutLogo`, {
    params: query
  });
}

export function getContaractedProviders(id, query = {}) {
  return api.addAuthenticationHeader().get(`payer/${id}/providers-with-contract`, {
    params: query
  });
}

export function getProviderById(id) {
  return api.addAuthenticationHeader().get(`${basePath}/${id}`);
}

export function createProvider(formData) {
  return api.addAuthenticationHeader().post(`${basePath}/createProvider`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function changeProviderStatus(providerId, status) {
  return api.addAuthenticationHeader().put(`${basePath}/${providerId}/status`, null, {
    params: { status }
  });
}

// ✅ Safer and matches backend behavior
export async function updateProvider(uuid, formData) {
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

  } catch (error) {
    return {
      success: false,
      error: error?.response?.data?.message || error.message || 'Unknown error'
    };
  }
}

export function deleteProvider(id) {
  return api.addAuthenticationHeader().delete(`${basePath}/${id}`);
}

export function importProviders(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.addAuthenticationHeader().post(`${basePath}/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function downloadProviderTemplate() {
  return api.addAuthenticationHeader().get(`${basePath}/template`, {
    responseType: 'blob'
  });
}