<script setup>
import icons from "@/utils/icons";
import Dropdown from "./Dropdown.vue";
import { useAuthStore } from "@/stores/auth";
import { ref, computed } from "vue";
import imageSrc from '@/assets/img/profile.png'

const authStore = useAuthStore();

const profilePicture=ref(authStore.auth?.user?.imageData || null)
async function processProfilePicture() {
  if (profilePicture.value!=null&&!profilePicture.value.startsWith("data:image/") ) {
    profilePicture.value = `data:image/png;base64,${authStore.auth?.user?.imageData}`;
    return
  }
  
}
processProfilePicture();

const imageLoaded = ref(true);



function handleImageError() {
  imageLoaded.value = false;
}
function logout() {
  localStorage.removeItem("userDetail");
  window.location.href = "/login";
}
const props = defineProps({
  breadcrumbs: Object,
});



</script>
<template>
  <div
    class="h-navbar-height bg-white flex items-center rounded-2xl justify-between pl-8 pr-4 shadow-sm"
  >
    <div class="flex items-center gap-4">
      <div class="cursor-pointer" @click="$router.back">
        <i v-html="icons.chevron_left"></i>
      </div>

      <div class="flex flex-col">
        <h1 class="text-lg">
          {{
            breadcrumbs.breadcrumbs[breadcrumbs.breadcrumbs.length - 1]?.name ||
            "HealthConnect"
          }}
        </h1>
        <!-- <p class="text-xs text-base-clr">Sample Data Analytics</p> -->
      </div>
    </div>
  <div class="hidden md:block">
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-lg shadow-inner">
        <span class="text-indigo-700 font-medium text-sm md:text-base">
          {{ authStore.auth?.user?.companyName || authStore.auth?.user?.roleName || ''}}
        </span>
      </div>
    </div>
    <div class="flex items-center gap-5">
      

      <Dropdown v-slot="{ setRef, toggleDropdown }">
        <div
          @click.prevent="toggleDropdown"
          class="flex items-center gap-2 px-5 py-3 rounded-lg bg-base-clr3 cursor-pointer"
        >
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
          >
            <img
              :src="profilePicture || imageSrc"
              alt="User avatar"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />
         
          </div>
          <div class="flex flex-col ">
            <span class="text-sm font-bold">{{
              authStore.auth.user?.firstName +
                " " +
                authStore.auth.user?.fatherName || ""
            }}</span>
            <span
              v-if="authStore.auth.user"
              class="text-xs  py-1 rounded-full font-medium"
            >
              {{ authStore.auth?.user?.companyName || authStore.auth?.user?.roleName || ''}}
            </span>
            
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
