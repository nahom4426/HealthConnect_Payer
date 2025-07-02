<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAllServices } from '@/features/service/api/serviceApi';
import { getAllDrugs } from '@/features/service/api/drugApi';
import { getAllProviders } from '@/features/providers/api/providerApi';
import { getPayerContractById, updatePayerContract } from '../api/submitContractApi';
import Select from '@/components/new_form_elements/Select.vue';
import Input from '@/components/new_form_elements/Input.vue';
import icons from '@/utils/icons';
import { toasted } from '@/utils/utils';
import { useApiRequest } from '@/composables/useApiRequest';
import { useAuthStore } from '@/stores/auth';
import DatePicker from '@/components/datePicker.vue';
import Spinner from '@/components/Spinner.vue';
import ButtonSpinner from '@/components/buttonSpinner.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const contractId = route.params.id;
const selectedProvider = ref(null); // Will hold { value: uuid, label: name }
const beginDate = ref('');
const endDate = ref('');
const services = ref([]);
const drugs = ref([]);
const selectedItems = ref([]);
const loadingContract = ref(true);
// State management
const payerUuid = computed(() => auth.auth.user?.payerUuid || '');
const selectedItemsPage = ref(1);
const selectedItemsPerPage = ref(10);
const isNegotiating = ref(false);
const discountPercentage = ref(0);
const providers = ref([]);
const submitAttempted = ref(false);
const activeTab = ref('services');
const selectedTab = ref('services');
 // Holds both selected services AND drugs
const contractReq = useApiRequest();
const searchQuery = ref('');
const rowsPerPage = ref(5);
const currentPage = ref(1);
const fetchPending = ref(false); // For services/drugs fetching
const error = ref(null);
// For initial contract data loading
const pending = ref(false); // For submit button loading state

// Form data structure matching API response
const formData = ref({
  contractHeaderUuid: '',
  contractName: '',
  contractDescription: '',
  beginDate: '',
  endDate: '',
  status: 'ACTIVE',
  payerUuid: auth.auth.user?.payerUuid || '',
  providerUuid: '',
  contractDetails: [],
  insuredSummaries: []
});

// Computed property for provider select options
const providerOptions = computed(() => {
  return providers.value.map(provider => ({
    value: provider.providerUuid,
    label: provider.providerName,
  }));
});

// Fetch contract data - CRITICAL FOR MAPPING EXISTING DATA
async function fetchContract() {
  try {
    loadingContract.value = true;

    const response = await getPayerContractById(contractId);
    console.log('🏥 Full response:', response);

    if (response && response.data) {
      const contract = response.data;
      console.log('📦 Extracted contract:', contract);

      Object.assign(formData.value, {
        ...contract,
        contractDetails: contract.contractDetails || [],
        insuredSummaries: contract.insuredSummaries || [],
      });

      selectedProvider.value = contract.providerUuid;
      beginDate.value = contract.startDate;
      endDate.value = contract.endDate;

      if (contract.contractDetails) {
        selectedItems.value = contract.contractDetails.map(item => {
          const parsedItem = {
            id: item.serviceUuid || item.drugUuid,
            serviceUuid: item.serviceUuid,
            drugUuid: item.drugUuid,
            name: item.serviceName || item.drugName,
            description: item.description || 'No description',
            providerPrice: item.negotiatedPrice,
            userPrice: item.negotiatedPrice,
            assignedGroups: item.assignedGroups || [],
            type: item.serviceUuid ? 'service' : (item.drugUuid ? 'drug' : 'unknown'),
          };
          console.log('🧩 Parsed item:', parsedItem);
          return parsedItem;
        });
      }

      console.log('✅ Final selectedItems:', selectedItems.value);
    } else {
      throw new Error('Contract data not found in response');
    }
  } catch (err) {
    console.error('❌ Error fetching contract:', err);
    error.value = 'Failed to load contract data';
    toasted(false, 'Failed to load contract data');
    router.push('/payer_contracts');
  } finally {
    loadingContract.value = false;
  }
}

async function fetchProviders() {
  try {
    fetchPending.value = true;
    error.value = null;
    const response = await getAllProviders({ page: 1, limit: 100 });

    // Ensure providers are mapped correctly for the Select component
    providers.value = response.data.content.map(item => ({
      providerUuid: item.providerUuid,
      providerName: item.providerName,
      // ... other provider fields if needed
    }));
  } catch (err) {
    console.error('Error fetching providers:', err);
    error.value = 'Failed to load providers. Please try again.';
  } finally {
    fetchPending.value = false;
  }
}

