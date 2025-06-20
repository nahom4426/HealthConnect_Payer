<script setup>
import InputError from "./InputError.vue";

const props = defineProps(["label", "error"]);
</script>

<template>
  <div class="flex flex-col items-start gap-1">
    <div class="flex flex-col gap-1 w-full">
      <span
        :title="label"
        class="text-sm capitalize text-[#75778B] truncate"
        v-if="label"
        >{{ label }}</span
      >
      <div
        class="max-w-full border-dark/10 bg-[#F9F9FD] p-2 overflow-hidden text-base rounded-md min-h-9 flex"
        :class="$attrs.class"
      >
        <slot></slot>
      </div>
    </div>
    <InputError :error="error" />
  </div>
</template>

<style>
.custom-input,
.custom-input,
.custom-input,
.skip_custom-input {
  border: none;
  outline: none;
  width: 100%;
  background-color: transparent;
  padding: 0 0.5rem;
  height: 2.5rem;
  box-shadow: none;
  @apply text-sm;
}

textarea.custom-input {
  padding: 0.5rem;
  resize: none;
  height: 6rem;
}
.custom-input::placeholder {
  color: theme("colors.dark");
  opacity: 0.6;
}

select.custom-input {
  height: 2.5rem;
}
</style>
