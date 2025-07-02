<script setup>
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import { closeModal } from "@customizer/modal-x";
import { ref, computed, onMounted } from "vue";
import Form from "@/components/new_form_builder/Form.vue";
import Input from "@/components/new_form_elements/Input.vue";
import Button from "@/components/Button.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { useToast } from '@/toast/store/toast';
import { toasted } from '@/utils/utils';
import { getPayerContractById, assignServicesToGroup, getContractDetailsByGroup } from '../api/payerContractApi';
import { useRoute } from 'vue-router';
import Spinner from "@/components/Spinner.vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

const groupUuid = computed(() => props.data?.data?.groupUuid);
const contractHeaderUuid = computed(() => props.data?.data?.contractHeaderUuid);

console.log("Resolved groupUuid:", groupUuid.value);
console.log("Resolved contractHeaderUuid:", contractHeaderUuid.value);
console.log("AddServiceToContract modal mounted with props:", props);

const route = useRoute();
const { addToast } = useToast();
const api = useApiRequest();

// Tab management
const activeTab = ref(0); // 0 for Services, 1 for Drugs
const tabs = [
  { name: 'Services', value: 0 },
  { name: 'Drugs', value: 1 }
];

// Data states
const allServices = ref([]);
const allDrugs = ref([]);
const existingServices = ref([]);
const existingDrugs = ref([]);
const searchTerm = ref('');
const selectedServices = ref([]);
const selectedDrugs = ref([]);
const loading = ref(true);
const selectAll = ref(false);

// Fetch all available services and existing contract services
async function fetchServices() {
  try {
    loading.value = true;

    if (!groupUuid.value || !contractHeaderUuid.value) {
      console.warn("UUIDs not available for fetching services.");
      loading.value = false;
      return;
    }

    // Fetch existing services and drugs in the contract for this group
    const existingResponse = await getContractDetailsByGroup(groupUuid.value, contractHeaderUuid.value);
    existingServices.value = existingResponse.data?.map(item => ({
      ...item,
      isExisting: true // Mark as existing
    })) || [];

    // Fetch all available services and drugs for the contract
    const allResponse = await getPayerContractById(contractHeaderUuid.value);
    const allItems = allResponse.data?.contractDetails || [];

    // Filter out items that are already in the contract for this group
    allServices.value = allItems.filter(item => {
      if (item.itemType === 'SERVICE') {
        return !existingServices.value.some(existing => 
          existing.contractDetailUuid === item.contractDetailUuid
        );
      }
      return false;
    });

    allDrugs.value = allItems.filter(item => {
      if (item.itemType === 'DRUG') {
        return !existingDrugs.value.some(existing => 
          existing.contractDetailUuid === item.contractDetailUuid
        );
      }
      return false;
    });

    // Automatically select existing items (they can't be unselected)
    selectedServices.value = [...existingServices.value];
    selectedDrugs.value = [...existingDrugs.value];

  } catch (error) {
    console.error('Error fetching services and drugs:', error);
    toasted(false, 'Failed to load services and drugs');
  } finally {
    loading.value = false;
  }
}
const combinedServices = computed(() => {
  return [
    ...existingServices.value,
    ...allServices.value
  ];
});

// Combined list of drugs (existing + available)
const combinedDrugs = computed(() => {
  return [
    ...existingDrugs.value,
    ...allDrugs.value
  ];
});
// Toggle select all available services/drugs
function toggleSelectAll() {
  if (activeTab.value === 0) {
    if (selectAll.value) {
      // Add all available services (excluding existing ones which are already selected)
      const newServices = allServices.value.filter(service => 
        !selectedServices.value.some(s => s.contractDetailUuid === service.contractDetailUuid));
      selectedServices.value = [...selectedServices.value, ...newServices];
    } else {
      // Remove all available services (keep existing ones)
      selectedServices.value = selectedServices.value.filter(s => s.isExisting);
    }
  } else {
    if (selectAll.value) {
      // Add all available drugs
      const newDrugs = allDrugs.value.filter(drug => 
        !selectedDrugs.value.some(d => d.contractDetailUuid === drug.contractDetailUuid));
      selectedDrugs.value = [...selectedDrugs.value, ...newDrugs];
    } else {
      // Remove all available drugs (keep existing ones)
      selectedDrugs.value = selectedDrugs.value.filter(d => d.isExisting);
    }
  }
}

// Filter services based on search term
const filteredServices = computed(() => {
  if (!searchTerm.value) return combinedServices.value;

  const term = searchTerm.value.toLowerCase();
  return combinedServices.value.filter(service => 
    (service.serviceName || '').toLowerCase().includes(term)
  );
});

