<script setup lang="ts">
import { useColorStore } from "./stores/colorStore";

const colorStore = useColorStore();
</script>

<template>
  <RouterView :class="colorStore.color" />
</template>
