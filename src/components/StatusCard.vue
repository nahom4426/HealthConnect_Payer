<script setup>
import icons from "@/utils/icons";

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
  id: {
    type: String,
  },
  level: {
    type: String,
    default: "C-Level",
  },
  customClass: {
    type: String,
    default: "bg-base-clr3",
  },
});
const copyToClipboard = async () => {
  await navigator.clipboard.writeText(props.id);
};
</script>

<template>
  <div
    :class="[props.customClass]"
    class="flex flex-col gap-2 p-2 rounded-md w-full h-fit"
  >
    <div class="bg-secondary w-fit p-2 rounded-md flex gap-4 items-center">
      <div
        class="bg-primary text-white px-3 py-2 gap-2 rounded flex items-center"
      >
        <i v-html="icons.right"></i>
        <p>{{ props.status }}</p>
      </div>
      <div v-if="props.id" class="flex gap-1 p-1">
        <p class="text-primary">{{ props.id }}</p>
        <div
          class="cursor-pointer"
          @click="navigator.clipboard.writeText(props.id)"
        >
          <i v-html="icons.copy"></i>
        </div>
      </div>
    </div>
    <div class="bg-secondary w-fit text-primary px-6 py-3 rounded">
      {{ props.level }}
    </div>
  </div>
</template>
