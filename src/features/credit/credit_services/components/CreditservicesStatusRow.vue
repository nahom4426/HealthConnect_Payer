<script setup>
import { defineProps, onMounted, onUnmounted, ref } from 'vue';
import Button from "@/components/Button.vue";
import { openModal } from '@customizer/modal-x';
import { claimServices } from "../store/creditClaimsStore";
import { useToast } from '@/toast/store/toast';
import icons from "@/utils/icons";

const props = defineProps({
  rowData: { type: Array, required: true },
  rowKeys: { type: Array, required: true },
  headKeys: { type: Array, required: true },
  onView: { type: Function, default: () => {} },
  onEdit: { type: Function, default: () => {} },
  onActivate: { type: Function, default: () => {} },
  onDeactivate: { type: Function, default: () => {} },
  onRowClick: { type: Function, default: () => {} }
});

const { addToast } = useToast();
const insuredStore = claimServices();

// Format currency to 2 decimal places
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-ET', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Format date if needed
function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-ET');
}

// Truncate long text
function truncateText(text, maxLength = 25) {
  if (!text) return '-';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

function handleImageError(event) {
  event.target.src = '/assets/placeholder-profile.png';
}

function getSourceStyle(source) {
  switch (source) {
    case 'INPUT':
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        dotColor: 'bg-green-500',
        tooltip: 'Input'
      };
    case 'SYSTEM':
      return {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        dotColor: 'bg-blue-500',
        tooltip: 'System'
      };
    default:
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        dotColor: 'bg-gray-500',
        tooltip: source || 'Unknown'
      };
  }
}

function getStatusStyle(status) {
  switch (status) {
    case 'DRAFT':
      return {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200'
      };
    case 'ACTIVE':
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200'
      };
    case 'INACTIVE':
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200'
      };
    default:
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        borderColor: 'border-gray-200'
      };
  }
}

function handleEdit(row) {
  console.log('EditCreditServices modal opened with row:', row);
  if (row.dispensingUuid) {
    openModal('EditCreditServices', {
      dispensingUuid: row.dispensingUuid,
      claim: row,
      onUpdated: (updatedClaim) => {
        insuredStore.update(updatedClaim.dispensingUuid, updatedClaim);
        addToast({
          type: 'success',
          title: 'Updated',
          message: 'Claim updated successfully'
        });
      },
      onCancel: () => {}
    });
  } else if (typeof props.onEdit === 'function') {
    props.onEdit(row);
  }
}

