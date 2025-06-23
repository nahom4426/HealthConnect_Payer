<script setup>
const emit = defineEmits(["user", "previous"]);
</script>
<template>
  <div class="flex flex-col items-center gap-8 px-4">
    <div class="flex flex-col items-center justify-center gap-4">
      <h1 class="font-semibold text-xl">Congratulations!</h1>
      <h2 class="w-[360px] text-center">
        You have successfully reset your password. Now, log in to the system
        using your new password.
      </h2>
    </div>
    <Button
      @click.prevent="emit('user')"
      class="w-full bg-primary !text-white rounded-xl !py-5"
      type="primary"
      >Login</Button
    >

    <h1 class="text-base-clr text-xs">©HealthConnect 2025</h1>
  </div>
</template>
