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
  <div class="flex flex-col h-full bg-white px-4">
    <!-- Header Row -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 my-6 pt-6">
      <!-- Search Bar -->
      <div
        tabindex="0"
        class="w-full md:max-w-[30rem] h-14 bg-[#F6F7FA] focus-within:border-primary flex items-center border rounded-md overflow-hidden"
      >
        <span
          class="w-10 h-full text-base-clr bg-[#F6F7FA] grid place-items-center"
          v-html="icons.search"
        />
        <input
          v-model="search"
          :placeholder="placeholder || 'Search...'"
          class="bg-[#F6F7FA] flex-1 px-4 py-2 h-full outline-none"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3 w-full md:w-auto">
        <!-- Filter Button Slot -->
        <slot name="filter">
          <button class="btn btn-outline h-14 px-6 text-primary border-primary hover:bg-primary/10">
            Filters
          </button>
        </slot>

        <!-- Add Button Slot -->
        <slot name="add-action">
          <button class="btn h-14 px-6 bg-primary text-white hover:bg-primary-dark">
            + Add User
          </button>
        </slot>

        <!-- More Actions Slot -->
        <slot name="more" />
      </div>
    </div>

    <!-- Content Slot -->
    <slot :search="search" />
  </div>
</template>

<style scoped>
input::placeholder {
  color: #9ca3af; /* Tailwind's gray-400 */
}

.btn {
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  font-weight: 500;
  white-space: nowrap;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid;
}

@media (max-width: 767px) {
  .flex-col .btn {
    width: 100%;
  }
}
</style>