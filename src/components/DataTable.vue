<script setup>
import { inject, watch } from "vue";

const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },

  showFooter: {
    type: Boolean,
    default: true,
  },
  lastCol: {
    type: Boolean,
    default: false,
  },
  firstCol: {
    type: Boolean,
    default: false,
  },
});

const next = inject("next", () => {});
const previous = inject("previous", () => {});

const page = inject("page", 1);
const totalPages = inject("totalPages", 1);
</script>
<template>
  <table class="min-w-full rounded-lg">
    <thead class="bg-accent capitalize my-5">
      <tr class="text-base-clr bg-[#F5F5FF]">
        <th v-if="firstCol" class="th p-4 text-left uppercase tracking-wider">
          <slot name="headerFirst"></slot>
        </th>

        <th class="th p-2 px-4 text-left uppercase tracking-wider">#</th>
        <!-- Add row number column -->
        <th v-for="header in headers" :key="header" class="p-4 text-left">
          {{ header }}
        </th>
        <th v-if="lastCol">
          <slot name="lastColHeader"></slot>
        </th>
      </tr>
    </thead>
    <slot />
  </table>
</template>
