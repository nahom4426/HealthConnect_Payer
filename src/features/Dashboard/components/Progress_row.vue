<script setup>
import { getColumnValue } from "@/utils/utils";
import ProgressBar from "./ProgressBar.vue";

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
    class="bg-white border-b-[0.2px] border-[#F6F7FA]"
    :key="idx"
    v-for="(row, idx) in rowData"
  >
    <td class="p-3 text-base-clr">{{ idx + 1 }}</td>
    <td class="p-3" :key="key" v-for="key in rowKeys">
      <div class="truncate flex gap-4" v-if="key == 'totalClaim'">
        <ProgressBar
          :color="row.color"
          :percentage="row.percentage"
          height="0.4rem"
        />
      </div>
      <div class="truncate flex gap-4" v-else-if="key == 'sales'">
        <p class="px-2 py-1 rounded text-primary">
          {{ row.count }} / {{ row.total }}
        </p>
      </div>
      <span class="text-base-clr" v-else>
        {{ getColumnValue(key, row) }}
      </span>
    </td>
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
