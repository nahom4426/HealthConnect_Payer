import ApiService from "@/service/ApiService";

const api = new ApiService();
const basePath = "/payer-provider-contract";

export function createNewContract(data) {
  return api.addAuthenticationHeader().post(`${basePath}/all`, data);
}

export function getPayerContractById(id) {
  return api
    .addAuthenticationHeader()
    .get(`${basePath}/${id}`, {
      params: {
        userType: 'provider',
      },
    });
}

export function updatePayerContract(id, data) {
  return api.addAuthenticationHeader().put(`${basePath}/${id}`, data);
}

export function changePayerContractStatus(contractId, status) {
  return api.addAuthenticationHeader().put(`${basePath}/${contractId}/status`, null, {
    params: { status }
  });
}

// ✅ New: Approve contract
export function approveContract(contractHeaderUuid, remark = "") {
  return api.addAuthenticationHeader().put(`${basePath}/${contractHeaderUuid}/status`, {
    action: "APPROVE",
    rejectionReason: "",
    remark,
  });
}

// ✅ New: Reject contract
export function rejectContract(contractHeaderUuid, rejectionReason, remark = "") {
  return api.addAuthenticationHeader().put(`${basePath}/${contractHeaderUuid}/status`, {
    action: "REJECT",
    rejectionReason,
    remark,
  });
}
