<script setup>
import { defineProps, onMounted, onUnmounted } from 'vue';
import Button from "@/components/Button.vue";
import { openModal } from '@customizer/modal-x';
import { insuredMembers } from "../store/submitClaimsStore";
import { changeInsuredStatus } from "../api/submitClaimsApi";
import { useToast } from '@/toast/store/toast';
import icons from "@/utils/icons";

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
console.log('InsuredPersonStatusRow props:', props.rowData);

const { addToast } = useToast();
const insuredStore = insuredMembers();

function getStatusStyle(status) {
  if (status === 'ACTIVE' || status === 'Active') {
    return 'bg-[#DFF1F1] text-[#02676B]';
  } else if (status === 'INACTIVE' || status === 'Inactive') {
    return 'bg-red-100 text-red-800';
  } else {
    return 'bg-gray-100 text-gray-800';
  }
}

function getBaseUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
}

function handleImageError(event) {
  event.target.src = '/assets/placeholder-profile.png';
}

function handleEdit(row) {
  if (row.insuredUuid) {
    openModal('EditInsured', { 
      insuredUuid: row.insuredUuid, 
      insured: row,
      onUpdated: (updatedInsured) => {
        insuredStore.update(updatedInsured.insuredUuid, updatedInsured);
      }
    });
  } else if (typeof props.onEdit === 'function') {
    props.onEdit(row);
  }
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

function handleViewWithClose(rowId) {
  closeAllDropdowns();
  props.onView(rowId);
}

async function handleActivateWithClose(insuredId) {
  closeAllDropdowns();
  try {
    const response = await changeInsuredStatus(insuredId, 'ACTIVE');
    if (response.success) {
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: 'Insured member has been activated'
      });
      insuredStore.update(insuredId, { status: 'ACTIVE' });
    } else {
      throw new Error(response.error || 'Failed to activate');
    }
  } catch (error) {
    addToast({
      type: 'error',
      title: 'Activation Failed',
      message: error.message || 'Failed to activate insured member'
    });
  }
}

async function handleDeactivateWithClose(insuredId) {
  closeAllDropdowns();
  try {
    const response = await changeInsuredStatus(insuredId, 'INACTIVE');
    if (response.success) {
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: 'Insured member has been deactivated'
      });
      insuredStore.update(insuredId, { status: 'INACTIVE' });
    } else {
      throw new Error(response.error || 'Failed to deactivate');
    }
  } catch (error) {
    addToast({
      type: 'error',
      title: 'Deactivation Failed',
      message: error.message || 'Failed to deactivate insured member'
    });
  }
}
</script>

<template>
  <tr 
    v-for="(row, idx) in rowData" 
    :key="idx"
    @click.self="props.onRowClick(row)" 
    class="bg-white border-b hover:bg-gray-50 transition-colors duration-150 ease-in-out"
  >  
    <td class="p-4 font-medium text-gray-500">{{ idx + 1 }}</td>  

    <!-- Insured Photo Column -->
   

    <td class="p-3 py-4" v-for="key in rowKeys" :key="key">  
      <div v-if="key === 'status'" class="truncate">  
        <span 
          class="px-2.5 py-1 rounded-full text-xs font-medium"
          :class="getStatusStyle(row.status)"
        >
          {{ row.status }}
        </span>
      </div>
     
       <div v-else-if="key === 'fullName'" class="text-gray-700 flex items-center gap-2.5 ">
       
      <div class="flex justify-center items-center">
        <img 
          v-if="row.photoBase64" 
          :src="row.photoBase64" 
          alt="Profile" 
          class="h-10 w-10 object-cover rounded-full border border-gray-200"
        />
        <img 
          v-else-if="row.photoUrl" 
          :src="row.photoUrl" 
          alt="Profile" 
          class="h-10 w-10 object-cover rounded-full border border-gray-200"
        />
        <img 
          v-else-if="row.photoPath" 
          :src="`${getBaseUrl()}/insured/photo/${row.photoPath}`" 
          alt="Profile" 
          class="h-10 w-10 object-cover rounded-full border border-gray-200"
          @error="handleImageError"
        />
        <div v-else class="h-10 w-10 text-center bg-gray-200 rounded-full flex items-center justify-center">
          <span class="text-gray-500 text-xs">No Photo</span>
        </div>
      </div>
       <div>
         {{ row.firstName }} {{ row.fatherName }} {{ row.grandfatherName }}
      </div>
      </div>

      <span v-else class="text-gray-700">
        {{ row[key] }}
      </span>
    </td>  

    <!-- Actions Dropdown Column -->
    <td class="p-3">
      <div class="dropdown-container relative">
        <button 
          @click.stop="toggleDropdown($event, row.insuredUuid || row.id)"
          class="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        <div 
          :id="`dropdown-${row.insuredUuid || row.id}`"
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
             @click.prevent="$router.push(`/insured_list/detail/${row.insuredUuid}`)"
              class="block w-full text-center py-2 text-sm text-gray-700 hover:bg-gray-100"
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
        class="block w-full text-center py-2 text-sm text-[#28A745]  hover:bg-gray-100"
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