async function fetchServices() {
  if (!selectedProvider.value) {
    services.value = [];
    return;
  }

  try {
    fetchPending.value = true;
    // Assuming getAllServices takes providerUuid as an argument for filtering
    const response = await getAllServices(selectedProvider.value);

    services.value = (Array.isArray(response) ? response : response.data?.content || response.content || [])
      .map(service => ({
        id: service.serviceUuid,
        serviceUuid: service.serviceUuid,
        name: service.serviceName,
        description: service.serviceCategory || service.description || 'No description',
        providerPrice: service.price || 0, // This is the base price from the provider's listing
        userPrice: service.price || 0, // Default user price to provider price
        assignedGroups: [],
        type: 'service'
      }));
  } catch (err) {
    console.error('Error fetching services:', err);
    services.value = [];
    error.value = 'Failed to load services. Please try again.';
  } finally {
    fetchPending.value = false;
  }
}

async function fetchDrugs() {
  if (!selectedProvider.value) {
    drugs.value = [];
    return;
  }

  try {
    fetchPending.value = true;
    const response = await getAllDrugs(selectedProvider.value);

    drugs.value = (Array.isArray(response) ? response : response.data?.content || response.content || [])
      .map(drug => ({
        id: drug.drugUuid,
        drugUuid: drug.drugUuid,
        name: drug.drugName,
        description: drug.description || 'No description',
        providerPrice: drug.price || 0, // This is the base price from the provider's listing
        userPrice: drug.price || 0, // Default user price to provider price
        assignedGroups: [],
        type: 'drug'
      }));
  } catch (err) {
    console.error('Error fetching drugs:', err);
    drugs.value = [];
    error.value = 'Failed to load drugs. Please try again.';
  } finally {
    fetchPending.value = false;
  }
}

// Watch for selectedProvider changes to fetch associated services/drugs
// This ensures that when selectedProvider is set (either on initial load or by user),
// the lists of available services/drugs are updated.
watch(selectedProvider, async (newVal) => {
  if (newVal) {
    await fetchServices();
    await fetchDrugs();
  }
}, { immediate: false }); // Do not run immediately on component mount, as onMounted handles initial fetches

// Computed properties for filtering and pagination
const currentItems = computed(() => activeTab.value === 'services' ? services.value : drugs.value);

const filteredItems = computed(() => {
  if (!searchQuery.value) {
    return currentItems.value;
  }
  const query = searchQuery.value.toLowerCase();
  return currentItems.value.filter(item =>
    item.name.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  );
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  const end = start + rowsPerPage.value;
  return filteredItems.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredItems.value.length / rowsPerPage.value);
});

const areAllItemsSelected = computed(() => {
  const currentTabItems = filteredItems.value;
  if (currentTabItems.length === 0) return false;
  return currentTabItems.every(item => selectedItems.value.some(sel => sel.id === item.id));
});

const paginatedSelectedItems = computed(() => {
  const itemsToShow = selectedItems.value.filter(item =>
    selectedTab.value === 'services' ? item.type === 'service' : item.type === 'drug'
  );
  const start = (selectedItemsPage.value - 1) * selectedItemsPerPage.value;
  const end = start + selectedItemsPerPage.value;
  return itemsToShow.slice(start, end);
});

const selectedItemsTotalPages = computed(() => {
  const itemsToShow = selectedItems.value.filter(item =>
    selectedTab.value === 'services' ? item.type === 'service' : item.type === 'drug'
  );
  return Math.ceil(itemsToShow.length / selectedItemsPerPage.value);
});

// Helper methods
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function toggleAllItems(event) {
  const isChecked = event.target.checked;
  const currentTabItems = filteredItems.value;

  if (isChecked) {
    currentTabItems.forEach(item => {
      if (!selectedItems.value.some(sel => sel.id === item.id)) {
        selectedItems.value.push({ ...item });
      }
    });
  } else {
    selectedItems.value = selectedItems.value.filter(item =>
      !currentTabItems.some(curr => curr.id === item.id)
    );
  }
}

function removeItem(itemId) {
  selectedItems.value = selectedItems.value.filter(item => item.id !== itemId);
}

function editPrices() {
  isNegotiating.value = !isNegotiating.value;
  if (!isNegotiating.value) {
    discountPercentage.value = 0;
  }
}

