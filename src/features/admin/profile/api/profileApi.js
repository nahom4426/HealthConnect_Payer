import ApiService from "@/service/ApiService";

const api = new ApiService();
const basePath = "/profile";

// ✅ Get personal details
export function getPersonalDetails(userId) {
  return api
    .addAuthenticationHeader()
    .get(`${basePath}/${userId}/details`);
}

// ✅ Upload profile picture
export function uploadProfilePicture(userId, file) {
  const formData = new FormData();
  formData.append("file", file);

  return api
    .addAuthenticationHeader()
    .post(`${basePath}/${userId}/profile-picture`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
}

// ✅ Change password (JS version)
export function changePassword(data) {
  return api
    .addAuthenticationHeader()
    .post(`/auth/change-password`, data);
}
