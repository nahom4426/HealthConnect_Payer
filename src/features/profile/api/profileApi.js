import ApiService from "@/service/ApiService";

const api = new ApiService();
const basePath = "/users";

export function getPersonalDetails(userId) {
  return api
    .addAuthenticationHeader()
    .get(`${basePath}/${userId}/details`);
}

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

export function changePassword(id,data) {
  return api
    .addAuthenticationHeader()
    .post(`${basePath}/changePassword/${id}`, data);
}
export function updateProfileData(id,data) {
  return api
    .addAuthenticationHeader()
    .post(`${basePath}/${id}`, data);
}
