<script setup>
import { defineProps, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { openModal } from '@customizer/modal-x';
import { useToast } from '@/toast/store/toast';
import { payerContracts } from "../store/payerContractStore";
import icons from "@/utils/icons";
import { changePayerContractStatus } from '../api/payerContractApi';

const router = useRouter();
const props = defineProps({
  rowData: {
    type: Array,
    required: true
  },
  rowKeys: {
    type: Array,
    required: true
  },
  headKeys: {
    type: Array,
    required: true
  },
  cells: {  // Add this to handle the cells prop
    type: Array,
    default: () => []
  },
  onView: {
    type: Function,
    default: () => {}
  },
  onEdit: {
    type: Function,
    default: () => {}
  },
  onActivate: {
    type: Function,
    default: () => {}
  },
  onDeactivate: {
    type: Function,
    default: () => {}
  },
  onRowClick: {
    type: Function,
    default: () => {}
  }
});

const { addToast } = useToast();
const payerContractsStore = payerContracts();

function getStatusStyle(status) {
  if (status === 'ACTIVE' || status === 'Active') {
    return 'bg-[#DFF1F1] text-[#02676B]';
  } else if (status === 'INACTIVE' || status === 'Inactive') {
    return 'bg-red-100 text-red-800';
  } else {
    return 'bg-gray-100 text-gray-800';
  }
}

function handleImageError(event) {
  event.target.src = '/assets/placeholder-logo.png';
}

function handleEdit(contract) {
  router.push({
    name: 'Edit Payer Contract',
    params: { 
      id: contract.contractHeaderUuid // Pass only the ID
    }
  });
}

function toggleDropdown(event, rowId) {
  event.stopPropagation();
  closeAllDropdowns();
  const dropdown = document.getElementById(`dropdown-${rowId}`);
  if (dropdown) {
    dropdown.classList.toggle('hidden');
  }
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(el => {
    el.classList.add('hidden');
  });
}

onMounted(() => {
  window.addEventListener('click', closeAllDropdowns);
});

onUnmounted(() => {
  window.removeEventListener('click', closeAllDropdowns);
});

function handleEditWithClose(row) {
  closeAllDropdowns();
  handleEdit(row);
}

function handleViewWithClose(row) {
  closeAllDropdowns();
  props.onView(row);
}

async function handleActivateWithClose(contract) {
  closeAllDropdowns();
  try {
    const response = await changePayerContractStatus(contract.contractHeaderUuid, 'ACTIVE');
    if (response.success) {
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: 'Contract has been activated successfully'
      });
      payerContractsStore.update(contract.contractHeaderUuid, { status: 'ACTIVE' });
    } else {
      throw new Error(response.error || 'Failed to activate contract');
    }
  } catch (error) {
    addToast({
      type: 'error',
      title: 'Activation Failed',
      message: error.message || 'An error occurred while activating the contract'
    });
  }
}

async function handleDeactivateWithClose(contract) {
  closeAllDropdowns();
  try {
    const response = await changePayerContractStatus(contract.contractHeaderUuid, 'INACTIVE');
    if (response.success) {
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: 'Contract has been deactivated successfully'
      });
      payerContractsStore.update(contract.contractHeaderUuid, { status: 'INACTIVE' });
    } else {
      throw new Error(response.error || 'Failed to deactivate contract');
    }
  } catch (error) {
    addToast({
      type: 'error',
      title: 'Deactivation Failed',
      message: error.message || 'An error occurred while deactivating the contract'
    });
  }
}
</script>


<template>
  <!-- Use template tag as root for multiple tr elements -->
  <template v-for="(row, idx) in rowData" :key="idx">
    <tr 
      @click.self="onRowClick(row)" 
      class="bg-white border-b hover:bg-gray-50 transition-colors duration-150 ease-in-out" 
    >  
      <td class="p-4 font-medium text-gray-500">{{ idx + 1 }}</td>  

      <td class="p-3 py-4" v-for="key in rowKeys" :key="key">  
        <!-- Status field -->
        <div v-if="key === 'status'" class="truncate">  
          <span 
            class="px-2.5 py-1 rounded-full text-xs font-medium"
            :class="getStatusStyle(row.status)"
          >
            {{ row.status }}
          </span>
        </div>
        
        <!-- Contract Name with Logo -->
        <div v-else-if="key === 'contractName'" class="text-gray-700 flex items-center gap-2.5">
          {{ row.contractName }}
        </div>

        <!-- Default field rendering -->
        <span v-else class="text-gray-700">
          {{ row[key] }}
        </span>
      </td>  

      <td class="p-3" v-if="headKeys.includes('Actions') || headKeys.includes('actions')">  
        <div class="dropdown-container relative w-full">
          <button 
            @click.stop="toggleDropdown($event, row.contractHeaderUuid || row.id)"
            class="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          <div 
            :id="`dropdown-${row.contractHeaderUuid || row.id}`"
            class="dropdown-menu hidden absolute right-0 z-10 w-full bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <div class="py-1" role="none">
              <button 
                @click.stop="handleEditWithClose(row)"
                class="block w-full text-start py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div class="flex items-start justify-start pl-4 gap-4">
                  <i v-html="icons.edits" />
                  Edit
                </div>
              </button>
              
             <button 
              @click.prevent="$router.push(`/payer_contracts/detail/${row.contractHeaderUuid}`)"
              class="block w-full text-center py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div class="flex items-center justify-start pl-4 gap-4">
                <i v-html="icons.details" />
                Detail
              </div>
            </button>
              
              <template v-if="row.status">
                <button 
                  v-if="row.status === 'INACTIVE' || row.status === 'Inactive'"
                  @click.stop="handleActivateWithClose(row)"
                  class="block w-full text-center py-2 text-sm text-[#28A745] hover:bg-gray-100"
                >
                  <div class="flex items-center justify-start pl-4 gap-4">
                    <i v-html="icons.activate" />
                    Activate
                  </div>
                </button>
               
                <button 
                  v-if="row.status === 'ACTIVE' || row.status === 'Active'"
                  @click.stop="handleDeactivateWithClose(row)"
                  class="block w-full text-center py-2 text-sm text-[#DB2E48] hover:bg-gray-100"
                >
                  <div class="flex items-center justify-start pl-4 gap-4">
                    <i v-html="icons.deactivate" />
                    Deactivate
                  </div>
                </button>
              </template>
            </div>
          </div>
        </div>
      </td>
    </tr>
  </template>
</template>
<style scoped>
.dropdown-container {
  min-width: 80px;
}

.dropdown-menu {
  min-width: 150%;
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

.dropdown-container button {
  width: 100%;
}
</style>