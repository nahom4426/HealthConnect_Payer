// src/service/serviceCategoryMappings.js
import ApiService from "@/service/ApiService";

const api = new ApiService();
const basePath = '/service-category-mappings';

/**
 * Get categories by service
 * @param {string} contractDetailUuid
 * @returns {Promise} API response
 */
export function getCategoriesByService(contractDetailUuid) {
  return api
    .addAuthenticationHeader()
    .get(`${basePath}/service/${contractDetailUuid}/categories`);
}

/**
 * Get services by category
 * @param {string} categoryUuid
 * @returns {Promise} API response
 */
export function getServicesByCategory(categoryUuid) {
  return api
    .addAuthenticationHeader()
    .get(`${basePath}/category/${categoryUuid}/services`);
}

/**
 * Map a service to one or more categories
 * @param {Object} payload
 * @param {string} payload.contractDetailUuid
 * @param {string[]} payload.categoryUuids
 * @param {boolean} [payload.consumFromLimit]
 * @param {string} [payload.notes]
 * @returns {Promise} API response
 */
export function mapServiceToCategories(payload) {
  return api
    .addAuthenticationHeader()
    .post(`${basePath}/bulk-assign`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * Update a service category mapping
 * @param {string} mappingUuid
 * @param {Object} payload
 * @returns {Promise} API response
 */
export function updateServiceCategoryMapping(mappingUuid, payload) {
  return api
    .addAuthenticationHeader()
    .put(`${basePath}/${mappingUuid}`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * Remove service from category
 * @param {string} contractDetailUuid
 * @param {string} categoryUuid
 * @returns {Promise} API response
 */
export function removeServiceFromCategory(contractDetailUuid, categoryUuid) {
  return api
    .addAuthenticationHeader()
    .delete(`${basePath}/service/${contractDetailUuid}/category/${categoryUuid}`);
}
