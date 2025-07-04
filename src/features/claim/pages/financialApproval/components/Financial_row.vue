<script setup>
import Button from "@/components/Button.vue";
import icons from "@/utils/icons";
import {
  formatCurrency,
  formatDateToYYMMDD,
  getColumnValue,
  toasted,
} from "@/utils/utils";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { openModal } from "@customizer/modal-x";
import Dropdown from "@/components/Dropdown.vue";
import { approveClaim } from "@/features/claim/api/clinicalApi";
import { useApiRequest } from "@/composables/useApiRequest";
import { approveBatchClaims } from "@/features/claim/api/batchClaim";
import { useFinancialStore } from "@/features/claim/store/financialStore";
import { useFinancialDetailStore } from "@/features/claim/store/financialDetailStore";

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
  pending: Boolean,
  cells: Object,
});
const route = useRoute();
const isOnDetailPage = computed(() => {
  return route.path === `/financial_approval`;
});
const api = useApiRequest();

const emit = defineEmits(["row"]);
const financialDetailStore = useFinancialDetailStore();
const title = ref(isOnDetailPage ? "Approve Claim" : "Approve Batch Claim");
const message = ref(
  isOnDetailPage
    ? "Are you sure you want to approve this claim?"
    : "Are you sure you want to approve this batch claim?"
);
const financialStore = useFinancialStore();

function handleApproval(id, main) {
  openModal(
    "Confirmation",
    {
      title: title.value,
      message: message.value,
    },
    (confirmed) => {
      if (confirmed) {
        if (main) {
          api.send(
            () => approveBatchClaims(id, { newStatus: "APPROVED" }),
            (res) => {
              if (res.success) {
                financialStore.remove(claimUuid);
                //   clinicalStore.remove(id);
              }
              toasted(res.success, "Claim Approved Successfully", res.error);
            }
          );
        } else {
          api.send(
            () => approveClaim(id, { newStatus: "APPROVED" }),
            (res) => {
              if (res.success) {
                financialDetailStore.remove(id);
              }
              toasted(res.success, "Claim Approved Successfully", res.error);
            }
          );
        }
      }
    }
  );
}
function handleDelete(id) {
  openModal(
    "Confirmation",
    {
      title: "Reject Claim",
      message: "Are you sure you want to reject this claim?",
    },
    (confirmed) => {
      if (confirmed) {
        api.send(
          () => approveClaim(id, { newStatus: "REJECTED" }),
          (res) => {
            if (res.success) {
              clinicalStore.remove(id);
            }
            toasted(res.success, "Claim Rejected Successfully", res.error);
          }
        );
      }
    }
  );
}
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
        <p class="bg-secondary text-primary px-2 py-1 rounded">
          {{ formatCurrency(row?.totalAmount) }}
        </p>
      </div>
      <div class="truncate flex gap-4" v-else-if="key === 'visitDate'">
        <p class="text-base-clr px-2 py-1 rounded">
          {{ formatDateToYYMMDD(new Date(row?.visitDate)) }}
        </p>
      </div>
      <div class="truncate flex gap-4" v-else-if="key === 'encounterDate'">
        <p class="text-base-clr px-2 py-1 rounded">
          {{ formatDateToYYMMDD(new Date(row?.encounterDate)) }}
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
          {{ row?.claimStatus }}
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
      class="p-3"
      v-if="headKeys.includes('Actions') || headKeys.includes('actions')"
    >
      <Dropdown v-slot="{ setRef, toggleDropdown }">
        <div
          @click.prevent="toggleDropdown"
          class="flex items-center gap-2 px-5 py-3 rounded-lg cursor-pointer"
        >
          <button>
            <i v-html="icons.threeDots"></i>
          </button>
        </div>
        <div
          class="flex shadow-lg text-base p-2 mt-2 rounded-lg flex-col gap-2 w-60 bg-white"
          :ref="setRef"
        >
          <button
            @click.prevent="
              isOnDetailPage
                ? $router.push(`/financial_approval/detail/${row?.claimUuid}`)
                : openModal('ClaimDetail', row)
            "
            class="p-2 flex text-base-clr items-center gap-2 rounded-lg hover:bg-gray-100"
          >
            <i v-html="icons.edits" />
            <span>Open</span>
          </button>

          <button
            @click="
              isOnDetailPage
                ? handleApproval(row?.claimUuid, isOnDetailPage)
                : handleApproval(row?.dispensingUuid, isOnDetailPage)
            "
            class="p-2 flex text-base-clr items-center gap-2 rounded-lg hover:bg-gray-100"
          >
            <i v-html="icons.details" />
            <span>Approve</span>
          </button>
          <button
            @click="handleDelete(row?.dispensingUuid)"
            class="p-2 flex items-center text-red-500 gap-2 rounded-lg hover:bg-gray-100"
          >
            <i v-html="icons.deactivate" />
            <span>Reject</span>
          </button>
        </div>
      </Dropdown>
    </td>
  </tr>
  <tr v-if="!rowData?.length && !pending">
    <td :colspan="headKeys.length + 1">
      <div class="flex-1 w-full flex flex-col items-center py- h-full">
        <img
          class="size-60"
          src="../../../../../assets/img/noData.gif"
          alt=""
        />
        <p class="text-xl">No Data Found</p>
      </div>
    </td>
  </tr>
</template>