function applyPercentageDiscount() {
  if (discountPercentage.value < 0) discountPercentage.value = 0;
  if (discountPercentage.value > 100) discountPercentage.value = 100;

  selectedItems.value.forEach(item => {
    if (typeof item.providerPrice === 'number' && item.providerPrice >= 0) {
      item.userPrice = item.providerPrice * (1 - discountPercentage.value / 100);
      item.userPrice = parseFloat(item.userPrice.toFixed(2));
    }
  });
}

function updateItemPrice(item) {
  if (typeof item.userPrice !== 'number' || isNaN(item.userPrice) || item.userPrice < 0) {
    item.userPrice = 0;
  }
  item.userPrice = parseFloat(item.userPrice.toFixed(2));
}

// Submission Logic
async function submit() {
  submitAttempted.value = true;

  if (!formData.value.contractName || !selectedProvider.value || !beginDate.value || !endDate.value || selectedItems.value.length === 0) {
    toasted(false, 'Please fill all required fields and select at least one service/drug');
    return;
  }

  if (new Date(endDate.value) <= new Date(beginDate.value)) {
    toasted(false, 'End date must be after start date');
    return;
  }

  try {
    pending.value = true;

    const contractDetailsPayload = selectedItems.value.map(item => {
      const detail = {
        negotiatedPrice: item.userPrice,
        assignedGroups: item.assignedGroups || []
      };
      if (item.type === 'service') {
        detail.serviceUuid = item.serviceUuid;
        detail.serviceName = item.name;
      } else if (item.type === 'drug') {
        detail.drugUuid = item.drugUuid;
        detail.drugName = item.name;
      }
      return detail;
    });

    const payload = {
      ...formData.value,
      providerUuid: selectedProvider.value, // Ensure the provider UUID is from the selected one
      beginDate: beginDate.value,
      endDate: endDate.value,
      contractDetails: contractDetailsPayload,
      totalServices: selectedItems.value.filter(item => item.type === 'service').length,
      totalDrugs: selectedItems.value.filter(item => item.type === 'drug').length,
      totalInsured: formData.value.insuredSummaries.length,
      totalDependants: formData.value.insuredSummaries.reduce((sum, insured) =>
        sum + (insured.dependants?.length || 0), 0)
    };

    payload.payerUuid = payerUuid.value; // Ensure payerUuid from auth store is always there

    const response = await updatePayerContract(payload.contractHeaderUuid, payload);

    if (response.success) {
      toasted(true, 'Contract updated successfully');
      router.push('/payer-contracts');
    } else {
      toasted(false, response.error || 'Failed to update contract');
    }
  } catch (error) {
    console.error('Error:', error);
    toasted(false, 'An error occurred while processing your request');
  } finally {
    pending.value = false;
  }
}

onMounted(async () => {
  await fetchProviders(); // Fetch providers first so `providerOptions` are available
  await fetchContract();  // Then fetch the specific contract. This will set `selectedProvider.value`.
  // The `watch(selectedProvider, ...)` will then trigger fetchServices and fetchDrugs automatically
  // once `selectedProvider.value` is set by `fetchContract`.
});
</script>

