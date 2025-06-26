<script setup>
const props = defineProps({
  aboutPayer: {
    type: Object,
  },
});
</script>

<template>
  <div class="flex flex-col gap-2 p-2 rounded-md bg-base-clr3 w-full">
    <h1 class="text-base-clr ml-2 border-b pb-2">About Payer</h1>

    <div class="flex flex-col">
      <div class="flex p-2 px-4">
        <span class="text-base-clr w-1/3">Payer Name</span>
        <span class="font-medium text-[#373946]/80 text-left">jhfhfhg</span>
      </div>
      <div class="flex p-2 px-4">
        <span class="text-base-clr w-1/3">Category</span>
        <span class="font-medium text-[#373946]/80 text-start">nmvnv</span>
      </div>
      <div class="flex p-2 px-4">
        <span class="text-base-clr w-1/3">Contact</span>
        <span class="font-medium text-[#373946]/80 text-left">hjgcgcg</span>
      </div>
    </div>
  </div>
</template>
