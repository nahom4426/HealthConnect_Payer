<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { getAllServices } from '@/features/service/api/serviceApi';
import { getAllDrugs } from '@/features/service/api/drugApi';
import { getAllProviders } from '@/features/providers/api/providerApi';
import Select from '@/components/new_form_elements/Select.vue';
import Input from '@/components/new_form_elements/Input.vue';
import icons from '@/utils/icons';
import { createNewContract } from '../api/submitContractApi';
import { toasted } from '@/utils/utils';
import { useApiRequest } from '@/composables/useApiRequest';
import { useAuthStore } from '@/stores/auth';
import DatePicker from '@/components/datePicker.vue';
import Spinner from '@/components/Spinner.vue';
import ButtonSpinner from '@/components/buttonSpinner.vue';

const auth = useAuthStore();
const payerUuid = computed(() => auth.auth.user?.payerUuid || '');
const selectedItemsPage = ref(1);
const selectedItemsPerPage = ref(10);
const isNegotiating = ref(false);
const discountPercentage = ref(0);
const providers = ref([]);
const selectedProvider = ref(null);
const startDate = ref('');
const endDate = ref('');
const submitAttempted = ref(false);
const activeTab = ref('services');
const selectedTab = ref('services');
const services = ref([]);
const drugs = ref([]);
const selectedItems = ref([]);
const searchQuery = ref('');
const rowsPerPage = ref(5);
const currentPage = ref(1);
const fetchPending = ref(false);
const error = ref(null);
const submitting = ref(false); // New submitting state

const providerOptions = computed(() => {
  return providers.value.map(provider => ({
    label: `${provider.providerName} (${provider.threeDigitAcronym})`,
    value: provider.providerUuid,
  }));
});


async function fetchProviders() {
  try {
    fetchPending.value = true;
    error.value = null;
    const response = await getAllProviders({ page: 1, limit: 100 });

    if (!response?.data?.content || !Array.isArray(response.data.content)) {
      throw new Error('Invalid data format: missing content array');
    }

    providers.value = response.data.content.map(item => ({
      providerUuid: item.providerUuid,
      providerName: item.providerName,
      threeDigitAcronym: item.threeDigitAcronym,
      email: item.email,
      telephone: item.telephone
    }));

    if (providers.value.length === 0) {
      error.value = 'No providers available';
    }
  } catch (err) {
    console.error('Error fetching providers:', err);
    error.value = 'Failed to load providers. Please try again.';
  } finally {
    fetchPending.value = false;
  }
}

async function fetchServices() {
  if (!selectedProvider.value) return;

  try {
    fetchPending.value = true;
    const response = await getAllServices(selectedProvider.value);
    let servicesData = [];

    if (Array.isArray(response)) {
      servicesData = response;
    } else if (response?.data?.content) {
      servicesData = response.data.content;
    } else if (response?.content) {
      servicesData = response.content;
    } else {
      throw new Error('Unexpected services response format');
    }

    services.value = servicesData.map(service => ({
      id: service.serviceUuid,
      serviceUuid: service.serviceUuid,
      name: service.serviceName,
      description: service.serviceCategory || service.description || 'No description',
      providerPrice: service.price || 0,
      userPrice: service.price || 0
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
  if (!selectedProvider.value) return;

  try {
    fetchPending.value = true;
    const response = await getAllDrugs(selectedProvider.value);
    let drugsData = [];

    if (Array.isArray(response)) {
      drugsData = response;
    } else if (response?.data?.content) {
      drugsData = response.data.content;
    } else if (response?.content) {
      drugsData = response.content;
    } else {
      throw new Error('Unexpected drugs response format');
    }

    drugs.value = drugsData.map(drug => ({
      id: drug.drugUuid,
      drugUuid: drug.drugUuid,
      name: drug.drugName,
      description: drug.category || drug.description || 'No description',
      providerPrice: drug.price || 0,
      userPrice: drug.price || 0
    }));
  } catch (err) {
    console.error('Error fetching drugs:', err);
    drugs.value = [];
    error.value = 'Failed to load drugs. Please try again.';
  } finally {
    fetchPending.value = false;
  }
}

watch(selectedProvider, (newProviderUuid) => {
  if (newProviderUuid) {
    selectedItems.value = [];
    fetchServices();
    fetchDrugs();
  } else {
    services.value = [];
    drugs.value = [];
    selectedItems.value = [];
  }
});

let searchTimeout;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1;
  }, 300);
});

