import ApiService from "@/service/ApiService";

const api = new ApiService();
const basePath = "/payer-provider-contract";

export function getProviderContracts(query = {}) {
  return api.addAuthenticationHeader().get(`${basePath}/provider/lists`, {
    params: query,
  });
}


export function getProviderContractById(id) {
  return api
    .addAuthenticationHeader()
    .get(`${basePath}/${id}`, {
      params: {
        userType: 'provider',
      },
    });
}


export function createProviderContract(data) {
  console.log("Creating provider contract with data:", data);
  return api.addAuthenticationHeader().post(`${basePath}`, data);
}

export function updateProviderContract(id, data) {
  // Ensure data has the correct format
  const formattedData = {
    contractUuid: id,
    ...data,
    status: data.status || "ACTIVE",
  };

  // Use the correct endpoint for editing a provider contract
  return api.addAuthenticationHeader().put(`${basePath}/edit`, formattedData);
}

export function changeProviderContractStatus(uuid, status) {
  return api
    .addAuthenticationHeader()
    .put(`${basePath}/${uuid}/status`, { status });
}

export function deleteProviderContract(id) {
  return api.addAuthenticationHeader().delete(`${basePath}/${id}`);
}

export function importProviderContracts(file) {
  const formData = new FormData();
  formData.append("file", file);

  return api.addAuthenticationHeader().post(`${basePath}/import`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function downloadProviderContractTemplate() {
  return api.addAuthenticationHeader().get(`${basePath}/template`, {
    responseType: "blob",
  });
}
