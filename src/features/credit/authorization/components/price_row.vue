<script setup>
import icons from "@/utils/icons";
import { formatCurrency, getColumnValue } from "@/utils/utils";

const props = defineProps({
  rowData: {
    type: Array,
    required: true,
  },
  headKeys: {
    type: Array,
  },
  rowKeys: {
    type: Array,
    required: true,
  },
  cells: Object,
});

const emit = defineEmits(["row"]);
</script>

<template>
  <tr
    @click.self="emit('row', row)"
    class="bg-white border-b-[0.2px]"
    :key="idx"
    v-for="(row, idx) in rowData"
  >
    <td class="p-3">{{ idx + 1 }}</td>
    <td class="p-3" :key="key" v-for="key in rowKeys">
      <div class="truncate flex gap-4" v-if="key == 'unitPrice'">
        <p class="bg-secondary text-primary px-2 py-1 rounded">
          {{ formatCurrency(row?.unitPrice) }}
        </p>
      </div>
      <div class="truncate flex gap-4" v-else-if="key == 'totalPrice'">
        <p class="bg-secondary text-primary px-2 py-1 rounded">
          {{ formatCurrency(row?.totalPrice) }}
        </p>
      </div>
      <span v-else>
        {{ getColumnValue(key, row) }}
      </span>
    </td>
    <td
      class="p-3 flex gap-3"
      v-if="headKeys.find((head) => head.toLowerCase() == 'actions')"
    ></td>
  </tr>
  <tr v-if="!rowData?.length">
    <td :colspan="headKeys.length + 1">
      <slot name="placeholder">
        <div class="flex-1 w-full flex justify-center py-5 *:h-56">
          <div class="text-xl">
            {{ "No Data Found" }}
          </div>
        </div>
      </slot>
    </td>
  </tr>
</template>
