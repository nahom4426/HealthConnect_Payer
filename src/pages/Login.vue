<script setup>
import LoginForm from "./LoginForm.vue";
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
    class="flex flex-col md:flex-row rounded-lg min-h-screen w-full bg-white"
  >
    <!-- Left: Image (hidden on small screens) -->
    <div
      class="hidden md:block md:w-1/2 rounded-lg m-6 lg:w-1/2 sticky top-0 h-screen"
    >
      <img
        :src="loginImageUrl"
        alt="Login background"
        class="object-cover w-full h-full rounded-lg"
      />
    </div>

    <!-- Right: Login Form -->
    <div
      class="w-full md:w-1/2 lg:w-1/2 bg-[#DFF1F1] rounded-md flex items-center justify-center"
    >
      <div class="">
        <LoginForm />
      </div>
    </div>
  </div>
</template>

<style scoped>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* Make right-side form area scrollable independently */
@media (max-width: 768px) {
  .overflow-y-auto {
    max-height: 100vh;
  }
}
</style>
