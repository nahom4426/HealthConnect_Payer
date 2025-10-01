import ApiService from "@/service/ApiService";

const api = new ApiService();
const basePath = "";

// Failed External Dispensing
export function getFailedServicesByStatus(status) {
  return api.addAuthenticationHeader().get(
    `${basePath}/failed-external-dispensing/by-status/${status}`
  );
}

export function retryFailedService(logUuid) {
  return api
    .addAuthenticationHeader()
    .post(`${basePath}/failed-external-dispensing/manual-retry/${logUuid}`, "");
}

// Failed Claims (integration)
export function getFailedClaimsByStatus(status) {
  return api
    .addAuthenticationHeader()
    .get(`${basePath}/integration/failed-claims/status/${status}`);
}

export function retryFailedClaim(logUuid) {
  return api
    .addAuthenticationHeader()
    .post(`${basePath}/integration/failed-claims/manual-retry/${logUuid}`, "");
}
