<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, ref } from 'vue';
import Button from "@/components/Button.vue";
import { openModal } from '@customizer/modal-x';
import { claimServices } from "../store/submitClaimsStore";
import { changeInsuredStatus, getPayerbyPayerUuid } from "../api/submitClaimsApi";
import { useToast } from '@/toast/store/toast';
import icons from "@/utils/icons";
import { watch } from 'vue';

const props = defineProps({
  rowData: { type: Array, required: true },
  rowKeys: { type: Array, required: true },
  headKeys: { type: Array, required: true },
  onView: { type: Function, default: () => {} },
  onEdit: { type: Function, default: () => {} },
  onActivate: { type: Function, default: () => {} },
  onDeactivate: { type: Function, default: () => {} },
  onRowClick: { type: Function, default: () => {} },
  onRemove: { type: Function, default: () => {} } // Add this new prop for remove action
});

const { addToast } = useToast();
const insuredStore = claimServices();
const payerNames = ref<Record<string, string>>({});

function handleImageError(event) {
  event.target.src = '/assets/placeholder-profile.png';
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

async function handleActivateWithClose(insuredId) {
  closeAllDropdowns();
  try {
    const response = await changeInsuredStatus(insuredId, 'ACTIVE');
    if (response.success) {
      addToast({ type: 'success', title: 'Status Updated', message: 'Insured member has been activated' });
      insuredStore.update(insuredId, { status: 'ACTIVE' });
    } else {
      throw new Error(response.error || 'Failed to activate');
    }
  } catch (error) {
    addToast({ type: 'error', title: 'Activation Failed', message: error.message });
  }
}

async function handleDeactivateWithClose(insuredId) {
  closeAllDropdowns();
  try {
    const response = await changeInsuredStatus(insuredId, 'INACTIVE');
    if (response.success) {
      addToast({ type: 'success', title: 'Status Updated', message: 'Insured member has been deactivated' });
      insuredStore.update(insuredId, { status: 'INACTIVE' });
    } else {
      throw new Error(response.error || 'Failed to deactivate');
    }
  } catch (error) {
    addToast({ type: 'error', title: 'Deactivation Failed', message: error.message });
  }
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
  <tr 
    v-for="(row, idx) in rowData" 
    :key="idx"
    @click.self="props.onRowClick(row)" 
    class="bg-white border-b hover:bg-gray-50 transition-colors duration-150 ease-in-out"
  >  
    <td class="p-4 font-medium text-gray-500">{{ idx + 1 }}</td>  

    <td class="p-3 py-4" v-for="key in rowKeys" :key="key">  
      <div v-if="key === 'totalAmount'" class="truncate">  
        <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-[#DFF1F1] text-[#02676B]">
          ETB {{ row.totalAmount?.toFixed(2) || '0.00' }}
        </span>
      </div>
      
      <div v-else-if="key === 'status'">  
        <span class="px-2.5 py-0.5 text-xs font-small rounded-sm bg-[#F6F7FA] text-[#75778B] border border-[#75778B] border-opacity-20" 
              style="border-width: 0.2px">
          {{ row.status }}
        </span>
      </div>

      <span v-else class="text-gray-700">
        {{ row[key] }}
      </span>
    </td>  

    <td class="p-3">
      <div class="dropdown-container relative">
        <button 
          @click.stop="toggleDropdown($event, row.dispensingUuid || row.insuredUuid || row.id)"
          class="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        <div 
          :id="`dropdown-${row.dispensingUuid || row.insuredUuid || row.id}`"
          class="dropdown-menu hidden absolute right-0 z-10 w-44 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div class="py-1">
            <button 
              @click.stop="handleEditWithClose(row)"
              class="block w-full text-start py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div class="flex items-start justify-start pl-4 gap-4">
                <i v-html="icons.edits"/>
                Edit
              </div>
            </button>
               <button 
        @click.stop="handleRemove(row.dispensingUuid)"
        class="text-red-500 hover:text-red-700"
        title="Remove claim"
      >
       rem <i v-html="icons.trash"></i>
      </button>
            <button 
              @click.prevent="$router.push(`/insured_list/detail/${row.insuredUuid}`)"
              class="block w-full text-center py-2 text-sm text-gray-700 hover:bg-gray-100"
              v-if="row.insuredUuid"
            >
              <div class="flex items-center justify-start pl-4 gap-4">
                <i v-html="icons.details" />
                Details
              </div>
            </button>
       
            <template v-if="row.status">
              <button 
                v-if="row.status === 'INACTIVE' || row.status === 'Inactive'"
                @click.stop="handleActivateWithClose(row.insuredUuid || row.id)"
                class="block w-full text-center py-2 text-sm text-[#28A745] hover:bg-gray-100"
              >
                <div class="flex items-center justify-start pl-4 gap-4">
                  <i v-html="icons.activate" />
                  Activate
                </div>
              </button>
             
              <button 
                v-if="row.status === 'ACTIVE' || row.status === 'Active'"
                @click.stop="handleDeactivateWithClose(row.insuredUuid || row.id)"
                class="block w-full text-center py-2 text-sm text-[#DB2E48] hover:bg-gray-100"
              >
                <div class="flex items-center justify-start pl-4 gap-4">
                  <i v-html="icons.deactivate" />
                  Deactivate
                </div>
              </button>
            </template>

            <!-- Add the Remove button for claims -->
            <button 
              v-if="row.dispensingUuid"
              @click.stop="handleRemoveWithClose(row.dispensingUuid)"
              class="block w-full text-center py-2 text-sm text-[#DB2E48] hover:bg-gray-100"
            >
              <div class="flex items-center justify-start pl-4 gap-4">
                <i v-html="icons.trash" />
                Remove
              </div>
            </button>
          </div>
        </div>
      </div>
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