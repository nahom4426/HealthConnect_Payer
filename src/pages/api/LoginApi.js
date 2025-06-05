import ApiService from "@/service/ApiService";

const api = new ApiService(import.meta.env?.vv_API_URI);
const path = "/users";

export function signup(data, config = {}) {
  return api.post(`${path}/signUp`, data, config);
}

export function login(data, config = {}) {
  return api.post(`${path}/signin`, data, config);
}

// Send password reset code to email
export function forgotPassword(data, config = {}) {
  return api.post(`${path}/forgot-password`, data, config);
}

// Reset password using code and new password
export function resetPassword(data, config = {}) {
  return api.put(`${path}/password/resetPassword`, data, config);
}