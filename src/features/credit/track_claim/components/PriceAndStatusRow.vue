<script setup>
import Button from "@/components/Button.vue";
import icons from "@/utils/icons";
import {
  formatCurrency,
  formatDateToYYMMDD,
  getColumnValue,
} from "@/utils/utils";
import { computed } from "vue";
import { useRoute } from "vue-router";
import { openModal } from "@customizer/modal-x";

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
const route = useRoute();
const isOnDetailPage = computed(() => {
  return route.path === `/submitted_claims`;
});

const emit = defineEmits(["row"]);
</script>

<template>
  <tr
    @click.self="emit('row', row)"
    class="bg-white"
    :key="idx"
    v-for="(row, idx) in rowData"
  >
    <td class="p-3">{{ idx + 1 }}</td>
    <td class="p-3" :key="key" v-for="key in rowKeys">
      <div class="truncate flex gap-4" v-if="key == 'totalAmount'">
        <p class="bg-base-clr3 text-base-clr px-2 py-1 rounded">
          {{ formatCurrency(row?.totalAmount) }}
        </p>
      </div>
      <div class="truncate flex gap-4" v-else-if="key === 'visitDate'">
        <p class="text-base-clr px-2 py-1 rounded">
          {{ formatDateToYYMMDD(new Date(row?.visitDate)) }}
        </p>
      </div>
      <div class="truncate flex gap-4" v-else-if="key === 'submissionDate'">
        <p class="text-base-clr px-2 py-1 rounded">
          {{ formatDateToYYMMDD(new Date(row?.submissionDate)) }}
        </p>
      </div>
      <div class="truncate flex gap-4" v-else-if="key == 'totalPrice'">
        <p class="bg-secondary text-base-clr px-2 py-1 rounded">
          {{ formatCurrency(row?.totalPrice) }}
        </p>
      </div>

      <div class="truncate flex gap-4" v-else-if="key == 'claimStatus'">
        <p
          v-if="row?.claimStatus == 'SUBMITTED'"
          class="bg-base-clr3 text-base-clr px-2 py-1 rounded border border-base-clr"
        >
          Unchecked
        </p>
        <p
          v-else-if="row?.claimStatus == 'PAID'"
          class="bg-secondary border border-primary px-2 py-1 rounded text-primary"
        >
          Paid
        </p>

        <p
          v-else-if="row?.claimStatus == 'REJECTED'"
          class="bg-[#FFE8E8] border border-error px-2 py-1 rounded text-error"
        >
          REJECTED
        </p>
      </div>
      <span class="text-base-clr" v-else>
        {{ getColumnValue(key, row) }}
      </span>
    </td>
    <td
      class="p-3 flex gap-3"
      v-if="headKeys.find((head) => head.toLowerCase() == 'actions')"
    ></td>

    <td
      class="p-3"
      v-if="headKeys.includes('Actions') || headKeys.includes('actions')"
    >
      <Button
        @click.prevent="
          isOnDetailPage
            ? $router.push(`/submitted_claims/detail/${row?.claimUuid}`)
            : openModal('ClaimDetail', row)
        "
        class="!text-white"
        type="primary"
      >
        Detail
      </Button>
    </td>
  </tr>
</template>
