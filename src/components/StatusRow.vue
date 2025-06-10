<script setup>
import { defineProps, onMounted, onUnmounted } from 'vue';
import Button from "@/components/Button.vue";
import { openModal } from '@customizer/modal-x';
import { useProviders } from "@/features/providers/store/providersStore";
import { changeProviderStatus } from "@/features/providers/api/providerApi";
import { useToast } from '@/toast/store/toast';
import icons from "@/utils/icons"; // Assuming you have an icons utility for SVGs
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
const { addToast } = useToast();
// Initialize the providers store
const providersStore = useProviders();
function getStatusStyle(status) {
  if (status === 'ACTIVE' || status === 'Active') {
    return 'bg-[#DFF1F1] text-[#02676B]';
  } else if (status === 'INACTIVE' || status === 'Inactive') {
    return 'bg-red-100 text-red-800';
  } else {
    return 'bg-gray-100 text-gray-800';
  }
}

// Function to get the base URL for API requests
function getBaseUrl() {
  // Get the base URL from environment variables or use a default
  return import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
}

// Handle image loading errors
function handleImageError(event) {
  // Replace with a placeholder image or hide the image
  event.target.src = '/assets/placeholder-logo.png';
  // Or hide the image
  // event.target.style.display = 'none';
}

// Function to handle edit button click
function handleEdit(row) {
  console.log('Edit button clicked with row data:', row);
  
  // Check if this is a provider based on the providerUuid property
  if (row.providerUuid) {
    // Open the EditProvider modal with the row data
    openModal('EditProvider', { 
      providerUuid: row.providerUuid, 
      provider: row,
      onUpdated: (updatedProvider) => {
        console.log('Provider updated:', updatedProvider);
        // Update the provider in the store
        providersStore.update(updatedProvider.providerUuid, updatedProvider);
      }
    });
  } else {
    // If it's not a provider, use the generic onEdit function
    if (typeof props.onEdit === 'function') {
      props.onEdit(row);
    }
  }
}

function toggleDropdown(event, rowId) {
  event.stopPropagation();
  closeAllDropdowns(); // Close any open dropdowns first
  const dropdown = document.getElementById(`dropdown-${rowId}`);
  if (dropdown) {
    dropdown.classList.toggle('hidden');
  }
}

// Close dropdown when clicking outside or when an option is selected
function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(el => {
    el.classList.add('hidden');
  });
}

// Call this when component mounts
onMounted(() => {
  window.addEventListener('click', closeAllDropdowns);
});

// Call this when component unmounts
onUnmounted(() => {
  window.removeEventListener('click', closeAllDropdowns);
});

// Modified handler functions to close dropdown after action
function handleEditWithClose(row) {
  closeAllDropdowns();
  handleEdit(row);
}

function handleViewWithClose(rowId) {
  closeAllDropdowns();
  onView(rowId);
}


async function handleActivateWithClose(providerId) {
  closeAllDropdowns();
  try {
    const response = await changeProviderStatus(providerId, 'ACTIVE');
    if (response.success) {
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: 'Provider has been activated successfully'
      });
      // Update the local state or trigger a refresh
      providersStore.update(providerId, { status: 'ACTIVE' });
    } else {
      throw new Error(response.error || 'Failed to activate provider');
    }
  } catch (error) {
    addToast({
      type: 'error',
      title: 'Activation Failed',
      message: error.message || 'An error occurred while activating the provider'
    });
  }
}

async function handleDeactivateWithClose(providerId) {
  closeAllDropdowns();
  try {
    const response = await changeProviderStatus(providerId, 'INACTIVE');
    if (response.success) {
      addToast({
        type: 'success',
        title: 'Status Updated',
        message: 'Provider has been deactivated successfully'
      });
      // Update the local state or trigger a refresh
      providersStore.update(providerId, { status: 'INACTIVE' });
    } else {
      throw new Error(response.error || 'Failed to deactivate provider');
    }
  } catch (error) {
    addToast({
      type: 'error',
      title: 'Deactivation Failed',
      message: error.message || 'An error occurred while deactivating the provider'
    });
  }
}
</script>

<template>
  <tr 
    v-for="(row, idx) in rowData" 
    :key="idx"
    @click.self="onRowClick(row)" 
    class="bg-white border-b hover:bg-gray-50 transition-colors duration-150 ease-in-out" 
  >  
    <td class="p-4 font-medium text-gray-500">{{ idx + 1 }}</td>  

    <!-- Provider Logo Column (new) -->
    <td class="p-3 py-4 w-16">
      <div class="flex justify-center items-center">
        <img 
          v-if="row.logoBase64" 
          :src="row.logoBase64" 
          alt="Provider Logo" 
          class="h-10 w-10 object-contain rounded-full border border-gray-200"
        />
        <img 
          v-else-if="row.logoUrl" 
          :src="row.logoUrl" 
          alt="Provider Logo" 
          class="h-10 w-10 object-contain rounded-full border border-gray-200"
        />
        <img 
          v-else-if="row.logoPath" 
          :src="`${getBaseUrl()}/provider/logo/${row.logoPath}`" 
          alt="Provider Logo" 
          class="h-10 w-10 object-contain rounded-full border border-gray-200"
          @error="handleImageError"
        />
        <div v-else class="h-10 w-10 text-center bg-gray-200 rounded-full flex items-center justify-center">
          <span class="text-gray-500 text-xs">No Logo</span>
        </div>
      </div>
    </td>

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
      <!-- Default field rendering -->
      <span v-else class="text-gray-700">
        {{ row[key] }}
      </span>
    </td>  
  <td class="p-3" v-if="headKeys.includes('Actions') || headKeys.includes('actions')">  
      <div class="dropdown-container relative w-full">
        <!-- Dropdown toggle button - full width -->
        <button 
          @click.stop="toggleDropdown($event, row.providerUuid || row.id)"
          class="inline-flex items-center justify-center p-2 w-full text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        <!-- Dropdown menu - full width -->
        <div 
          :id="`dropdown-${row.providerUuid || row.id}`"
          class="dropdown-menu hidden absolute right-0 z-10 w-full bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div class="py-1" role="none">
            <!-- Edit option -->
            <button 
              @click.stop="handleEditWithClose(row)"
              class="block w-full text-start py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
            <div class="flex items-start justify-start pl-4 gap-4">
               <i v-html="icons.edits" />
              Edit
            </div>
            </button>
            
            <!-- View/Detail option -->
            <button 
              @click.stop="handleViewWithClose(row.providerUuid || row.id)"
              class="block w-full text-center py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
             <div class="flex items-center justify-start pl-4 gap-4">
              <i v-html="icons.details" />
              Detail
            </div>
            </button>
            
            <!-- Status change options -->
          <template v-if="row.status">
      <button 
        v-if="row.status === 'INACTIVE' || row.status === 'Inactive'"
        @click.stop="handleActivateWithClose(row.providerUuid || row.id)"
        class="block w-full text-center py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <div class="flex items-center justify-start pl-4 gap-4">
          <i v-html="icons.activate" />
          Activate
        </div>
      </button>
     
      <button 
        v-if="row.status === 'ACTIVE' || row.status === 'Active'"
        @click.stop="handleDeactivateWithClose(row.providerUuid || row.id)"
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
  min-width: 80px; /* Adjust this to match your desired width */
}

.dropdown-menu {
  min-width: 150%; /* Make dropdown match container width */
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

/* Make sure the dropdown button takes full width */
.dropdown-container button {
  width: 100%;
}
</style>






