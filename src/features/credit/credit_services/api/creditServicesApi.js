import ApiService from "@/service/ApiService";

const api = new ApiService();
const path = '/integration/pharmacy';

// Credit Services API
export function createCreditService(data) {
  return api.addAuthenticationHeader().post(`${path}/dispensing-records`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function updateCreditService(uuid, data) {
  return api.addAuthenticationHeader().put(`${path}/dispensing-records/${uuid}`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function getCreditService(uuid) {
  return api.addAuthenticationHeader().get(`${path}/dispensing-records/${uuid}`);
}

export function deleteCreditService(uuid) {
  return api.addAuthenticationHeader().delete(`${path}/dispensing-records/${uuid}`);
}

// Credit Drugs API
export function createCreditDrug(data) {
  return api.addAuthenticationHeader().post(`${path}/drug-dispensing-records`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function updateCreditDrug(uuid, data) {
  return api.addAuthenticationHeader().put(`${path}/drug-dispensing-records/${uuid}`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function getCreditDrug(uuid) {
  return api.addAuthenticationHeader().get(`${path}/drug-dispensing-records/${uuid}`);
}

export function deleteCreditDrug(uuid) {
  return api.addAuthenticationHeader().delete(`${path}/drug-dispensing-records/${uuid}`);
}

// Common Credit Operations
export function getCreditClaimsbyProviderUuid(id, query = {}, config = {}) {
  return api.addAuthenticationHeader().get(`${path}/dispensing/${id}`, {
    params: query,
    ...config
  }).then(response => {
    return response.data;
  }).catch(error => {
    console.error("API error:", error);
    throw error;
  });
}

export function submitCreditClaims(claimUuids) {
  return api.addAuthenticationHeader().post(`${path}/submit-claims`, {
    claimUuids
  });
}

export function getCreditClaimStatus(uuid) {
  return api.addAuthenticationHeader().get(`${path}/claim-status/${uuid}`);
}

// Payer Related
export function getPayerbyPayerUuid(id, query = {}, config = {}) {
  return api.addAuthenticationHeader().get(`/payer/${id}`, {
    params: query,
    ...config
  }).then(response => {
    return response.data;
  }).catch(error => {
    console.error("API error:", error);
    throw error;
  });
}

// Get eligible services by contractHeaderUuid and insuredUuid
export function getEligibleServicesAndDrugs(contractHeaderUuid, uuid, isDependant = false, searchKey) {
  return api.addAuthenticationHeader().get(`/payer-provider-contract/eligible-services`, {
    params: {
      contractHeaderUuid,
      ...(isDependant ? { dependantUuid: uuid } : { insuredUuid: uuid }),
      ...(searchKey ? { searchKey } : {})
    }
  });
}

// Batch Operations
export function createBatchCreditClaims(claims) {
  return api.addAuthenticationHeader().post(`${path}/batch-claims`, {
    claims
  });
}

export function getBatchCreditClaims(batchId) {
  return api.addAuthenticationHeader().get(`${path}/batch-claims/${batchId}`);
}

// Reporting
export function generateCreditReport(params) {
  return api.addAuthenticationHeader().get(`${path}/credit-report`, {
    params
  });
}

// Utility Functions
export function validateCreditClaim(data) {
  return api.addAuthenticationHeader().post(`${path}/validate-claim`, data);
}

export function getCreditServiceTypes() {
  return api.addAuthenticationHeader().get(`${path}/service-types`);
}

export function getCreditDrugTypes() {
  return api.addAuthenticationHeader().get(`${path}/drug-types`);
}

export function getCreditServiceDetails(uuid) {
  return api.addAuthenticationHeader().get(`${path}/getDispensingDetail/${uuid}`);
}

// Import/Export
export function importCreditClaims(file) {
  const formData = new FormData();
  formData.append('file', file);

  return api.addAuthenticationHeader().post(`${path}/import-claims`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function exportCreditClaims(params) {
  return api.addAuthenticationHeader().get(`${path}/export-claims`, {
    params,
    responseType: 'blob'
  });
}

// Get dispensing record detail
export function getDispensingDetail(uuid) {
  return api.addAuthenticationHeader().get(`${path}/getDispensingDetail/${uuid}`);
}

// Update dispensing record
export function updateDispensingRecord(uuid, data) {
  return api.addAuthenticationHeader().put(`${path}/updateDispensing/${uuid}`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// Update drug dispensing record
export function updateDrugDispensingRecord(uuid, data) {
  return api.addAuthenticationHeader().put(`${path}/updateDispensing/${uuid}`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
export function getInstitutionsByContractUuid(contractUuid) {
  return api.addAuthenticationHeader().get(`/eligibility/institutions`, {
    params: { contractUuid }
  });
}

// New API for getting insured eligibility by contractUuid and institutionUuid
export function getInsuredEligibility(contractUuid, institutionUuid, search = "") {
  return api.addAuthenticationHeader().get(`/eligibility/insuredEligibility`, {
    params: { 
      contractUuid, 
      institutionUuid, 
      ...(search ? { search } : {}) // Include search only if provided
    }
  });
}