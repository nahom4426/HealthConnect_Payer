<script setup>
const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  header: {
    type: String,
  },
  customClass: {
    type: String,
    default: "bg-base-clr3",
  },
});
</script>

<template>
  <div
    :class="[props.customClass]"
    class="flex flex-col gap-2 p-2 rounded-md w-"
  >
    <h1 v-if="header" class="text-base-clr ml-2 border-b pb-2">
      {{ props.header }}
    </h1>

    <div class="flex flex-col">
      <div v-for="(item, index) in data" :key="index" class="flex p-2 px-4">
        <span class="text-base-clr w-1/3">{{ item.title }}</span>
        <span class="font-medium text-[#373946]/80 text-left">{{
          item.value
        }}</span>
      </div>
    </div>
  </div>
</template>
