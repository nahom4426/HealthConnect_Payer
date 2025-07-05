<script setup>
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import { closeModal } from "@customizer/modal-x";
import { ref, computed, onMounted, watch } from "vue"; // Import 'watch'
import Input from "@/components/new_form_elements/Input.vue";
import Button from "@/components/Button.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { useToast } from '@/toast/store/toast';
import { toasted } from '@/utils/utils';
import { getContractDetailsByGroup } from '../api/payerContractApi'; // Only need this for fetching assigned items
import Spinner from "@/components/Spinner.vue";

// Assume these API functions exist or will be implemented.
// For demonstration, `unassignServicesFromGroup` is a placeholder.
// You might need to adjust your `payerContractApi.js` to include this.
async function unassignServicesFromGroup(groupUuid, itemUuids) {
  // This is a placeholder for your actual API call to unassign items.
  // You would typically make a DELETE or POST request to your backend.
  console.log(`Attempting to unassign items from group ${groupUuid}:`, itemUuids);
  return new Promise(resolve => {
    setTimeout(() => {
      if (itemUuids.length > 0) {
        resolve({ success: true, message: 'Items unassigned successfully (mock)' });
      } else {
        resolve({ success: false, message: 'No items selected for unassignment (mock)' });
      }
    }, 1000); // Simulate API call delay
  });
}

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

const groupUuid = computed(() => props.data?.data?.groupUuid);
const contractHeaderUuid = computed(() => props.data?.data?.contractHeaderUuid);

console.log("RemoveServicesModal mounted with props:", props);

const { addToast } = useToast();
const api = useApiRequest();

// Tab management
const activeTab = ref(0); // 0 for Services, 1 for Drugs
const tabs = [
  { name: 'Services', value: 0 },
  { name: 'Drugs', value: 1 }
];

// Data states
const assignedServices = ref([]); // Will hold services currently assigned to the group
const assignedDrugs = ref([]);    // Will hold drugs currently assigned to the group
const searchTerm = ref('');
const selectedServices = ref([]); // Items selected for removal
const selectedDrugs = ref([]);    // Items selected for removal
const loading = ref(true);
const selectAll = ref(false);

// Watch for changes in activeTab and reset selectAll
watch(activeTab, (newTab) => {
  selectAll.value = false; // Reset selectAll when tab changes
});

// Fetch only currently assigned services and drugs for the group
async function fetchAssignedItems() {
  try {
    loading.value = true;

    if (!groupUuid.value || !contractHeaderUuid.value) {
      console.warn("UUIDs not available for fetching assigned items.");
      loading.value = false;
      return;
    }

    const response = await getContractDetailsByGroup(groupUuid.value, contractHeaderUuid.value);
    const assignedItems = response.data || [];

    // Infer itemType based on the presence of serviceName or drugName
    const processedItems = assignedItems.map(item => {
      let itemType = null;
      if (item.serviceName !== null) {
        itemType = 'SERVICE';
      } else if (item.drugName !== null) {
        itemType = 'DRUG';
      }
      return { ...item, itemType }; // Add the inferred itemType
    }).filter(item => item.itemType !== null); // Filter out items that couldn't be classified

    assignedServices.value = processedItems.filter(item => item.itemType === 'SERVICE');
    assignedDrugs.value = processedItems.filter(item => item.itemType === 'DRUG');

    // Initially, nothing is selected for removal
    selectedServices.value = [];
    selectedDrugs.value = [];

  } catch (error) {
    console.error('Error fetching assigned services and drugs:', error);
    toasted(false, 'Failed to load assigned services and drugs');
  } finally {
    loading.value = false;
  }
}

// Filter services based on search term
const filteredServices = computed(() => {
  if (!searchTerm.value) return assignedServices.value;

  const term = searchTerm.value.toLowerCase();
  return assignedServices.value.filter(service =>
    (service.serviceName || '').toLowerCase().includes(term)
  );
});

// Filter drugs based on search term
const filteredDrugs = computed(() => {
  if (!searchTerm.value) return assignedDrugs.value;

  const term = searchTerm.value.toLowerCase();
  return assignedDrugs.value.filter(drug =>
    (drug.drugName || '').toLowerCase().includes(term)
  );
});

// Toggle select all available services/drugs for removal
function toggleSelectAll() {
  if (activeTab.value === 0) {
    if (selectAll.value) {
      selectedServices.value = [...assignedServices.value];
    } else {
      selectedServices.value = [];
    }
  } else {
    if (selectAll.value) {
      selectedDrugs.value = [...assignedDrugs.value];
    } else {
      selectedDrugs.value = [];
    }
  }
}

// Toggle service selection for removal
function toggleServiceSelection(service) {
  const index = selectedServices.value.findIndex(s => s.contractDetailUuid === service.contractDetailUuid);

  if (index > -1) {
    selectedServices.value.splice(index, 1);
  } else {
    selectedServices.value.push(service);
  }
}

// Toggle drug selection for removal
function toggleDrugSelection(drug) {
  const index = selectedDrugs.value.findIndex(d => d.contractDetailUuid === drug.contractDetailUuid);

  if (index > -1) {
    selectedDrugs.value.splice(index, 1);
  } else {
    selectedDrugs.value.push(drug);
  }
}

// Check if service is selected for removal
function isServiceSelected(service) {
  return selectedServices.value.some(s => s.contractDetailUuid === service.contractDetailUuid);
}

// Check if drug is selected for removal
function isDrugSelected(drug) {
  return selectedDrugs.value.some(d => d.contractDetailUuid === drug.contractDetailUuid);
}

