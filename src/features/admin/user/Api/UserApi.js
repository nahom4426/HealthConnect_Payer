import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils.ts";

// Create a new API service instance with the specific base URL
const api = new ApiService(import.meta.env.v_API_URI);
const path = "/users";

export function CreateUser(data) {
  console.log("Creating user with data:", data);
  
  // Ensure gender is properly formatted (lowercase)
  const formattedData = {
    ...data,
    gender: data.gender?.toLowerCase()
  };
  
  console.log("Sending formatted data:", formattedData);
  console.log("API endpoint:", `${path}/signup`);
  
  // Add authentication header for the signup request
  return api.addAuthenticationHeader().post(`${path}/signup`, formattedData)
    .catch(error => {
      console.error("Error creating user:", error);
      return {
        success: false,
        error: error.message || "Failed to create user. Server error.",
        data: null
      };
    });
}
export function getAllUser(query = {}) {
  const qr = getQueryFormObject(query);
  return api.addAuthenticationHeader().get(`${path}/all${qr}`);
}
export function getUserById(id) {
  return api.addAuthenticationHeader().get(`${path}/${id}`);
}
export function updateUserById(id, data) {
  return api.addAuthenticationHeader().put(`${path}/${id}`, data);
}
export function removeUserById(id) {
  return api.addAuthenticationHeader().delete(`${path}/${id}`);
}
export function fetchUserFilesView() {
  return api.addAuthenticationHeader().get(`${path}`);
}

export function fetchUserFiles() {
  return api.addAuthenticationHeader().get(`${path}`);
}
