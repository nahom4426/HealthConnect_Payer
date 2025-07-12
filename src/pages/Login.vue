<script setup>
import LoginTemp from "./components/LoginTemp.vue";
import { ref, onMounted } from "vue";
import loginBg from '@/assets/img/login.jpg'
const isLoading = ref(true);

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
});
</script>

<template>
  <div
    class="box-border flex flex-col gap-6 md:grid md:grid-cols-5 scrollbar-hide rounded-lg p-6 bg-[#F6F7FA] h-full w-full"
  >
  <div
    :style="{ backgroundImage: `url(${loginBg})` }"
    class="bg-no-repeat bg-cover hidden md:block md:col-span-3 rounded-lg"
  />


    <div
      class="md:col-span-2 overflow-y-auto bg-[#DFF1F1] rounded-2xl h-full grid place-items-center box-border py-12 grid-cols-1 "
    >
      <LoginTemp class="mx-auto" />
    </div>
  </div>
</template>
