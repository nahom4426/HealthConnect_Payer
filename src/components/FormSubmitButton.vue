<script setup>
import { inject, watch } from "vue";
import Button from "./Button.vue";
import { Icon } from "@iconify/vue";

defineProps({
  btnText: {
    type: String,
  },
  pending: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
  },
});

const pendingRequest = inject("pending", false);
</script>
<template>
  <Button
    :size="size"
    class="w-full h-10 text-sm bg-primary text-white rounded-xl"
  >
    <span v-if="!pending && !pendingRequest">{{ btnText }}</span>

    <Icon icon="svg-spinners:3-dots-scale" class="text-2xl" v-else />
  </Button>
</template>