const items = computed(() => activeTab.value === 'services' ? services.value : drugs.value);

const filteredItems = computed(() => {
  return items.value.filter(item =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filteredItems.value.slice(start, start + rowsPerPage.value);
});

const totalPages = computed(() =>
  Math.ceil(filteredItems.value.length / rowsPerPage.value)
);

const areAllItemsSelected = computed(() =>
  filteredItems.value.every(item =>
    selectedItems.value.some(sel => sel.id === item.id)
  )
);

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};
const paginatedSelectedItems = computed(() => {
  const start = (selectedItemsPage.value - 1) * selectedItemsPerPage.value;
  const filtered = selectedItems.value.filter(item => 
    selectedTab.value === 'services' 
      ? 'serviceUuid' in item 
      : 'drugUuid' in item
  );
  return filtered.slice(start, start + selectedItemsPerPage.value);
});

const selectedItemsTotalPages = computed(() => 
  Math.ceil(selectedItems.value.filter(item => 
    selectedTab.value === 'services' 
      ? 'serviceUuid' in item 
      : 'drugUuid' in item
  ).length / selectedItemsPerPage.value)
);
function toggleAllItems() {
  if (areAllItemsSelected.value) {
    selectedItems.value = selectedItems.value.filter(
      item => !filteredItems.value.some(fi => fi.id === item.id)
    );
  } else {
    const ids = selectedItems.value.map(i => i.id);
    filteredItems.value.forEach(item => {
      if (!ids.includes(item.id)) {
        selectedItems.value.push(item);
      }
    });
  }
}
watch(selectedTab, () => {
  selectedItemsPage.value = 1;
});
function removeItem(itemId) {
  selectedItems.value = selectedItems.value.filter(item => item.id !== itemId);
}

function updateItemPrice(item) {
  const selectedItem = selectedItems.value.find(si => si.id === item.id);
  if (selectedItem) {
    selectedItem.userPrice = item.userPrice;
  }
}

function editPrices() {
  if (isNegotiating.value) {
    if (discountPercentage.value === 0) {
      selectedItems.value.forEach(item => {
        item.userPrice = item.providerPrice;
      });

      if (activeTab.value === 'services') {
        services.value = services.value.map(service => ({
          ...service,
          userPrice: service.providerPrice
        }));
      } else {
        drugs.value = drugs.value.map(drug => ({
          ...drug,
          userPrice: drug.providerPrice
        }));
      }
    }
  }

  isNegotiating.value = !isNegotiating.value;
  if (!isNegotiating.value) {
    discountPercentage.value = 0;
  }
}

function applyPercentageDiscount() {
  if (discountPercentage.value === 0) return;

  const discountFactor = (100 - discountPercentage.value) / 100;

  selectedItems.value.forEach(item => {
    item.userPrice = parseFloat((item.providerPrice * discountFactor).toFixed(2));
  });

  if (activeTab.value === 'services') {
    services.value = services.value.map(service => {
      const selectedItem = selectedItems.value.find(si => si.id === service.id);
      if (selectedItem) {
        return { ...service, userPrice: selectedItem.userPrice };
      }
      return service;
    });
  } else {
    drugs.value = drugs.value.map(drug => {
      const selectedItem = selectedItems.value.find(si => si.id === drug.id);
      if (selectedItem) {
        return { ...drug, userPrice: selectedItem.userPrice };
      }
      return drug;
    });
  }
}

