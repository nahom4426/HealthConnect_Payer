<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Profile Header -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <!-- Cover Photo -->
        <div class="h-48 bg-gradient-to-r from-blue-500 to-teal-600"></div>

        <!-- Profile Info -->
        <div class="px-6 py-4 relative">
          <!-- Profile Picture -->
          <div class="absolute -top-16 left-6">
            <div class="relative">
              <img
                :src="
                  profileImage ||
                  'https://ui-avatars.com/api/?name=' +
                    user.firstName +
                    '+' +
                    user.fatherName +
                    '&background=random'
                "
                class="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
              />
              <label
                for="profile-upload"
                class="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100"
              >
                <CameraIcon class="h-5 w-5 text-gray-600" />
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleProfileUpload"
                />
              </label>
            </div>
          </div>

          <!-- User Info -->
          <div class="ml-40">
            <h1 class="text-2xl font-bold text-gray-900">{{ fullName }}</h1>
            <p class="text-gray-600">{{ user.email }}</p>
            <p class="text-gray-600">{{ user.mobilePhone }}</p>

            <!-- Roles Badges -->
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="(role, index) in user.authorities"
                :key="index"
                class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {{ role.replace("ROLE_", "") }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Left Column - Personal Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Personal Information Card -->
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">
                Personal Information
              </h2>
            </div>
            <div class="px-6 py-4">
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >First Name</label
                  >
                  <p class="mt-1 text-sm text-gray-900">{{ user.firstName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Father's Name</label
                  >
                  <p class="mt-1 text-sm text-gray-900">
                    {{ user.fatherName }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Grandfather's Name</label
                  >
                  <p class="mt-1 text-sm text-gray-900">
                    {{ user.grandFatherName }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Email</label
                  >
                  <p class="mt-1 text-sm text-gray-900">{{ user.email }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Phone</label
                  >
                  <p class="mt-1 text-sm text-gray-900">
                    {{ user.mobilePhone }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >User ID</label
                  >
                  <p class="mt-1 text-sm text-gray-900">{{ user.userUuid }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Details from API -->
          <div
            v-if="personalDetails"
            class="bg-white shadow rounded-lg overflow-hidden"
          >
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">
                Additional Details
              </h2>
            </div>
            <div class="px-6 py-4">
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div v-for="(value, key) in filteredPersonalDetails" :key="key">
                  <label
                    class="block text-sm font-medium text-gray-700 capitalize"
                    >{{ key.replace(/([A-Z])/g, " $1").trim() }}</label
                  >
                  <p class="mt-1 text-sm text-gray-900">
                    {{ value || "Not provided" }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Actions -->
        <div class="space-y-6">
          <!-- Change Password Card -->
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Change Password</h2>
            </div>
            <div class="px-6 py-4">
              <form @submit.prevent="changePassword">
                <div class="space-y-4">
                  <div>
                    <label
                      for="current-password"
                      class="block text-sm font-medium text-gray-700"
                      >Current Password</label
                    >
                    <input
                      v-model="password.current"
                      type="password"
                      id="current-password"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      for="new-password"
                      class="block text-sm font-medium text-gray-700"
                      >New Password</label
                    >
                    <input
                      v-model="password.new"
                      type="password"
                      id="new-password"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                      minlength="8"
                    />
                  </div>
                  <div>
                    <label
                      for="confirm-password"
                      class="block text-sm font-medium text-gray-700"
                      >Confirm New Password</label
                    >
                    <input
                      v-model="password.confirm"
                      type="password"
                      id="confirm-password"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div v-if="passwordError" class="text-red-500 text-sm">
                    {{ passwordError }}
                  </div>
                  <button
                    type="submit"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Account Actions -->
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-medium text-gray-900">Account Actions</h2>
            </div>
            <div class="px-6 py-4 space-y-4">
              <button
                @click="logout"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { CameraIcon } from "@heroicons/vue/24/outline";
import { getPersonalDetails } from "../api/profileApi"; // Your API function

const auth = useAuthStore();
const user = auth.auth?.user || {};

// Profile image handling
const profileImage = ref(user.profilePicture || null);
const handleProfileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profileImage.value = e.target.result;
      // Here you would call an API to upload the image
    };
    reader.readAsDataURL(file);
  }
};

// Password change
const password = ref({
  current: "",
  new: "",
  confirm: "",
});
const passwordError = ref("");
const changePassword = async () => {
  if (password.value.new !== password.value.confirm) {
    passwordError.value = "New passwords do not match";
    return;
  }

  try {
    // Call your password change API here
    // await changePasswordApi(password.value.current, password.value.new);
    passwordError.value = "";
    password.value = { current: "", new: "", confirm: "" };
    alert("Password changed successfully!");
  } catch (error) {
    passwordError.value = error.message || "Failed to change password";
  }
};

// Personal details from API
const personalDetails = ref(null);
const filteredPersonalDetails = computed(() => {
  if (!personalDetails.value) return {};
  // Filter out sensitive or unnecessary fields
  const { id, createdAt, updatedAt, ...details } = personalDetails.value;
  return details;
});

// Fetch additional personal details
onMounted(async () => {
  try {
    personalDetails.value = await getPersonalDetails(user.userUuid);
  } catch (error) {}
});

// Computed properties
const fullName = computed(() => {
  return `${user.firstName} ${user.fatherName} ${user.grandFatherName}`;
});

// Logout function
const logout = () => {
  auth.logout();
  // Redirect to login page
};
</script>

<style scoped>
/* Add any custom styles here */
</style>
