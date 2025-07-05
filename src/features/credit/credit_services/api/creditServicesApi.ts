import ApiService from "@/service/ApiService";
import type { AsyncResponse } from "@/types/interface";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService()
const path = '/integration/pharmacy'
const baseUrl = import.meta.env.VITE_API_URI
const basePath = '/integration/pharmacy';

// Credit Services API
export function createCreditService(data: any): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().post(`${path}/dispensing-records`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function updateCreditService(uuid: string, data: any): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().put(`${path}/dispensing-records/${uuid}`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function getCreditService(uuid: string): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().get(`${path}/dispensing-records/${uuid}`);
}

export function deleteCreditService(uuid: string): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().delete(`${path}/dispensing-records/${uuid}`);
}

// Credit Drugs API
export function createCreditDrug(data: any): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().post(`${path}/drug-dispensing-records`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function updateCreditDrug(uuid: string, data: any): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().put(`${path}/drug-dispensing-records/${uuid}`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export function getCreditDrug(uuid: string): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().get(`${path}/drug-dispensing-records/${uuid}`);
}

export function deleteCreditDrug(uuid: string): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().delete(`${path}/drug-dispensing-records/${uuid}`);
}

// Common Credit Operations
export function getCreditClaimsbyProviderUuid(id: string, query = {}, config = {}) {
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

export function submitCreditClaims(claimUuids: string[]): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().post(`${path}/submit-claims`, {
    claimUuids
  });
}

export function getCreditClaimStatus(uuid: string): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().get(`${path}/claim-status/${uuid}`);
}

// Payer Related
export function getPayerbyPayerUuid(id: string, query = {}, config = {}) {
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
// In your api file (creditServicesApi.ts)
export function getEligibleServicesAndDrugs(
  contractHeaderUuid: string,
  uuid: string,                // insuredUuid or dependantUuid
  isDependant: boolean = false,
  searchKey?: string
): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().get(`/payer-provider-contract/eligible-services`, {
    params: {
      contractHeaderUuid,
      ...(isDependant ? { dependantUuid: uuid } : { insuredUuid: uuid }),
      ...(searchKey ? { searchKey } : {})
    }
  });
}


// Batch Operations
export function createBatchCreditClaims(claims: any[]): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().post(`${path}/batch-claims`, {
    claims
  });
}

export function getBatchCreditClaims(batchId: string): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().get(`${path}/batch-claims/${batchId}`);
}

// Reporting
export function generateCreditReport(params: any): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().get(`${path}/credit-report`, {
    params
  });
}

// Utility Functions
export function validateCreditClaim(data: any): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().post(`${path}/validate-claim`, data);
}

export function getCreditServiceTypes(): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().get(`${path}/service-types`);
}

export function getCreditDrugTypes(): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().get(`${path}/drug-types`);
}

export function getCreditServiceDetails(uuid: string): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().get(`${path}/getDispensingDetail/${uuid}`);
}
// Import/Export
export function importCreditClaims(file: File): Promise<AsyncResponse<any>> {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.addAuthenticationHeader().post(`${path}/import-claims`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

export function exportCreditClaims(params: any): Promise<Blob> {
  return api.addAuthenticationHeader().get(`${path}/export-claims`, {
    params,
    responseType: 'blob'
  });
}
// Get dispensing record detail
export function getDispensingDetail(uuid: string): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().get(`${path}/getDispensingDetail/${uuid}`);
}

// Update dispensing record
export function updateDispensingRecord(uuid: string, data: any): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().put(`${path}/updateDispensing/${uuid}`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// Update drug dispensing record
export function updateDrugDispensingRecord(uuid: string, data: any): Promise<AsyncResponse<any>> {
  return api.addAuthenticationHeader().put(`${path}/updateDispensing/${uuid}`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}