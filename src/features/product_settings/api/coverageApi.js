import ApiService from "@/service/ApiService";

const api = new ApiService();
const path = "/package-categories";
export function getPackages(query = {}) {
  return api.addAuthenticationHeader().get(`${path}`, {
    params: query,
  });
}

export function getPackageById(categoryUuid) {
  return api.addAuthenticationHeader().get(`${path}/${categoryUuid}`);
}

export function createPackage(data) {
  return api.addAuthenticationHeader().post(`${path}`, data);
}

export function updatePackage(categoryUuid, data) {
  return api.addAuthenticationHeader().put(`${path}/${categoryUuid}`, data);
}

export function deletePackage(categoryUuid) {
  return api.addAuthenticationHeader().delete(`${path}/${categoryUuid}`);
}

export function addEligibleServices(categoryUuid, eligibleServiceUuids) {
  return api.addAuthenticationHeader().put(`${path}/addEligibleServices/${categoryUuid}`, {
    eligibleServiceUuids
  });
}

export function getFamilyLevelPackages() {
  return api.addAuthenticationHeader().get('${path}/familyLevelPackages');
}

export function getActivePackages() {
  return api.addAuthenticationHeader().get('${path}/active/list');
}

export function createFamilyLevelPackage(data) {
  return api.addAuthenticationHeader().post('${path}/createFamilyLevelPackage', data);
}

export function getPackageDropdown(insuredPersonUuid) {
  return api.addAuthenticationHeader().get(`${path}/dropdown/${insuredPersonUuid}`);
}