<template>
  <div v-if="loadingContract" class="flex justify-center items-center h-64">
    <Spinner size="lg" />
    
  </div>

  <Form v-else @submit.prevent="submit" :loading="pending" :id="'new-contract-form'" class="space-y-6">
    <div class="bg-white rounded-md p-6 space-y-6 shadow-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Contract Name"
            name="contractName"
            v-model="formData.contractName"
            required
            :error="submitAttempted && !formData.contractName"
            :error-message="submitAttempted && !formData.contractName ? 'Contract Name is required' : ''"
          />
        </div>
        <div>
          <Input
            label="Contract Number"
            name="contractNumber"
            v-model="formData.contractNumber"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-2">
          <Select
            :obj="true"
            name="provider"
            label="Provider"
            :options="providerOptions"
            :disabled="true"
            v-model="selectedProvider"
            required
            :error="submitAttempted && !selectedProvider"
            :error-message="submitAttempted && !selectedProvider ? 'Provider is required' : ''"
          />
        </div>

        <div class="flex gap-4">
          <div class="w-1/2">
            <DatePicker
              v-model="beginDate"
              label="Start date"
              required
              :error="!beginDate && submitAttempted"
              :error-message="!beginDate && submitAttempted ? 'Start date is required' : ''"
            />
          </div>
          <div class="w-1/2">
            <DatePicker
              v-model="endDate"
              label="End date"
              required
              :error="(!endDate || new Date(endDate) <= new Date(beginDate)) && submitAttempted"
              :error-message="
                !endDate && submitAttempted ? 'End date is required' :
                (endDate && new Date(endDate) <= new Date(beginDate) && submitAttempted ? 'End date must be after start date' : '')
              "
            />
          </div>
        </div>
      </div>

      <div v-if="error" class="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
        {{ error }}
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <div class="md:col-span-2 bg-[#F6F7FA] rounded-lg shadow-sm">
          <div class="flex items-center p-4 justify-between border-b border-gray-200">
            <h3 class="text-md text-[#75778B] font-semibold">
              Provider Services and Drugs
            </h3>
            <div class="flex border border-gray-300 rounded-md overflow-hidden">
              <button
              type="button"
                @click="activeTab = 'services'"
                :class="[
                  'px-4 py-2 text-sm font-medium transition-colors duration-200',
                  activeTab === 'services' ? 'bg-[#02676B] text-white' : 'text-[#75778B] hover:bg-gray-100'
                ]"
              >
                Services
              </button>
              <button
              type="button"
                @click="activeTab = 'drugs'"
                :class="[
                  'px-4 py-2 text-sm font-medium transition-colors duration-200',
                  activeTab === 'drugs' ? 'bg-[#02676B] text-white' : 'text-[#75778B] hover:bg-gray-100'
                ]"
              >
                Drugs
              </button>
            </div>
          </div>

          <div v-if="fetchPending" class="p-8 text-center flex flex-col items-center justify-center">
            <Spinner class="text-[#02676B]" size="md" />
            <p class="mt-2 text-gray-600">Loading {{ activeTab }}...</p>
          </div>
          <template v-else>
            <div class="p-3">
              <div class="relative bg-white p-4 rounded-lg shadow-sm mb-4">
                <div class="w-full bg-gray-100 h-[3.5rem] focus-within:border-[#02676B] flex items-center rounded-lg overflow-hidden border border-gray-200">
                  <span
                    class="w-10 h-full text-gray-500 grid place-items-center"
                    v-html="icons.search"
                  />
                  <input
                    v-model="searchQuery"
                    :placeholder="`Search and Select ${activeTab === 'services' ? 'Services' : 'Drugs'}`"
                    class="flex-1 bg-transparent px-4 py-2 h-full outline-none text-gray-800"
                  />
                </div>
                <div class="text-center mt-4">
                  <button
                    class="text-sm px-4 py-2 rounded-lg transition-colors duration-200"
                    :class="isNegotiating ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-[#75778B] text-white hover:bg-[#616373]'"
                    @click="editPrices"
                  >
                    <template v-if="!isNegotiating">
                      If you want to negotiate prices of services and drugs, <strong>Click here</strong>
                    </template>
                    <template v-else>
                      <strong>Finish Negotiating</strong>
                    </template>
                  </button>
                </div>
              </div>
              <table class="w-full bg-white table-auto text-sm rounded-lg overflow-hidden shadow-sm">
                <thead>
                  <tr class="text-left font-bold text-gray-700 bg-gray-50">
                    <th class="p-3 w-12">
                      <input
                        type="checkbox"
                        @change="toggleAllItems"
                        :checked="areAllItemsSelected"
                        class="h-4 w-4 text-[#02676B] focus:ring-[#02676B] border-gray-300 rounded"
                      />
                    </th>
                    <th class="p-3 w-12">#</th>
                    <th class="p-3">{{ activeTab === 'services' ? 'Service' : 'Drug' }} Name</th>
                    <th class="p-3">Description</th>
                    <th class="p-3">Provider Price</th>
                    <th class="p-3">
                      <div class="flex items-center gap-2">
                        <span>Your Price</span>
                        <div v-if="isNegotiating" class="flex items-center gap-1 text-xs">
                          <input
                            v-model.number="discountPercentage"
                            type="number"
                            min="0"
                            max="100"
                            class="w-16 p-2 rounded-md bg-gray-50 border border-gray-300 text-center"
                            @change="applyPercentageDiscount"
                          />
                          <span>% off</span>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in paginatedItems"
                    :key="item.id"
                    class="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td class="p-3">
                      <input
                        type="checkbox"
                        :checked="selectedItems.some(sel => sel.id === item.id)"
                        @change="
                          selectedItems.some(sel => sel.id === item.id)
                            ? selectedItems = selectedItems.filter(sel => sel.id !== item.id)
                            : selectedItems.push({ ...item }) // Push a deep copy to avoid reactivity issues with userPrice
                        "
                        class="h-4 w-4 text-[#02676B] focus:ring-[#02676B] border-gray-300 rounded"
                      />
                    </td>
                    <td class="p-3">{{ (currentPage - 1) * rowsPerPage + index + 1 }}</td>
                    <td class="p-3 font-medium text-gray-800">{{ item.name }}</td>
                    <td class="p-3 text-gray-600">{{ item.description }}</td>
                    <td class="p-3 text-gray-700">ETB {{ item.providerPrice?.toLocaleString('en-US') || '0.00' }}</td>
                    <td class="p-3">
                      <input
                        v-if="isNegotiating"
                        v-model.number="item.userPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        class="w-28 p-2 rounded-md bg-gray-50 border border-gray-300 text-gray-800"
                        @input="updateItemPrice(item)"
                      />
                      <span v-else class="text-gray-700">ETB {{ item.userPrice?.toLocaleString('en-US') || '0.00' }}</span>
                    </td>
                  </tr>
                  <tr v-if="paginatedItems.length === 0">
                    <td colspan="6" class="p-4 text-center text-gray-500">
                      No {{ activeTab }} found.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="flex justify-between items-center p-3 text-sm border-t border-gray-200 bg-white rounded-b-lg">
              <div>
                Showing
                <select
                  v-model="rowsPerPage"
                  class="border rounded px-2 py-1 mx-1 text-gray-700"
                  @change="currentPage = 1"
                >
                  <option v-for="n in [5, 10, 20, 50]" :key="n" :value="n">{{ n }}</option>
                </select>
                <span>Showing {{ (currentPage - 1) * rowsPerPage + 1 }} to {{ Math.min(currentPage * rowsPerPage, filteredItems.length) }} out of {{ filteredItems.length }} records</span>
              </div>
              <div class="flex items-center gap-1">
                <button
                  @click="prevPage"
                  :disabled="currentPage === 1"
                  class="px-3 py-1 border rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &lt;
                </button>
                <span v-for="n in totalPages" :key="n">
                  <button
                    :class="[
                      'px-3 py-1 border rounded-md font-medium transition-colors duration-200',
                      currentPage === n ? 'bg-[#02676B] text-white' : 'text-gray-700 hover:bg-gray-100'
                    ]"
                    @click="currentPage = n"
                  >
                    {{ n }}
                  </button>
                </span>
                <button
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1 border rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &gt;
                </button>
              </div>
            </div>
          </template>
        </div>

        <div class="bg-[#DFF1F1] h-auto p-4 rounded-md shadow-sm">
          <div class="flex justify-between items-center mb-3 border-b border-[#02676B] pb-2">
            <h3 class="text-[#02676B] text-base font-semibold">
              Selected Services / Drugs
            </h3>
            <div class="flex rounded-md overflow-hidden border border-[#02676B]">
              <button
              type="button"
                @click="selectedTab = 'services'"
                :class="[
                  'px-3 py-1 rounded-l-md text-sm font-medium transition-colors duration-200',
                  selectedTab === 'services' ? 'bg-[#02676B] text-white' : 'text-[#02676B] bg-white hover:bg-teal-50'
                ]"
              >
                Services
              </button>
              <button
              type="button"
                @click="selectedTab = 'drugs'"
                :class="[
                  'px-3 py-1 rounded-r-md text-sm font-medium transition-colors duration-200',
                  selectedTab === 'drugs' ? 'bg-[#02676B] text-white' : 'text-[#02676B] bg-white hover:bg-teal-50'
                ]"
              >
                Drugs
              </button>
            </div>
          </div>

          <table class="text-sm w-full bg-white rounded-md shadow-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="text-left p-2 font-bold text-gray-700">#</th>
                <th class="text-left p-2 font-bold text-gray-700">Name</th>
                <th class="text-left p-2 font-bold text-gray-700">Price</th>
                <th class="text-left p-2 font-bold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, idx) in paginatedSelectedItems"
                :key="item.id"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="p-2">{{ idx + 1 + (selectedItemsPage - 1) * selectedItemsPerPage }}</td>
                <td class="p-2 font-medium text-gray-800">{{ item.name }}</td>
                <td class="p-2 text-gray-700">ETB {{ item.userPrice?.toLocaleString('en-US') || '0.00' }}</td>
                <td class="p-2">
                  <button
                    @click="removeItem(item.id)"
                    class="text-red-500 hover:text-red-700 transition-colors"
                    title="Remove item"
                  >
                    <i v-html="icons.trash" class="w-4 h-4 inline-block align-middle"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="paginatedSelectedItems.length === 0">
                <td colspan="4" class="p-4 text-center text-gray-500">
                  No {{ selectedTab }} selected
                </td>
              </tr>
            </tbody>
          </table>

          <div class="flex justify-between items-center mt-3 text-sm">
            <div>
              <span class="text-gray-700">Showing {{ (selectedItemsPage - 1) * selectedItemsPerPage + 1 }} to {{ Math.min(selectedItemsPage * selectedItemsPerPage, selectedItems.filter(item => selectedTab === 'services' ? item.type === 'service' : item.type === 'drug').length) }} of {{ selectedItems.filter(item => selectedTab === 'services' ? item.type === 'service' : item.type === 'drug').length }}</span>
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="selectedItemsPage = Math.max(1, selectedItemsPage - 1)"
                :disabled="selectedItemsPage === 1"
                class="px-3 py-1 border rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &lt;
              </button>
              <span v-for="n in selectedItemsTotalPages" :key="n">
                <button
                  :class="[
                    'px-3 py-1 border rounded-md font-medium transition-colors duration-200',
                    selectedItemsPage === n ? 'bg-[#02676B] text-white' : 'text-gray-700 hover:bg-gray-100'
                  ]"
                  @click="selectedItemsPage = n"
                >
                  {{ n }}
                </button>
              </span>
              <button
                @click="selectedItemsPage = Math.min(selectedItemsTotalPages, selectedItemsPage + 1)"
                :disabled="selectedItemsPage === selectedItemsTotalPages"
                class="px-3 py-1 border rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-md p-6 mt-6 shadow-sm" v-if="formData.insuredSummaries?.length">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Insured Members</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership #</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dependants</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="insured in formData.insuredSummaries" :key="insured.insuredUuid">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ insured.fullName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ insured.membershipNumber }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <div v-for="dependant in insured.dependants" :key="dependant.dependantUuid" class="mb-1">
                    {{ dependant.fullName }} ({{ dependant.relationshipType }})
                  </div>
                  <div v-if="!insured.dependants?.length" class="text-gray-400">None</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="text-right pt-6 border-t border-gray-200 mt-6">
        <button
          type="submit"
          :disabled="pending"
          class="bg-[#02676B] text-white px-8 py-3 rounded-md hover:bg-[#02494D] transition-colors duration-200 "
        >
          <span v-if="pending" class="flex items-center justify-center">
            <ButtonSpinner size="xs" class="mr-2" /> Updating...
          </span>
          <span v-else>
            Update Contract
          </span>
        </button>
      </div>
    </div>
  </Form>
