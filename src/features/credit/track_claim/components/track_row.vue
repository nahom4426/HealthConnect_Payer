<script setup>
import Button from "@/components/Button.vue";
import icons from "@/utils/icons";
import {
  formatCurrency,
  formatDateToYYMMDD,
  getColumnValue,
  toasted,
} from "@/utils/utils";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { openModal } from "@customizer/modal-x";
import Dropdown from "@/components/Dropdown.vue";
import { approveClaim } from "@/features/claim/api/clinicalApi";
import { useApiRequest } from "@/composables/useApiRequest";
import { useSubmittedClaimStore } from "@/features/claim/store/submittedClaimStore";

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
  cells: Object,
});

const route = useRoute();
const isOnDetailPage = computed(() => {
  return route.path === `/track_claims`;
});
const api = useApiRequest();
const submittedClaimStore = useSubmittedClaimStore();

const emit = defineEmits(["row"]);

function getStatusStyle(claimStatus) {
  const base = "inline-flex justify-center items-center min-w-[80px] px-3 py-1 rounded text-sm font-semibold";

  switch (claimStatus?.toUpperCase()) {
    case "APPROVED":
      return `${base} bg-green-100 text-green-800`;
    case "ACTIVE":
      return `${base} bg-green-100 text-green-800`;
    case "SUBMITTED":
      return `${base} bg-yellow-100 text-yellow-800`;
    case "INACTIVE":
      return `${base} bg-red-100 text-red-800`;
    case "PENDING":
      return `${base} bg-yellow-100 text-yellow-800`;
    case "ACCEPTED":
      return `${base} bg-blue-100 text-blue-800`;
    case "REJECTED":
      return `${base} bg-red-100 text-red-800`;
    case "RESUBMITTED":
      return `${base} bg-purple-100 text-purple-800`;
    case "SUSPENDED":
      return `${base} bg-yellow-100 text-yellow-800`;
    default:
      return `${base} bg-gray-100 text-gray-800`;
  }
}
function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(el => el.classList.add('hidden'));
}

function handleEditWithClose(row) {
  closeAllDropdowns();
  handleEdit(row);
}

function handleEdit(row) {
  console.log('EditCreditServices modal opened with row:', row)
  if (row.dispensingUuid) {
    openModal('EditCreditServices', {
      dispensingUuid: row.dispensingUuid,
      claim: row,
      onUpdated: (updatedClaim) => {
        claimServicesStore.update(updatedClaim.dispensingUuid, updatedClaim);
        addToast({
          type: 'success',
          title: 'Updated',
          message: 'Claim updated successfully'
        });
      },
      onCancel: () => {
        // Handle cancel if needed
      }
    });
  } else if (typeof props.onEdit === 'function') {
    props.onEdit(row);
  }
}

function handleRejection(id) {
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
              submittedClaimStore.updateStatus(id, "REJECTED");
            }
            toasted(res.success, "Claim Rejected Successfully", res.error);
          }
        );
      }
    }
  );
}

function areAllClaimsApproved() {
  const claims = submittedClaimStore.getAll();
  return claims.length > 0 && claims.every(claim => 
    claim.claimStatus?.toUpperCase() === "APPROVED" || 
    claim.status?.toUpperCase() === "APPROVED"
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

      <div v-else-if="key === 'claimStatus' || key === 'status'" class="truncate">
        <span
          class="px-2.5 py-1 rounded-md text-xs font-medium"
          :class="getStatusStyle(row.claimStatus || row.status)"
        >
          {{ row.claimStatus || row.status }}
        </span>
      </div>
      <span class="text-base-clr" v-else>
        {{ getColumnValue(key, row) }}
      </span>
    </td>

    <td class="p-3" v-if="headKeys.includes('Actions') || headKeys.includes('actions')">
      <!-- Primary Detail Button (Only shown on detail page) -->
      <Button
        v-if="isOnDetailPage"
        @click.prevent="$router.push(`/track_claims/detail/${row?.claimUuid}`)"
        class="!text-white"
        type="primary"
      >
        Detail
      </Button>

      <!-- Three-dots Dropdown (Only shown when NOT on detail page) -->
      <Dropdown v-if="!isOnDetailPage" v-slot="{ setRef, toggleDropdown }">
        <div @click.prevent="toggleDropdown" class="flex items-center gap-2 px-5 py-3 rounded-lg cursor-pointer">
          <button>
            <i v-html="icons.threeDots"></i>
          </button>
        </div>
        <div
          class="flex shadow-lg text-base py-2 border border-gray-100 text-start justify-start mt-2 rounded-lg flex-col gap-2 bg-white"
          :ref="setRef"
        >
          <!-- Details Button in Dropdown -->
          <button
            @click.prevent="openModal('ClaimDetail', row)"
            class="p-2 flex text-base-clr pr-8 items-center gap-2 rounded-lg hover:bg-gray-100"
          >
            <i v-html="icons.details" />
            <span>Details</span>
          </button>

          <!-- Approve Button (Only if not already approved) -->
          <button
            v-if="row?.claimStatus !== 'APPROVED'"
            @click.stop="handleEditWithClose(row)"
            class="p-2 flex text-primary items-center gap-2 rounded-lg hover:bg-gray-100"
          >
            <i v-html="icons.edits" />
            <span>Resubmit</span>
          </button>

          <!-- Reject Button (Only if not already rejected) -->
          <button
            v-if="row?.claimStatus !== 'REJECTED'"
            @click="handleRejection(row?.dispensingUuid)"
            class="p-2 flex items-center text-red-500 gap-2 rounded-lg hover:bg-gray-100"
          >
            <i v-html="icons.deactivate" />
            <span>Reject</span>
          </button>
        </div>
      </Dropdown>
    </td>
  </tr>
</template>