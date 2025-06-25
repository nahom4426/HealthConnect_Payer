<template>
  <div class="spinner-container">
    <div class="spinner">
      <div class="spinner-inner">
        <div class="spinner-core"></div>
      </div>
      <p class="loading-text">Loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional logic needed for the spinner
</script>

<style scoped>
.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner-inner {
  position: relative;
  width: 60px;
  height: 60px;
  animation: rotate 1.8s linear infinite;
}

.spinner-core {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid transparent;
  border-top-color: #3b82f6;
  border-bottom-color: #3b82f6;
  animation: spin 1.2s ease-in-out infinite;
}

.spinner-inner::before {
  content: "";
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
  border-radius: 50%;
  border: 4px solid transparent;
  border-left-color: #10b981;
  border-right-color: #10b981;
  animation: spinReverse 1.4s linear infinite;
}

.loading-text {
  font-family: "Segoe UI", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: #4b5563;
  letter-spacing: 0.05em;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
    border-top-color: #10b981;
    border-bottom-color: #10b981;
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spinReverse {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(-180deg);
    border-left-color: #3b82f6;
    border-right-color: #3b82f6;
  }
  100% {
    transform: rotate(-360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}
</style>
