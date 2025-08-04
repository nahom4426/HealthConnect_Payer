<script setup>
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
import { useRouter } from 'vue-router';
const router = useRouter();
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
  return route.path === `/clinical_approval`;
});
const api = useApiRequest();

const emit = defineEmits(["row"]);
const clinicalStore = useClinical();
const title = ref(isOnDetailPage ? "Approve Claim" : "Approve Batch Claim");

const message = ref(
  isOnDetailPage
    ? "Are you sure you want to approve this claim?"
    : "Are you sure you want to approve this batch?"
);

function getStatusStyle(claimStatus) {
  const base = "inline-flex justify-center items-center min-w-[80px] px-3 py-1 rounded text-sm font-semibold";

  switch (claimStatus?.toUpperCase()) {
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
const submittedClaimStore = useSubmittedClaimStore();

function handleApproval(id, main) {
  openModal(
    "Confirmation",
    {
      title: title.value,
      message: message.value,
    },
    async (confirmed) => {
      if (confirmed) {
        if (main) {
          await api.send(
            () => approveBatchClaims(id, { newStatus: "SUBMITTED" }),
            (res) => {
              if (res.success) {
                submittedClaimStore.remove(id); // Changed from claimUuid to id
                // clinicalStore.remove(id);
              }
              toasted(res.success, "Claim Submitted Successfully", res.error);
            }
          );
        } else {
          await api.send(
            () => approveClaim(id, { newStatus: "SUBMITTED" }),
            (res) => {
              if (res.success) {
                clinicalStore.updateStatus(id, "SUBMITTED");
                // Check if all claims are submitted and redirect
                if (areAllClaimsSubmitted()) {
                  toasted(true, "All claims submitted successfully! Redirecting...");
                  setTimeout(() => {
                    router.push('/clinical_approval');
                  }, 500);
                } else {
                  toasted(res.success, "Claim Submitted Successfully", res.error);
                }
              }
            }
          );
        }
      }
    }
  );
}

// Helper function to check if all claims are submitted
function areAllClaimsSubmitted() {
  const claims = clinicalStore.getAll(); // Or whichever method gets your claims
  return claims.length > 0 && claims.every(claim => 
    claim.claimStatus?.toUpperCase() === "SUBMITTED" || 
    claim.status?.toUpperCase() === "SUBMITTED"
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

     
        <div v-else-if="key === 'claimStatus' || key === 'status'" class="truncate">
        <span class="px-2.5 py-1 rounded-md text-xs font-medium" :class="getStatusStyle(row.claimStatus || row.status)">
          {{ row.claimStatus || row.status }}
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
  class="flex shadow-lg text-base p-2 mt-2 rounded-lg flex-col gap-2 bg-white"
  :ref="setRef"
>
  <!-- Open Button (Always Visible) -->
  <button
    @click.prevent="
      isOnDetailPage
        ? $router.push(`/clinical_approval/detail/${row?.claimUuid}`)
        : openModal('ClaimDetail', row)
    "
    class="p-2 flex text-base-clr items-center gap-2 rounded-lg hover:bg-gray-100"
  >
    <i v-html="icons.details" />
    <span>Details</span>
  </button>

  <!-- Approve Button (Only on Detail Page) -->
 <button
  v-if="!isOnDetailPage && row?.claimStatus !== 'SUBMITTED'"
  @click="handleApproval(row?.dispensingUuid)"
  class="p-2 flex  text-primary items-center gap-2 rounded-lg hover:bg-gray-100"
>
  <i v-html="icons.activate" />
  <span>Approve</span>
</button>


  <!-- Reject Button (Only on Detail Page) -->
  <button
    v-if="!isOnDetailPage && row?.claimStatus !== 'REJECTED'"
    @click="openModal('ClinicalRejection', row)"
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
