<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, ref } from 'vue';
import Button from "@/components/Button.vue";
import { openModal } from '@customizer/modal-x';

// import { changeInsuredStatus, getPayerbyPayerUuid } from "../api/submitClaimsApi";
import { useToast } from '@/toast/store/toast';
import icons from "@/utils/icons";
import { watch } from 'vue';
import { claimServices } from '../../submit_claims/store/submitClaimsStore';
import Dropdown from '@/components/Dropdown.vue';

const props = defineProps({
  rowData: { type: Array, required: true },
  rowKeys: { type: Array, required: true },
  headKeys: { type: Array, required: true },
  onView: { type: Function, default: () => { } },
  onEdit: { type: Function, default: () => { } },
  onActivate: { type: Function, default: () => { } },
  onDeactivate: { type: Function, default: () => { } },
  onRowClick: { type: Function, default: () => { } },
  onRemove: { type: Function, default: () => { } } // Add this new prop for remove action
});

const { addToast } = useToast();
const insuredStore = claimServices();
const payerNames = ref<Record<string, string>>({});

function handleImageError(event) {
  event.target.src = '/assets/placeholder-profile.png';
}
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
function handleEdit(row) {
  if (row.insuredUuid) {
    openModal('EditInsured', {
      insuredUuid: row.insuredUuid,
      insured: row,
      onUpdated: updated => insuredStore.update(updated.insuredUuid, updated)
    });
  } else if (typeof props.onEdit === 'function') {
    props.onEdit(row);
  }
}

function toggleDropdown(event, rowId) {
  event.stopPropagation();
  closeAllDropdowns();
  const dropdown = document.getElementById(`dropdown-${rowId}`);
  if (dropdown) dropdown.classList.toggle('hidden');
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(el => el.classList.add('hidden'));
}

function handleEditWithClose(row) {
  closeAllDropdowns();
  handleEdit(row);
}

// Add this new function for handling remove action
function handleRemoveWithClose(claimId) {
  closeAllDropdowns();
  if (typeof props.onRemove === 'function') {
    props.onRemove(claimId);
    console.log('Removing claim:', claimId);
  }
}
function handleRemove(claimId: string) {
  if (typeof props.onRemove === 'function') {
    props.onRemove(claimId);
    console.log('Removing claim:', claimId);
  }
}
const removeClaim = (claimUuid: string) => {
  console.log('Removing claim:', claimUuid); // Add this
  selectedClaims.value = selectedClaims.value.filter(
    claim => claim.dispensingUuid !== claimUuid
  );
};
</script>

<template>
  <tr v-for="(row, idx) in rowData" :key="idx" @click.self="props.onRowClick(row)"
    class="bg-white border-b hover:bg-gray-50 transition-colors duration-150 ease-in-out">
    <td class="p-4 font-medium text-gray-500">{{ idx + 1 }}</td>

    <td class="p-3 py-4" v-for="key in rowKeys" :key="key">
      <div v-if="key === 'totalAmount'" class="truncate">
        <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-[#DFF1F1] text-[#02676B]">
          ETB {{ row.totalAmount?.toFixed(2) || '0.00' }}
        </span>
      </div>

      <div v-else-if="key === 'status'" class="truncate">
        <span class="px-2.5 py-1 rounded-full text-xs font-medium" :class="getStatusStyle(row.status)">
          {{ row.status }}
        </span>
      </div>

      <span v-else class="text-gray-700">
        {{ row[key] }}
      </span>
    </td>

    <td class="p-3">
      <!-- <Dropdown v-slot="{ setRef, toggleDropdown }">
        <div @click.prevent="toggleDropdown" class="flex items-center gap-2 px-5 py-3 rounded-lg cursor-pointer">
          <button>
            <i v-html="icons.threeDots"></i>
          </button>
        </div>
        <div class="flex shadow-lg text-base p-2 mt-2 rounded-lg flex-col gap-2 w-40 bg-white" :ref="setRef">
          <button @click="
            $router.push(`claim-approval/detail/${row.batchCode}`)
            " class="p-2 flex text-base-clr items-center gap-2 rounded-lg hover:bg-gray-100">
            <i v-html="icons.edits" />
            <span>Detail</span>
          </button>

          <button @click="openModal('ClaimApproval', row?.batchCode)"
            class="p-2 flex text-base-clr items-center gap-2 rounded-lg hover:bg-gray-100">
            <i v-html="icons.details" />
            <span>Approve</span>
          </button>
          <button @click="openModal('ClaimRejection', row?.batchCode)"
            class="p-2 flex items-center text-red-500 bg-[#FFE8E8] gap-2 rounded-lg hover:bg-gray-100">
            <i v-html="icons.deactivate" />
            <span>Reject</span>
          </button>
        </div>
      </Dropdown> -->
       <button @click="
            $router.push(`claim-approval/detail/${row.batchCode}`)
            "         class="bg-gradient-to-r from-primary to-primary text-white py-1 px-4 rounded-lg shadow hover:shadow-md transition-all"
          >
            <!-- <i v-html="icons.edits" /> -->
            <span>Detail</span>
          </button>
    </td>
  </tr>
</template>

<style scoped>
.dropdown-container {
  position: relative;
}

.dropdown-menu {
  transition: all 0.2s ease-out;
  transform-origin: top right;
}

.dropdown-menu.hidden {
  opacity: 0;
  transform: scale(0.95);
  pointer-events: none;
}

.dropdown-menu:not(.hidden) {
  opacity: 1;
  transform: scale(1);
}

tr:hover {
  background-color: #f9fafb;
}
</style>