const pending = ref(false);
const contractReq = useApiRequest();
async function submit() {
  submitAttempted.value = true;
  submitting.value = true; // Start loading

  // Validation checks
  if (!selectedProvider.value) {
    toasted(false, "", "Please select a provider first");
    submitting.value = false;
    return;
  }

  if (!startDate.value) {
    toasted(false, "", "Start date is required");
    submitting.value = false;
    return;
  }

  if (!endDate.value) {
    toasted(false, "", "End date is required");
    submitting.value = false;
    return;
  }

  if (new Date(endDate.value) <= new Date(startDate.value)) {
    toasted(false, "", "End date must be after start date");
    submitting.value = false;
    return;
  }

  if (!payerUuid.value) {
    toasted(false, "", "No payer information found. Please login again.");
    submitting.value = false;
    return;
  }

  if (selectedItems.value.length === 0) {
    toasted(false, "", "Please select at least one service or drug");
    submitting.value = false;
    return;
  }

  try {
    const payload = {
      providerUuid: selectedProvider.value,
      description: "Contract created on " + new Date().toLocaleDateString(),
      payerUuid: payerUuid.value,
      status: "ACTIVE",
      beginDate: new Date(startDate.value).toISOString(),
      endDate: new Date(endDate.value).toISOString(),
      contractItems: selectedItems.value.map(item => ({
        itemUuid: 'serviceUuid' in item ? item.serviceUuid : item.drugUuid,
        itemType: 'serviceUuid' in item ? 'SERVICE' : 'DRUG',
        negotiatedPrice: item.userPrice
      }))
    };

    const response = await createNewContract(payload);
    
    if (response.success) {
      toasted(true, 'Contract submitted successfully!');
      // Reset form
      resetForm();
    } else {
      throw new Error(response.message || 'Failed to submit contract');
    }
  } catch (error) {
    console.error('Submission failed:', error);
    toasted(false, "", error.message || 'Failed to submit contract');
  } finally {
    submitting.value = false;
  }
}

function resetForm() {
  selectedProvider.value = null;
  startDate.value = '';
  endDate.value = '';
  selectedItems.value = [];
  services.value = [];
  drugs.value = [];
  submitAttempted.value = false;
  activeTab.value = 'services';
  selectedTab.value = 'services';
}
const tabStyle = 'px-12 py-3 text-[#75778B] bg-white hover:bg-gray-100 text-sm';
const activeTabStyle = 'px-12 py-3 text-white bg-[#75778B] font-medium text-sm';

onMounted(async () => {
  await fetchProviders();
});
</script>
<template>
  <Form @submit.prevent="submit" :loading="pending">
    <div class="bg-white rounded-md p-6 space-y-6">
      <!-- Provider and Date Inputs -->
      <div class="grid md:grid-cols-3 gap-6">
        <div class="md:col-span-2 ">
          <Select     
            :obj="true"
            name="provider"
            label="Select Provider"
            validation="required"
            :options="providerOptions"
            :disabled="fetchPending"
            :attributes="{
              placeholder: 'Search and select provider'
            }"
            v-model="selectedProvider"
          />
        </div>

   <div class="flex gap-4">
  <div class="w-1/2">
    <DatePicker
      v-model="startDate"
      label="Start date"
      required
      :error="!startDate && submitAttempted"
      :error-message="!startDate && submitAttempted ? 'Start date is required' : ''"
    />
  </div>
  <div class="w-1/2">
    <DatePicker
      v-model="endDate"
      label="End date"
      required
      :error="(!endDate || new Date(endDate) <= new Date(startDate)) && submitAttempted"
      :error-message="
        !endDate && submitAttempted ? 'End date is required' : 
        (endDate && new Date(endDate) <= new Date(startDate) && submitAttempted ? 'End date must be after start date' : '')
      "
    />
  </div>
