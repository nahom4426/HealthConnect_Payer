import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService(import.meta.env?.v_PAYER_API);

const path = "/payer/claimconnect";

export function getClaimById(query = {}) {
  const qr = getQueryFormObject(query);
  return api
    .addAuthenticationHeader()
    .get(`${path}/institution/provider-assigned/policy-holders/list${qr}`);
}
export function createClaim(data, query = {}) {
  // const qr = getQueryFormObject(query);
  return api
    .addAuthenticationHeader()
    .post(`${path}/claim/create-claim/provider/insured`, data);
}
export function createDependantClaim(query = {}, data) {
  const qr = getQueryFormObject(query);
  return api
    .addAuthenticationHeader()
    .post(`${path}/claim/create-claim/provider/dependant${qr}`);
}
export function getServices(id) {
  return api
    .addAuthenticationHeader()
    .get(`${path}/eligible-service/search/items/${id}`);
}

export function getClaimAttachment(id) {
  return api.addAuthenticationHeader().get(`${path}/claimattachments/${id}`);
}
export function getClaims(id) {
  return api.addAuthenticationHeader().get(`${path}/claim/details/${id}`);
}

export function getServiceCoverage(id) {
  return api.addAuthenticationHeader().get(`${path}/package/dropdown/${id}`);
}
export function submitClaim(data) {
  return api
    .addAuthenticationHeader()
    .put(`${path}/claim/approve/provider/preparedBy`, data);
}
export function claimedServices(query = {}) {
  const qr = getQueryFormObject(query);
  return api
    .addAuthenticationHeader()
    .get(`${path}/claim/claimed-services${qr}`);
}

export function submitClaimAttachment(query = {}, data) {
  const qr = getQueryFormObject(query);

  return api
    .addAuthenticationHeader()
    .post(`${path}/claimattachments${qr}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
}

export function addServiceProvided(query = {}, data) {
  const qr = getQueryFormObject(query);

  return api
    .addAuthenticationHeader()
    .post(`${path}/service-provided${qr}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
}