// Filter drugs based on search term
const filteredDrugs = computed(() => {
  if (!searchTerm.value) return combinedDrugs.value;

  const term = searchTerm.value.toLowerCase();
  return combinedDrugs.value.filter(drug => 
    (drug.drugName || '').toLowerCase().includes(term)
  );
});
// Toggle service selection
function toggleServiceSelection(service) {
  const index = selectedServices.value.findIndex(s => s.contractDetailUuid === service.contractDetailUuid);

  if (index > -1) {
    selectedServices.value.splice(index, 1);
  } else {
    selectedServices.value.push({
      ...service,
      isExisting: service.isExisting || false
    });
  }
}

// Toggle drug selection
function toggleDrugSelection(drug) {
  const index = selectedDrugs.value.findIndex(d => d.contractDetailUuid === drug.contractDetailUuid);

  if (index > -1) {
    selectedDrugs.value.splice(index, 1);
  } else {
    selectedDrugs.value.push({
      ...drug,
      isExisting: drug.isExisting || false
    });
  }
}

// Check if service is selected
function isServiceSelected(service) {
  return selectedServices.value.some(s => s.contractDetailUuid === service.contractDetailUuid);
}

// Check if drug is selected
function isDrugSelected(drug) {
  return selectedDrugs.value.some(d => d.contractDetailUuid === drug.contractDetailUuid);
}

// Submit selected services and drugs
async function submitItems() {
  try {
    if (!groupUuid.value || !contractHeaderUuid.value) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Missing group or contract UUIDs to add items.'
      });
      return;
    }

    // Collect UUIDs of NEWLY selected services and drugs
    const newServiceUuids = selectedServices.value
      .filter(s => !s.isExisting)
      .map(s => s.contractDetailUuid);

    const newDrugUuids = selectedDrugs.value
      .filter(d => !d.isExisting)
      .map(d => d.contractDetailUuid);

    const itemUuidsToSend = [...newServiceUuids, ...newDrugUuids].filter(Boolean);

    if (itemUuidsToSend.length === 0) {
      addToast({
        type: 'info',
        title: 'No Changes',
        message: 'No new items selected to add'
      });
      closeModal();
      return;
    }

    const response = await assignServicesToGroup(
      groupUuid.value,
      itemUuidsToSend
    );

    if (response.success) {
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Items added to contract successfully'
      });
      closeModal(true);
    } else {
      throw new Error(response.message || 'Failed to add items');
    }
  } catch (error) {
    console.error('Error adding items:', error);
    addToast({
      type: 'error',
      title: 'Error',
      message: error.message || 'Failed to add items to contract'
    });
  }
}

onMounted(() => {
  fetchServices();
});
</script>

<template>
  <ModalParent>
    <NewFormParent
      size="lg"
      title="Add Services/Drugs to Contract"
      subtitle="Select services or drugs to add to this contract"
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
            :placeholder="activeTab === 0 ? 'Search services...' : 'Search drugs...'"
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
      <h3 class="font-medium">Services</h3>
      <div class="flex items-center" v-if="allServices.length > 0">
        <input
          type="checkbox"
          id="selectAllServices"
          v-model="selectAll"
          @change="toggleSelectAll"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label for="selectAllServices" class="ml-2 text-sm text-gray-700">Select All Available</label>
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
            'bg-blue-50': service.isExisting,
            'hover:bg-gray-50': !service.isExisting
          }"
        >
          <td class="px-6 py-4 whitespace-nowrap">
            <input
              type="checkbox"
              :checked="isServiceSelected(service)"
              @change="toggleServiceSelection(service)"
              :disabled="service.isExisting"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
              v-if="service.isExisting"
              class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
            >
              Already in contract
            </span>
            <span
              v-else
              class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
            >
              Available
            </span>
          </td>
        </tr>
        <tr v-if="filteredServices.length === 0">
          <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
            No services found matching your search
          </td>
        </tr>
      </tbody>
    </table>
  </div>

        <!-- Drugs table (shown when activeTab === 1) -->
        <div v-else class="overflow-y-auto max-h-96">
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
                  'bg-blue-50': drug.isExisting,
                  'hover:bg-gray-50': !drug.isExisting
                }"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    :checked="isDrugSelected(drug)"
                    @change="toggleDrugSelection(drug)"
                    :disabled="drug.isExisting"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                    v-if="drug.isExisting"
                    class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                  >
                    Already in contract
                  </span>
                  <span
                    v-else
                    class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                  >
                    Available
                  </span>
                </td>
              </tr>
              <tr v-if="filteredDrugs.length === 0">
                <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                  No drugs found matching your search
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
            @click="submitItems"
            :pending="api.pending.value"
            class="text-white py-4 bg-primary"
            :disabled="(selectedServices.length === 0 || selectedServices.every(s => s.isExisting)) &&
                       (selectedDrugs.length === 0 || selectedDrugs.every(d => d.isExisting))"
          >
            Add Selected {{ activeTab === 0 ? 'Services' : 'Drugs' }}
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