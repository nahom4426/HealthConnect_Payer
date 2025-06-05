<script setup>
import { formatCurrency, getColumnValue, toasted } from "@/utils/utils";
const props = defineProps({
  rowData: {
    type: Array,
    required: true,
  },
  headKeys: {
    type: Array,
  },
  cells: {},
  rowKeys: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["row"]);
console.log(props?.rowData);
</script>

<template>
  <template :key="idx" v-for="(row, idx) in rowData">
    <tr @click.self="emit('row', row)" class="bg-white border-b-[0.2px]">
      <td class="p-3">{{ idx + 1 }}</td>

      <td class="p-3" :key="key" v-for="key in rowKeys">
        <p v-if="key == 'totalAmount'" class="px-4 py-1">
          {{ formatCurrency(row?.totalAmount) }}
        </p>
        <span v-else>
          {{ getColumnValue(key, row) }}
        </span>
      </td>
    </tr>
  </template>
</template>
