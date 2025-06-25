<script setup>
import { ref } from "vue";
import Button from "@/components/Button.vue";
import Fireworks from "@/components/Fireworks.vue";

const emit = defineEmits(["user", "previous"]);
const showFireworks = ref(true);
</script>

<template>
  <div
    class="flex flex-col items-center gap-8 px-4 max-w-md mx-auto overflow-hidden"
  >
    <Fireworks v-if="showFireworks" :trigger="showFireworks" />

    <div
      class="flex flex-col items-center justify-center gap-4 transition-all duration-500 w-full"
    >
      <h1 class="font-semibold text-xl">Congratulations!</h1>
      <h2 class="w-[320px] text-center">
        You have successfully reset your password. Now, log in to the system
        using your new password.
      </h2>
    </div>

    <Button
      @click.prevent="emit('user')"
      class="w-full bg-primary !text-white rounded-xl !py-5 transition-all duration-500"
      type="primary"
    >
      Login
    </Button>

    <h1 class="text-base-clr text-xs">©HealthConnect 2025</h1>
  </div>
</template>
