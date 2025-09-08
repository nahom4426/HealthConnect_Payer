<script setup>
import { ref, onMounted, onUnmounted, defineProps, defineEmits, computed, watch, nextTick } from 'vue';
import { openModal } from '@customizer/modal-x';
import { useToast } from '@/toast/store/toast';
import { institutions } from "@/features/instution_settings/store/InstitutionsStore";
import icons from "@/utils/icons";
import { changeInstutionStatus } from '@/features/instution_settings/api/institutionsApi';
import { createKenemaContracts } from '../api/contractRequestApi';
import { useRouter } from 'vue-router';

const log = (...args) => console.log('[PayersTable]', ...args);

const router = useRouter();
const props = defineProps({
  rowData: Array,
  rowKeys: Array,
  headKeys: Array,
  selectedPayers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select-payer', 'refresh-data', 'clear-selection']);
const { addToast } = useToast();
const payersStore = institutions();

// ✅ Compute if all rows are selected
const allSelected = computed(() => {
  const allUuids = props.rowData.map(r => r.payerUuid).filter(Boolean);
  const value = allUuids.length > 0 && allUuids.every(uuid => props.selectedPayers.includes(uuid));
  return value;
});

// ---- DEBUG WATCHERS ----
watch(() => props.rowData.map(r => r?.payerUuid), (nv, ov) => {
  log('rowData changed. count=', nv?.length, 'uuids=', nv);
}, { immediate: true });

watch(() => [...props.selectedPayers], (nv, ov) => {
  log('selectedPayers changed ->', nv);
}, { immediate: true });

watch(allSelected, (nv) => {
  log('allSelected computed ->', nv);
});

// ---- helpers / ui ----
function getStatusStyle(status) {
  const base = "inline-flex justify-center items-center min-w-[80px] px-3 py-1 rounded text-sm font-semibold";
  switch (status?.toUpperCase()) {
    case "APPROVED":
    case "ACTIVE": return `${base} bg-green-100 text-green-800`;
    case "SUBMITTED":
    case "PENDING":
    case "SUSPENDED": return `${base} bg-yellow-100 text-yellow-800`;
    case "REJECTED":
    case "INACTIVE": return `${base} bg-red-100 text-red-800`;
    case "ACCEPTED": return `${base} bg-blue-100 text-blue-800`;
    case "RESUBMITTED": return `${base} bg-purple-100 text-purple-800`;
    default: return `${base} bg-gray-100 text-gray-800`;
  }
}

function getBaseUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
}

function handleImageError(event) {
  event.target.src = '/assets/placeholder-logo.png';
}

function handleEdit(row) {
  openModal('EditPayer', {
    payerUuid: row.payerUuid,
    payer: row,
    onUpdated: (updatedPayer) => {
      payersStore.update(updatedPayer.payerUuid, updatedPayer);
    }
  });
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

onMounted(() => {
  window.addEventListener('click', closeAllDropdowns);
  log('mounted. initial selectedPayers=', props.selectedPayers);
});

onUnmounted(() => {
  window.removeEventListener('click', closeAllDropdowns);
});

// ✅ Individual checkbox handler
function handleCheckboxChange(row) {
  const isSelected = !props.selectedPayers.includes(row.payerUuid);
  log('row checkbox click -> uuid=', row.payerUuid, 'emitting select-payer with', isSelected);
  emit('select-payer', row.payerUuid, isSelected);
}
// ✅ Select All with detailed logs
async function toggleSelectAll() {
  const allUuids = props.rowData.map(r => r.payerUuid).filter(Boolean);
  const isAllSelected = allUuids.length > 0 && allUuids.every(uuid => props.selectedPayers.includes(uuid));

  log('SELECT ALL clicked. allUuids=', allUuids, 'isAllSelected=', isAllSelected, 'current selectedPayers=', props.selectedPayers);

  if (isAllSelected) {
    log('Emitting clear-selection');
    emit('clear-selection');
  } else {
    // emit one-by-one so it works with your current parent handler
    allUuids.forEach(uuid => {
      if (!props.selectedPayers.includes(uuid)) {
        log('Emitting select-payer for uuid=', uuid);
        emit('select-payer', uuid, true);
      } else {
        log('uuid already selected, skipping:', uuid);
      }
    });
  }

  // log again on next tick to see if props changed
  await nextTick();
  log('after toggleSelectAll nextTick, selectedPayers (child view)=', props.selectedPayers);
}

async function handleActivateWithClose(payerUuid) {
  closeAllDropdowns();
  try {
    const response = await changeInstutionStatus(payerUuid, 'ACTIVE');
    if (response.success) {
      addToast({ type: 'success', title: 'Status Updated', message: 'Payer has been activated successfully' });
      payersStore.update(payerUuid, { status: 'ACTIVE' });
    } else throw new Error(response.error || 'Failed to activate payer');
  } catch (error) {
    addToast({ type: 'error', title: 'Activation Failed', message: error.message });
  }
}

async function handleDeactivateWithClose(payerUuid) {
  closeAllDropdowns();
  try {
    const response = await changeInstutionStatus(payerUuid, 'INACTIVE');
    if (response.success) {
      addToast({ type: 'success', title: 'Status Updated', message: 'Payer has been deactivated successfully' });
      payersStore.update(payerUuid, { status: 'INACTIVE' });
    } else throw new Error(response.error || 'Failed to deactivate payer');
  } catch (error) {
    addToast({ type: 'error', title: 'Deactivation Failed', message: error.message });
  }
}

async function handleCreateContracts(payerUuids) {
  closeAllDropdowns();
  const uuids = Array.isArray(payerUuids) ? payerUuids : [payerUuids];
  if (uuids.length === 0) {
    addToast({ type: "warning", title: "No Selection", message: "Please select at least one payer to create contracts" });
    return;
  }
  try {
    const response = await createKenemaContracts(uuids);
    if (response.success) {
      addToast({ type: "success", title: "Contracts Created", message: `${uuids.length} contract(s) created successfully` });
      router.push('/provider_contracts');
      emit('clear-selection');
      emit('refresh-data');
    } else throw new Error(response.error || "Failed to create contracts");
  } catch (error) {
    addToast({ type: "error", title: "Creation Failed", message: error.message });
  }
}

function refreshData() {
  emit('refresh-data');
}
</script>

<template>
 <thead class="bg-gray-100 text-gray-700">
  <tr>
    <th class="p-4">
      <input
        type="checkbox"
        :checked="allSelected"
        @change="toggleSelectAll"
        class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
      />
    </th>
    <th class="p-3 py-4 text-left capitalize">Payer Name</th>
    <th class="p-3 py-4 text-left capitalize">Contracts</th>
    <th class="p-3 py-4 text-left capitalize">Payer Admin User</th>
    <th class="p-3 py-4 text-left capitalize">Contact</th>
    <th class="p-3 py-4 text-left capitalize">Category</th>
    <th class="p-3 py-4 text-left capitalize">Status</th>
    <th class="p-3 py-4 text-left capitalize">Actions</th>
  </tr>
</thead>
<tbody>
  <tr 
    v-for="(row, idx) in rowData" 
    :key="row.payerUuid || idx"
    class="bg-white border-b hover:bg-gray-50 transition-colors duration-150 ease-in-out" 
  >  
    <td class="p-4" @click.stop>
      <input
        type="checkbox"
        :checked="props.selectedPayers.includes(row.payerUuid)"
        @change="() => handleCheckboxChange(row)"
        class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
      />
    </td>

      <td class="p-3 py-4" v-for="key in rowKeys" :key="key">  
        <div v-if="key === 'status'" class="truncate">  
          <span :class="getStatusStyle(row.status)">
            {{ row.status }}
          </span>
        </div>
        <div v-else-if="key === 'payerName'" class="text-gray-700 flex items-center gap-2.5">
          <div class="flex justify-center items-center">
            <img 
              v-if="row.logoBase64" 
              :src="row.logoBase64" 
              alt="Payer Logo" 
              class="h-10 w-10 object-contain rounded-full border border-gray-200"
            />
            <img 
              v-else-if="row.logoUrl" 
              :src="row.logoUrl" 
              alt="Payer Logo" 
              class="h-10 w-10 object-contain rounded-full border border-gray-200"
            />
            <img 
              v-else-if="row.logoPath" 
              :src="`${getBaseUrl()}/payer/logo/${row.logoPath}`" 
              alt="Payer Logo" 
              class="h-10 w-10 object-contain rounded-full border border-gray-200"
              @error="handleImageError"
            />
            <div v-else class="h-10 w-10 text-center bg-gray-200 rounded-full flex items-center justify-center">
              <span class="text-gray-500 text-xs">No Logo</span>
            </div>
          </div>
          <div>
            {{ row.payerName }}
          </div>
        </div>
        <span v-else class="text-gray-700">
          {{ row[key] }}
        </span>
      </td>

      <td class="p-3">  
        <div class="dropdown-container relative">
          <button 
            @click.stop="toggleDropdown($event, row.payerUuid || row.id)"
            class="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          <div 
            :id="`dropdown-${row.payerUuid || row.id}`"
            class="dropdown-menu hidden absolute right-0 z-10 w-44 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
          >
            <div class="py-1" role="none">
              <button 
                @click.stop="handleEdit(row)"
                class="block w-full text-left py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div class="flex items-center justify-start pl-4 gap-4">
                  <i v-html="icons.edits" />
                  Edit
                </div>
              </button>
              <button 
                @click.stop="handleCreateContracts(row.payerUuid)"
                class="block w-full text-left py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div class="flex items-center justify-start pl-4 gap-4">
                  <i v-html="icons.edits" />
                  Create Contract
                </div>
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  </tbody>
</template>

<style scoped>
.dropdown-container { min-width: 80px; }
.dropdown-menu { min-width: 150%; transition: all 0.2s ease-out; transform-origin: top right; }
.dropdown-menu.hidden { opacity: 0; transform: scale(0.95); pointer-events: none; }
.dropdown-menu:not(.hidden) { opacity: 1; transform: scale(1); }
.dropdown-container button { width: 100%; }
</style>