// Submit selected items for removal
async function submitItemsForRemoval() {
  try {
    if (!groupUuid.value || !contractHeaderUuid.value) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Missing group or contract UUIDs to remove items.'
      });
      return;
    }

    const itemUuidsToRemove = [
      ...selectedServices.value.map(s => s.contractDetailUuid),
      ...selectedDrugs.value.map(d => d.contractDetailUuid)
    ].filter(Boolean); // Ensure no null/undefined UUIDs

    if (itemUuidsToRemove.length === 0) {
      addToast({
        type: 'info',
        title: 'No Selection',
        message: 'Please select items to remove.'
      });
      return;
    }

    const response = await unassignServicesFromGroup(
      groupUuid.value,
      itemUuidsToRemove
    );

    if (response.success) {
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Items removed from contract successfully'
      });
      closeModal(true); // Close modal and indicate success
    } else {
      throw new Error(response.message || 'Failed to remove items');
    }
  } catch (error) {
    console.error('Error removing items:', error);
    addToast({
      type: 'error',
      title: 'Error',
      message: error.message || 'Failed to remove items from contract'
    });
  }
}

onMounted(() => {
  fetchAssignedItems();
});
</script>

<template>
  <ModalParent>
    <NewFormParent
      size="lg"
      title="Remove Services/Drugs from Contract"
      subtitle="Select services or drugs to remove from this contract"
    >
      <div class="space-y-4">
        <!-- Tab navigation -->
        <div class="grid grid-cols-2 border border-base-clr rounded w-full">
          <div
            v-for="tab in tabs"
            :key="tab.value"
            @click="activeTab = tab.value"
            :class="[
              'px-4 py-3 transition-colors text-center cursor-pointer duration-300',
              activeTab === tab.value
                ? tab.value === 0
                  ? 'bg-base-clr text-white rounded-l font-medium'
                  : 'bg-base-clr text-white rounded-r font-medium'
                : ''
            ]"
          >
            {{ tab.name }}
          </div>
        </div>

        <!-- Search input -->
        <div class="relative">
          <Input
            v-model="searchTerm"
            :placeholder="activeTab === 0 ? 'Search assigned services...' : 'Search assigned drugs...'"
            :attributes="{
              'icon-left': 'search',
              class: 'pl-10'
            }"
          />
          <div class="absolute left-3 top-3 text-gray-400">
            <i class="fas fa-search"></i>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center items-center h-40">
          <Spinner size="lg" />
        </div>

        <!-- Services table (shown when activeTab === 0) -->
        <div v-else-if="activeTab === 0" class="overflow-y-auto max-h-96">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-medium">Assigned Services</h3>
            <div class="flex items-center" v-if="assignedServices.length > 0">
              <input
                type="checkbox"
                id="selectAllServicesRemoval"
                v-model="selectAll"
                @change="toggleSelectAll"
                class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label for="selectAllServicesRemoval" class="ml-2 text-sm text-gray-700">Select All for Removal</label>
            </div>
          </div>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price (ETB)
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="service in filteredServices"
                :key="service.contractDetailUuid"
                :class="{
                  'bg-red-50': isServiceSelected(service),
                  'hover:bg-gray-50': !isServiceSelected(service)
                }"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    :checked="isServiceSelected(service)"
                    @change="toggleServiceSelection(service)"
                    class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ service.serviceName || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ service.negotiatedPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                  >
                    Assigned
                  </span>
                </td>
              </tr>
              <tr v-if="filteredServices.length === 0">
                <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                  No services assigned to this group or found matching your search.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Drugs table (shown when activeTab === 1) -->
        <div v-else class="overflow-y-auto max-h-96">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-medium">Assigned Drugs</h3>
            <div class="flex items-center" v-if="assignedDrugs.length > 0">
              <input
                type="checkbox"
                id="selectAllDrugsRemoval"
                v-model="selectAll"
                @change="toggleSelectAll"
                class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label for="selectAllDrugsRemoval" class="ml-2 text-sm text-gray-700">Select All for Removal</label>
            </div>
          </div>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Drug Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price (ETB)
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="drug in filteredDrugs"
                :key="drug.contractDetailUuid"
                :class="{
                  'bg-red-50': isDrugSelected(drug),
                  'hover:bg-gray-50': !isDrugSelected(drug)
                }"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    :checked="isDrugSelected(drug)"
                    @change="toggleDrugSelection(drug)"
                    class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ drug.drugName || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ drug.negotiatedPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                  >
                    Assigned
                  </span>
                </td>
              </tr>
              <tr v-if="filteredDrugs.length === 0">
                <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                  No drugs assigned to this group or found matching your search.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Action buttons -->
        <div class="flex justify-end gap-4 pt-8">
          <Button @click="closeModal" variant="outline">
            Cancel
          </Button>
          <Button
            @click="submitItemsForRemoval"
            :pending="api.pending.value"
            class="text-white py-4 bg-red-600 hover:bg-red-700"
            :disabled="selectedServices.length === 0 && selectedDrugs.length === 0"
          >
            Remove Selected {{ activeTab === 0 ? 'Services' : 'Drugs' }}
          </Button>
        </div>
      </div>
    </NewFormParent>
  </ModalParent>
</template>

<style scoped>
table {
  border-collapse: separate;
  border-spacing: 0;
}

th {
  position: sticky;
  top: 0;
  z-index: 10;
}

tr:last-child td {
  border-bottom: none;
}
</style>