</div>

      </div>

      <!-- Error message -->
      <div v-if="error" class="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
        {{ error }}
      </div>
    <!-- Tab Navigation -->
    

    <!-- Search and Edit Button -->
   

    <!-- Main Table and Selected Preview -->
    <div class="grid md:grid-cols-3 gap-6">
      
      <!-- Left: Selectable List (2/3 width) -->
      <div class="md:col-span-2 bg-[#F6F7FA] rounded ">
        <div class="flex items-center p-4 justify-between ">
      <h3 class="text-md  text-[#75778B]">
        Provider Services and Drugs
      </h3>
      <div class="flex border rounded overflow-hidden">
        <button
          type="button"
          @click="activeTab = 'services'"
          :class="activeTab === 'services' ? activeTabStyle : tabStyle"
        >
          Services
        </button>
        <button
        type="button"
          @click="activeTab = 'drugs'"
          :class="activeTab === 'drugs' ? activeTabStyle : tabStyle"
        >
          Drugs
        </button>
      </div>
    </div>
    
        <div v-if="fetchPending" class="p-4 text-center">
          <Spinner class="animate-pulse">Loading {{ activeTab }}...</Spinner>
        </div>
        <template v-else>
          <div class=" p-3">
           <div class="relative bg-white p-4 rounded">
    <div class="w-full  bg-base-clr3 h-[3.5rem] focus-within:border-primary flex items-center rounded-lg overflow-hidden">
      <span
          class="w-10 h-full text-base-clr grid place-items-center"
          v-html="icons.search"
        />
        <input
          v-model="searchQuery"
        :placeholder="`Search and Select ${activeTab === 'services' ? 'Services' : 'Drugs'}`"
          class="flex-1 bg-transparent px-4 py-2 h-full outline-none"
        />
           </div>
   <div class="text-center mt-4 mx- bg-[#75778B]">
  <button
    class="text-sm text-white bg-[#75778B] py-2 rounded hover:underline"
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
          <table class="w-full bg-white table-auto text-sm">
            <thead>
  <tr class="text-left font-bold text-gray-600">
    <th class="p-3">
      <input
        type="checkbox"
        @change="toggleAllItems"
        :checked="areAllItemsSelected"
        class="h-4 w-4 text-[#02676B] focus:ring-[#02676B] border-gray-300 rounded"
      />
    </th>
    <th class="p-3">#</th>
    <th class="p-3 font-bold">{{ activeTab === 'services' ? 'Service' : 'Drug' }} Name</th>
    <th class="p-3 font-bold">Description</th>
    <th class="p-3 font-bold">Provider Price</th>
    <th class="p-3 font-bold">
      <div class="flex items-center gap-2">
        <span>Your Price</span>
        <div v-if="isNegotiating" class="flex items-center gap-1 text-xs">
          <input
            v-model.number="discountPercentage"
            type="number"
            min="0"
            max="100"
            class="w-12 p-2 rounded bg-[#F9F9FD]"
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
  class="border-b hover:bg-gray-50"
>
    <td class="p-3">
      <input
        type="checkbox"
        :checked="selectedItems.some(sel => sel.id === item.id)"
        @change="
          selectedItems.some(sel => sel.id === item.id)
            ? selectedItems = selectedItems.filter(sel => sel.id !== item.id)
            : selectedItems.push(item)
        "
        class="h-4 w-4 text-[#02676B] focus:ring-[#02676B] border-gray-300 rounded"
      />
    </td>
    <td class="p-3">{{ index + 1 }}</td>
    <td class="p-3">{{ item.name }}</td>
    <td class="p-3">{{ item.description }}</td>
    <td class="p-3">ETB {{ item.providerPrice.toLocaleString() }}</td>
    <td class="p-3">
  <input
    v-if="isNegotiating"
    v-model.number="item.userPrice"
    type="number"
    min="0"
    step="0.01"
    class="w-24 p-2 rounded bg-[#F9F9FD]"
    @input="updateItemPrice(item)"
  />
  <span v-else>ETB {{ item.userPrice.toLocaleString() }}</span>
</td>
  </tr>
</tbody>
          </table>
          </div>
          <!-- Pagination -->
          <div class="flex justify-between items-center p-3 text-sm border-t">
           <div>
  Showing
  <select
    v-model="rowsPerPage"
    class="border rounded px-2 py-1 mx-1"
    @change="currentPage = 1"
  >
    <option v-for="n in [5, 10, 20]" :key="n" :value="n">{{ n }}</option>
  </select>
  <span>Showing {{ (currentPage - 1) * rowsPerPage + 1 }} to {{ Math.min(currentPage * rowsPerPage, filteredItems.length) }} out of {{ filteredItems.length }} records</span>