</template>

<style scoped>
/* Your existing styles remain the same, with minor adjustments for new elements/classes */
.required-field {
  @apply border-l-2 border-[#02676B];
}

.error-field {
  @apply border-red-500;
}

.error-message {
  @apply text-red-500 text-xs mt-1;
}

/* Custom checkbox styles for a cleaner look */
input[type="checkbox"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid #d1d5db; /* Light gray border */
  border-radius: 0.25rem; /* Slightly rounded corners */
  outline: none;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s, border-color 0.2s;
}

input[type="checkbox"]:checked {
  background-color: #02676B; /* Teal background when checked */
  border-color: #02676B;
}

input[type="checkbox"]:checked::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

input[type="checkbox"]:focus {
  box-shadow: 0 0 0 2px rgba(2, 103, 107, 0.2); /* Focus ring */
}

/* Make date inputs required visually */
input[type="date"]:required {
  border-left: 2px solid #02676B;
}

select:focus {
  @apply border-[#02676B] ring-[#02676B];
}

/* Make headers bold */
th {
  @apply font-bold;
}

/* Style for the discount percentage input */
.discount-input {
  @apply w-12 p-1 border border-gray-300 rounded text-sm;
}

/* Style for price input fields */
.price-input {
  @apply w-24 p-1 border border-gray-300 rounded text-sm;
}

button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

table {
  @apply min-w-full divide-y divide-gray-200;
}

th {
  @apply py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider;
}

td {
  @apply py-4; /* Removed whitespace-nowrap for better responsiveness, added some vertical padding */
}

/* Style for remove button - ensure icons display correctly */
.remove-btn i {
    display: inline-block; /* Ensure the SVG icon respects width/height */
    vertical-align: middle; /* Align with text if any */
}

/* General button styles for consistent look */
button {
  transition: all 0.2s ease-in-out;
}
</style>