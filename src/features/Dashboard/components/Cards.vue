<script setup>
import icons from "@/utils/icons";

const props = defineProps({
  data: {
    type: Array,
  },
  customClass: String,
});
</script>
<template>
  <div
    v-for="entries in props.data"
    :key="entries.title"
    :class="[entries.customClass]"
    class="flex flex-col gap-3 p-4 rounded-xl"
  >
    <i v-html="entries.today" />
    <p class="font-semibold leading-8">{{ entries.amount }}</p>
    <p class="text-xs text-base-clr">{{ entries.title }}</p>

    <div class="flex gap-1 text-primary text-[9px] font-medium">
      <p class="">{{ entries.percent }}</p>
      from last year
    </div>
  </div>
</template>
