import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService();
const path = "/integration/pharmacy";
const baseUrl = import.meta.env.v_API_URI;
const basePath = "/integration/pharmacy";

export function getInsuredByContractId(id, query = {}) {
  return api.addAuthenticationHeader().get(`${path}/list/${id}`, {
    params: query,
  });
}

export function getCreditClaimsbyProviderUuid(id, query = {}, config = {}) {
  return api
    .addAuthenticationHeader()
    .get(`${path}/dispensing/${id}`, {
      params: query,
      ...config,
    })
    .then((response) => {
      console.log("API raw response:", response);
      // Return the response data directly, the component will handle pagination
      return response.data;
    })
    .catch((error) => {
      console.error("API error:", error);
      throw error;
    });
}
export function getPayerbyPayerUuid(id, query = {}, config = {}) {
  return api
    .addAuthenticationHeader()
    .get(`/payer/${id}`, {
      params: query,
      ...config,
    })
    .then((response) => {
      console.log("API raw response:", response);
      // Return the response data directly, the component will handle pagination
      return response.data;
    })
    .catch((error) => {
      console.error("API error:", error);
      throw error;
    });
}
export function getInsuredById(id, query = {}, config = {}) {
  return api
    .addAuthenticationHeader()
    .get(`${path}/${id}`, {
      params: query,
      ...config,
    })
    .then((response) => {
      console.log("API raw response:", response);
      // Return the response data directly, the component will handle pagination
      return response.data;
    })
    .catch((error) => {
      console.error("API error:", error);
      throw error;
    });
}
export function createInsuredPerson(data) {
  return api.addAuthenticationHeader().post(`${baseUrl}/insuredperson`, data);
}
// In your creditServicesApi.ts
export const authorizeClaims = async (dispensingUuid) => {
  try {
    const response = await api.post("/claims/authorize", dispensingUuid);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export function updateInsuredPerson(uuid, data) {
  return api
    .addAuthenticationHeader()
    .put(`${baseUrl}/insuredperson/${uuid}`, data);
}

export function getInsuredPersonById(uuid) {
  return api.addAuthenticationHeader().get(`${baseUrl}/insuredperson/${uuid}`);
}

import { useAuthStore } from "@/stores/auth"; // Make sure to import the auth store

export function importInsuredPersons(file, institutionUuid) {
  const formData = new FormData();
  formData.append("file", file);

  const auth = useAuthStore();
  const token = auth.auth.token; // Get the token from the auth store

  return api
    .addAuthenticationHeader()
    .post(
      `${basePath}/import-insured-and-dependant?institutionUuid=${institutionUuid}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // You can emit this percentage if needed
          }
        },
      }
    );
}

export function getInsuredMembers(query = {}) {
  return api.addAuthenticationHeader().get(`${basePath}/list`, {
    params: query,
  });
}

// export function getInsuredById(id: string): Promise<AsyncResponse<Insured>> {
//   return api.addAuthenticationHeader().get(`${basePath}/${id}`);
// }

export function createInsured(formData) {
  return api
    .addAuthenticationHeader()
    .post(`${basePath}/createInsuredPerson`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
}

export function changeInsuredStatus(insuredId, newStatus) {
  return api
    .addAuthenticationHeader()
    .put(`${basePath}/${insuredId}/status`, null, {
      params: { newStatus },
    });
}

export async function updateInsured(uuid, formData) {
  try {
    const response = await api.put(
      `${basePath}/updateInsured/${uuid}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      success: response.status >= 200 && response.status < 300,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error?.response?.data?.message || error.message || "Unknown error",
    };
  }
}

export function deleteInsured(id) {
  return api.addAuthenticationHeader().delete(`${basePath}/${id}`);
}

export function importInsuredMembers(file) {
  const formData = new FormData();
  formData.append("file", file);

  return api.addAuthenticationHeader().post(`${basePath}/import`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function downloadInsuredTemplate() {
  return api.addAuthenticationHeader().get(`${basePath}/template`, {
    responseType: "blob",
  });
}

export function getAuthorizationBatch(query = {}) {
  const qs = getQueryFormObject(query);
  return api.addAuthenticationHeader().get(`${basePath}/batch${qs}`);
}
export function getAuthorizationDetail(id) {
  return api.addAuthenticationHeader().get(`${basePath}/medications/${id}`);
}