function handleDetails(row) {
  console.log('Details Of CreditServices modal opened with row:', row);
  if (row.dispensingUuid) {
    openModal('DetailsOfCreditServices', {
      dispensingUuid: row.dispensingUuid,
      claim: row,
      onUpdated: (updatedClaim) => {
        insuredStore.update(updatedClaim.dispensingUuid, updatedClaim);
        addToast({
          type: 'success',
          title: 'Updated',
          message: 'Claim updated successfully'
        });
      },
      onCancel: () => {}
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

// Add click event listener to close dropdowns when clicking outside
function handleClickOutside(event) {
  if (!event.target.closest('.dropdown-container')) {
    closeAllDropdowns();
  }
}

// Set up and clean up event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

function handleEditWithClose(row) {
  closeAllDropdowns();
  handleEdit(row);
}

function handleDetailsWithClose(row) {
  closeAllDropdowns();
  handleDetails(row);
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
</script>

<template>
  <tr 
    v-for="(row, idx) in rowData" 
    :key="row.dispensingUuid"
    @click.self="props.onRowClick(row)" 
    class="bg-white border-b hover:bg-gray-50 transition-colors duration-150 ease-in-out cursor-pointer"
  >  
    <td class="p-4 py-4" v-for="key in rowKeys" :key="key">  
      <!-- Source with numbering -->
      <div v-if="key === 'source'" class="relative group">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-600 min-w-6">{{ idx + 1 }}</span>
          <span class="relative flex h-3 w-3">
            <span 
              class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              :class="getSourceStyle(row.source).dotColor"
            ></span>
            <span 
              class="relative inline-flex rounded-full h-3 w-3"
              :class="getSourceStyle(row.source).dotColor"
            ></span>
          </span>
          <span 
            class="text-xs font-medium px-2 py-1 rounded-full border"
            :class="[getSourceStyle(row.source).bgColor, getSourceStyle(row.source).textColor]"
          >
            {{ row.source }}
          </span>
        </div>
        <div class="absolute z-10 hidden group-hover:block bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded whitespace-nowrap">
          {{ getSourceStyle(row.source).tooltip }}
        </div>
      </div>

      <!-- Invoice Number -->
      <div v-else-if="key === 'invoiceNumber'" class="font-mono text-sm font-medium text-blue-600 hover:text-blue-800">
        {{ truncateText(row.invoiceNumber, 12) }}
      </div>

      <!-- Payer Name -->
      <div v-else-if="key === 'payerName'" class="max-w-[180px]">
        <span class="text-sm font-medium text-gray-900 truncate block">
          {{ truncateText(row.payerName, 20) }}
        </span>
      </div>

      <!-- Patient Name -->
      <div v-else-if="key === 'patientName'" class="max-w-[200px]">
        <span class="text-sm text-gray-900 truncate block">
          {{ truncateText(row.patientName, 25) }}
        </span>
        <span v-if="row.idNumber" class="text-xs text-gray-500">
          ID: {{ row.idNumber }}
        </span>
      </div>

      <!-- Dispensing Date -->
      <div v-else-if="key === 'dispensingDate'" class="text-sm text-gray-700">
        {{ formatDate(row.dispensingDate) }}
      </div>

      <!-- Branch Name -->
      <div v-else-if="key === 'branchName'" class="max-w-[150px]">
        <span class="text-sm text-gray-700 truncate block">
          {{ truncateText(row.branchName, 15) }}
        </span>
      </div>

      <!-- Medication Items Count -->
      <div v-else-if="key === 'medicationItems'" class="flex items-center justify-center relative group">
        <span 
          class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 text-sm font-semibold border border-indigo-200"
          :title="`${row.medicationItems ? row.medicationItems.length : 0} medication items`"
        >
          {{ row.medicationItems ? row.medicationItems.length : 0 }}
        </span>
        <div
          v-if="row.medicationItems && row.medicationItems.length"
          class="absolute z-50 hidden group-hover:block bottom-full mb-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-left"
        >
          <div class="text-xs font-semibold text-gray-700 mb-2">
            Services ({{ row.medicationItems.length }})
          </div>
          <ul class="max-h-56 overflow-auto divide-y divide-gray-100">
            <li v-for="(m, i) in row.medicationItems" :key="i" class="py-2">
              <div class="text-xs text-gray-900 truncate" :title="m.medicationName">
                {{ m.medicationName }}
              </div>
              <div class="text-[11px] text-gray-500">
                Qty: {{ m.quantity }} {{ m.unitOfMeasure }} • Unit: ETB {{ formatCurrency(m.unitPrice) }} • Total: ETB {{ formatCurrency(m.totalPrice) }}
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- Total Amount -->
      <div v-else-if="key === 'totalAmount'" class="text-right">
        <div class="flex flex-col items-end">
          <span class="text-sm font-semibold text-gray-900">
            ETB {{ formatCurrency(row.totalAmount) }}
          </span>
          <span v-if="row.insuranceCoverage" class="text-xs text-green-600">
            Covered: ETB {{ formatCurrency(row.insuranceCoverage) }}
          </span>
        </div>
      </div>

      <!-- Default case for other fields -->
      <span v-else class="text-sm text-gray-700">
        {{ row[key] || '-' }}
      </span>
    </td> 
 
    <!-- Actions Column -->
    <td class="p-3">
      <div class="dropdown-container relative">
        <button 
          @click.stop="toggleDropdown($event, row.dispensingUuid)"
          class="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none transition-colors"
          type="button"
          :title="`Actions for ${row.invoiceNumber}`"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        <div 
          :id="`dropdown-${row.dispensingUuid}`"
          class="dropdown-menu hidden absolute right-0 z-20 w-48 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200"
        >
          <div class="py-1">
            <!-- Edit Button -->
            <button 
              v-if="row.source === 'INPUT' || row.source === 'Input'"
              @click.stop="handleEditWithClose(row)"
              class="flex items-center w-3/4 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <i v-html="icons.edits" class="mr-3 text-blue-600"/>
              Edit Claim
            </button>

            <!-- Details Button -->
            <button 
              @click.stop="handleDetailsWithClose(row)"
              class="flex items-center w-3/4 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              <i v-html="icons.details" class="mr-3 text-green-600" />
              View Details
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
  animation: dropdownAppear 0.2s ease-out;
}

@keyframes dropdownAppear {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

tr:hover {
  background-color: #f8fafc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Smooth transitions for all interactive elements */
tr {
  transition: background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

/* Improve table cell alignment */
td {
  vertical-align: middle;
}
</style>