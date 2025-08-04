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
import { useClinical } from "@/features/claim/store/clinicalStore";
import { approveBatchClaims } from "@/features/claim/api/batchClaim";
import { useSubmittedClaimStore } from "@/features/claim/store/submittedClaimStore";

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
  return route.path === `/payment`;
});
const api = useApiRequest();

const emit = defineEmits(["row"]);
const clinicalStore = useClinical();
const title = ref(isOnDetailPage ? "Approve Claim" : "Approve Batch Claim");
function getStatusStyle(status) {
  const base = "inline-flex justify-center items-center min-w-[80px] px-3 py-1 rounded text-sm font-semibold";

  switch (status?.toUpperCase()) {
    case "APPROVED":
      return `${base} bg-green-100 text-green-800`;
      case "ACTIVE":
      return `${base} bg-green-100 text-green-800`;
      case "SUBMITTED":
      return `${base} bg-yellow-100 text-yellow-800`;
        // Light green for active
    case "INACTIVE":
      return `${base} bg-red-100 text-red-800`;    // Light gray for inactive
    case "PENDING":
      return `${base} bg-yellow-100 text-yellow-800`; // Light yellow for pending
    case "ACCEPTED":
      return `${base} bg-blue-100 text-blue-800`;     // Light blue for accepted
    case "REJECTED":
      return `${base} bg-red-100 text-red-800`;       // Light red for rejected
    case "RESUBMITTED":
      return `${base} bg-purple-100 text-purple-800`;
    case "SUSPENDED":
      return `${base} bg-yellow-100 text-yellow-800`; // Light yellow for suspended
    default:
      return `${base} bg-gray-100 text-gray-800`;    // Default light gray
  }
}
const message = ref(
  isOnDetailPage
    ? "Are you sure you want to approve this claim?"
    : "Are you sure you want to approve this batch?"
);

const submittedClaimStore = useSubmittedClaimStore();

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
            () => approveBatchClaims(id, { newStatus: "SUBMITTED" }),
            (res) => {
              if (res.success) {
                submittedClaimStore.remove(claimUuid);
                //   clinicalStore.remove(id);
              }
              toasted(res.success, "Claim Approved Successfully", res.error);
            }
          );
        } else {
          api.send(
            () => approveClaim(id, { newStatus: "SUBMITTED" }),
            (res) => {
              if (res.success) {
                clinicalStore.remove(id);
              }
              toasted(res.success, "Claim Approved Successfully", res.error);
            }
          );
        }
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
          v-if="row?.claimStatus == 'DRAFT'"
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
       <div v-else-if="key === 'status'" class="truncate">
        <span
          class="px-2.5 py-1 rounded-md text-xs font-medium"
          :class="getStatusStyle(row.status)"
        >
          {{ row.status }}
        </span>
      </div>
      <span class="text-base-clr" v-else>
        {{ getColumnValue(key, row) }}
      </span>
    </td>

    <td
      class="p-3"
      v-if="headKeys.includes('Actions') || headKeys.includes('actions')"
    >
      <Button
        @click.prevent="
          isOnDetailPage
            ? $router.push(`/payment/detail/${row?.claimUuid}`)
            : openModal('ClaimDetail', row)
        "
        type="primary"
      >
        <span>Open</span>
      </Button>
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
