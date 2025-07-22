<template>
  <div class="spinner-container-circle">
    <div class="spinner-circle"></div>
    <p class="loading-text-circle">Please wait...</p>
  </div>
</template>

<script setup>
// No logic needed
</script>

<style scoped>
.spinner-container-circle {
  @apply flex flex-col justify-center items-center min-h-[150px] w-full gap-4;
  /* No background here, so it's transparent */
}

.spinner-circle {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(59, 130, 246, 0.2); /* Light blue border */
  border-top-color: #3b82f6; /* Solid blue top for animation */
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text-circle {
  font-family: 'Roboto', sans-serif;
  font-size: 1.1rem;
  font-weight: 400;
  color: #374151; /* Darker gray text */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>