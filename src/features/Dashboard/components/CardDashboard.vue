<script setup>
import { useAuthStore } from "@/stores/auth";
import icons from "@/utils/icons";
import { convertBase64Image } from "@/utils/utils";
import { ref } from "vue";
import companyLogo from '@/assets/img/companyLogo.jpeg'

const authStore = useAuthStore();

const profilePicture = ref(authStore.auth?.user?.logo);


async function processProfilePicture() {
  if (profilePicture.value && !profilePicture.value.startsWith("data:image/")) {
    profilePicture.value = `data:image/png;base64,${profilePicture.value}`;
    return
  }

 
}

processProfilePicture();
</script>

<template>
  <div class="flex items-start bg-primary relative  rounded-2xl">
    <div class="flex justify-between w-full">
      <div class="flex flex-col gap-6 p-8">
        <div class="bg-[#DFF1F1] py-1 px-2 w-fit rounded text-primary">
          Good Morning
        </div>
        <p class="text-3xl font-semibold text-white">
          Exclusive Health Perks for Your Team with {{authStore.auth?.user?.companyName	}}!
        </p>
        <p class="w-[816px] text-xl text-white/80">
          Unlock Exclusive Health Insurance Benefits for Your Team with {{authStore.auth?.user?.companyName}}! Discover a world of comprehensive coverage tailored
          specifically for your employees.
        </p>
        <div class="bg-[#DFF1F1] py-1 px-2 w-fit rounded text-primary">
          Get your contracts
        </div>
      </div>
      <div
        class="bg-white relative flex items-center justify-center mt-8 mr-8 w-[251px] h-f rounded-ss-[7.75rem] rounded-se-[7.75rem] h-[262px]"
      >
        <img
          class="absolute w-[9rem] top- h-[10rem]"
          :src="profilePicture || companyLogo"
          alt="Logo"
        />
      </div>
    </div>

    <i class="absolute w-full" v-html="icons.pattern"></i>
  </div>
</template>
