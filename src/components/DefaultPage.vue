<!-- DefaultPage.vue -->
<script setup>
import icons from "@/utils/icons";
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: String,
  placeholder: String,
});
const emit = defineEmits(["update:modelValue"]);

const search = ref(props.modelValue || "");

watch(search, () => {
  emit("update:modelValue", search.value);
});
</script>

<template>
  <div class="flex flex-col h-full bg-white rounded-2xl p-6 gap-6">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
    >
      <!-- Search Bar -->
      <div
        tabindex="0"
        class="w-full md:max-w-[28rem] bg-base-clr3 h-[3.5rem] focus-within:border-primary flex items-center rounded-lg overflow-hidden"
      >
        <span
          class="w-10 h-full text-base-clr grid place-items-center"
          v-html="icons.search"
        />
        <input
          v-model="search"
          :placeholder="placeholder || 'Search...'"
          class="flex-1 bg-transparent px-4 py-2 h-full outline-none"
        />
      </div>

      <div class="flex items-center gap-5 w-full md:w-auto">
        <slot name="filter"> </slot>

        <slot name="add-action"> </slot>

        <slot name="more" />
      </div>
    </div>

    <slot :search="search" />
  </div>
</template>