</div>
            <div class="flex items-center gap-1">
              <button
                @click="prevPage"
                :disabled="currentPage === 1"
                class="px-3 py-1 border rounded"
              >
                &lt;
              </button>
              <span v-for="n in totalPages" :key="n">
                <button
                  :class="[
                    'px-3 py-1 border rounded',
                    currentPage === n ? 'bg-[#75778B] text-white' : 'hover:bg-gray-100'
                  ]"
                  @click="currentPage = n"
                >
                  {{ n }}
                </button>
              </span>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 border rounded"
              >
                &gt;
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Right: Selected Items (1/3 width) -->
   <div class="bg-[#DFF1F1] h-auto p-4 rounded-md">
  <div class="flex justify-between">
    <h3 class="text-[#02676B] text-base mb-3">
      Selected Services / Drugs
    </h3>
    <div class="flex mb-4">
      <button
      type="button"
        @click="selectedTab = 'services'"
        :class="[
          'px-4 py-2 rounded text-sm',
          selectedTab === 'services'
            ? 'bg-[#02676B] text-white'
            : 'text-[#02676B]'
        ]"
      >
        Services
      </button>
      <button
        type="button"
        @click="selectedTab = 'drugs'"
        :class="[
          'px-4 py-2 rounded text-sm',
          selectedTab === 'drugs'
            ? 'bg-[#02676B] text-white'
            : 'text-[#02676B]'
        ]"
      >
        Drugs
      </button>
    </div>
  </div>
  
  <table class="text-sm w-full bg-white rounded-md">
    <thead>
      <tr class="border-b">
        <th class="text-left p-2">#</th>
        <th class="text-left p-2">Name</th>
        <th class="text-left p-2">Price</th>
        <th class="text-left p-2">Action</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(item, idx) in paginatedSelectedItems"
        :key="item.id"
        class="border-b"
      >
        <td class="p-2">{{ idx + 1 + (selectedItemsPage - 1) * selectedItemsPerPage }}</td>
        <td class="p-2">{{ item.name }}</td>
        <td class="p-2">ETB {{ item.userPrice.toLocaleString() }}</td>
        <td class="p-2">
          <button 
            @click="removeItem(item.id)"
            class="remove-btn"
          >
           <i v-html="icons.trash" class="text-red-500 text-center items-center"></i> 
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

  <!-- Selected Items Pagination -->
  <div class="flex justify-between items-center mt-3 text-sm">
    <div>
      <span>Showing {{ (selectedItemsPage - 1) * selectedItemsPerPage + 1 }} to {{ Math.min(selectedItemsPage * selectedItemsPerPage, selectedItems.filter(item => selectedTab === 'services' ? 'serviceUuid' in item : 'drugUuid' in item).length) }} of {{ selectedItems.filter(item => selectedTab === 'services' ? 'serviceUuid' in item : 'drugUuid' in item).length }}</span>
    </div>
    <div class="flex items-center gap-1">
      <button
        @click="selectedItemsPage = Math.max(1, selectedItemsPage - 1)"
        :disabled="selectedItemsPage === 1"
        class="px-3 py-1 border rounded"
      >
        &lt;
      </button>
      <span v-for="n in selectedItemsTotalPages" :key="n">
        <button
          :class="[
            'px-3 py-1 border rounded',
            selectedItemsPage === n ? 'bg-[#75778B] text-white' : 'hover:bg-gray-100'
          ]"
          @click="selectedItemsPage = n"
        >
          {{ n }}
        </button>
      </span>
      <button
        @click="selectedItemsPage = Math.min(selectedItemsTotalPages, selectedItemsPage + 1)"
        :disabled="selectedItemsPage === selectedItemsTotalPages"
        class="px-3 py-1 border rounded"
      >
        &gt;
      </button>
    </div>
  </div>
</div>
    </div>

    <!-- Submit Button -->
         <div class="text-right">
      <button
        type="submit"
        :disabled="submitting"
       class="bg-primary text-white px-6 py-3 rounded hover:bg-[#146C5C] transition"
        :class="{ 'opacity-75 cursor-not-allowed': submitting }"
      >
        <ButtonSpinner v-if="submitting" class="h-5 w-5 text-white" />
        {{ submitting ? 'Submitting...' : 'Submit Contract' }}
      </button>
    </div>

    </div>
  </Form>
</template>

<style scoped>
.required-field {
  @apply border-l-2 border-[#02676B];
}

.error-field {
  @apply border-red-500;
}

.error-message {
  @apply text-red-500 text-xs mt-1;
}
input[type="checkbox"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  outline: none;
  cursor: pointer;
  position: relative;
}

input[type="checkbox"]:checked {
  background-color: #02676B;
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
  box-shadow: 0 0 0 2px rgba(2, 103, 107, 0.2);
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

/* input[type="date"], input[type="text"], select {
  @apply border-gray-300 focus:border-[#02676B] focus:ring-[#02676B] rounded-md shadow-sm;
} */

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
  @apply py-4 whitespace-nowrap;
}

/* Style for remove button */
.remove-btn {
  @apply text-[#02676B] hover:text-[#02494D] hover:underline;
}
</style>