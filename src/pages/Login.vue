<script setup>
import LoginTemp from "./components/LoginTemp.vue";
import { ref, onMounted } from "vue";

const isLoading = ref(true);
const loginImageUrl = new URL("@/assets/img/login.jpg", import.meta.url).href;

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
});
</script>

<template>
  <div
    class="flex flex-col gap-6 md:grid md:grid-cols-5 overflow-y-scroll scrollbar-hide rounded-lg p-6 bg-[#F6F7FA] min-h-screen w-full"
  >
    <div class="hidden md:block md:col-span-3 rounded-lg sticy h-screen">
      <img
        :src="loginImageUrl"
        alt="Login background"
        class="w-full h-full object-cover rounded-2xl"
      />
    </div>

    <div
      class="md:col-span-2 overflow-y-auto bg-[#DFF1F1] mr-12 rounded-2xl h-full flex items items-center md:justify-center"
    >
      <LoginTemp />
    </div>
  </div>
</template>
