<script setup lang="ts">
import icons from "@/utils/icons";
import {
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  ref,
  type PropType,
} from "vue";

const props = defineProps({
  pending: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: "sm",
  },
  type: {
    type: String as PropType<"primary" | "secondary">,
  },
});
</script>
<template>
  <button
    v-ripple
    :class="[$style?.[size], $style?.[type ? type : '']]"
    class="__ripple px-4 py-1 flex items-center justify-center rounded capitalize"
  >
    <slot v-if="!pending"></slot>

    <p v-else v-html="icons.spinner" />
  </button>
</template>
<style module>
.xs {
  width: auto;
  height: auto;
}

.sm {
  min-width: 3.6rem;
  min-height: 2rem;
}

.md {
  min-width: 6.8rem;
  min-height: 3rem;
}

.lg {
  min-width: 6.8rem;
  min-height: 3.625rem;
}

.secondary {
  @apply bg-secondary text-error;
}

.primary {
  @apply bg-primary text-error;
}
</style>
