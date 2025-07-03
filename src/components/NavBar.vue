<script setup>
import icons from "@/utils/icons";
import Dropdown from "./Dropdown.vue";
import { useAuthStore } from "@/stores/auth";
import { ref, computed } from "vue";

const imageLoaded = ref(true);
const imageSrc = "/src/assets/img/profile.png";

const userInitial = computed(() => {
  return authStore.user?.firstName?.charAt(0) || "U";
});

function handleImageError() {
  imageLoaded.value = false;
}
function logout() {
  localStorage.removeItem("userDetail");
  window.location.href = "/login";
}
const authStore = useAuthStore();
const props = defineProps({
  breadcrumbs: Object,
});
function getUserType(user) {
  const hasPayer = !!user.payerUuid;
  const hasProvider = !!user.providerUuid;

  if (hasPayer && !hasProvider) return "Payer";
  if (!hasPayer && hasProvider) return "Provider";
  if (!hasPayer && !hasProvider) return "Admin";
  if (hasPayer && hasProvider) return "Payer and Provider";
}

function getTypeStyle(type) {
  switch (type) {
    case "Payer":
      return "bg-blue-100 text-blue-800";
    case "Provider":
      return "bg-green-100 text-green-800";
    case "Admin":
      return "bg-yellow-100 text-yellow-800";
    case "Payer and Provider":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
</script>
<template>
  <div
    class="h-navbar-height bg-white flex items-center rounded-2xl justify-between pl-8 pr-4 shadow-sm"
  >
    <div class="flex items-center gap-4">
      <div class="cursor-pointer" @click="$router.back">
        <i v-html="icons.back"></i>
      </div>

      <div class="flex flex-col">
        <h1 class="text-lg">
          {{
            breadcrumbs.breadcrumbs[breadcrumbs.breadcrumbs.length - 1]?.name ||
            "HealthConnect"
          }}
        </h1>
        <p class="text-xs text-base-clr">Sample Data Analytics</p>
      </div>
    </div>

    <div class="flex items-center gap-5">
      <button class="px-5 py-3 rounded-md bg-base-clr3">
        <i
          v-html="
            icons.notification ||
            '<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\'><path fill=\'currentColor\' d=\'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z\'/></svg>'
          "
        />
      </button>

      <div
        class="flex items-center gap-2 px-5 py-3 rounded-md bg-base-clr3 cursor-pointer"
      >
        <span class="text-md font-light">Eng</span>
        <i v-html="icons.chevron_down" />
      </div>

      <Dropdown v-slot="{ setRef, toggleDropdown }">
        <div
          @click.prevent="toggleDropdown"
          class="flex items-center gap-2 px-5 py-3 rounded-lg bg-base-clr3 cursor-pointer"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
          >
            <img
              :src="imageSrc"
              alt="User avatar"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
            <span v-if="!imageLoaded" class="font-bold text-black">
              {{ authStore.user?.firstName?.charAt(0) || "U" }}
            </span>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-normal">{{
              authStore.auth.user?.firstName +
                " " +
                authStore.auth.user?.fatherName || "Birhane Araya"
            }}</span>
            <span
              v-if="authStore.auth.user"
              class="text-xs px-2.5 py-1 rounded-full font-medium"
            >
              {{ getUserType(authStore.auth.user) }}
            </span>
            <span
              v-else
              class="text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full font-medium"
              >N/A</span
            >
          </div>
          <button>
            <i v-html="icons.chevron_down"></i>
          </button>
        </div>
        <div
          class="flex shadow-lg border p-2 mt-2 rounded flex-col gap-2 w-60 bg-[#F6F7FA]"
          :ref="setRef"
        >
          <button
            @click="$router.push('/profile')"
            class="p-2 flex items-center gap-2 rounded-lg hover:bg-gray-100"
          >
            <i v-html="icons.profile" />
            <span>Profile</span>
          </button>
          <button
            @click="logout()"
            class="p-2 flex items-center gap-2 rounded-lg hover:bg-gray-100"
          >
            <i v-html="icons.logout" />
            <span>Logout</span>
          </button>
        </div>
      </Dropdown>
    </div>
  </div>
</template>
