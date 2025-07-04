<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="bg-white p-4 rounded-xl">
    <h2 class="text-xl font-semibold mb-4">{{ title }}</h2>
    <div class="chart-container">
      <slot></slot>
    </div>
  </div>
</template>
