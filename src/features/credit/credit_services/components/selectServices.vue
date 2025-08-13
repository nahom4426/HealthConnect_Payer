<script setup>
import { ref, computed, watch } from 'vue';
import Spinner from '@/components/Spinner.vue';
import icons from "@/utils/icons";
import { MagnifyingGlassIcon, ClipboardDocumentListIcon, InformationCircleIcon, BanknotesIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  activeTab: {
    type: String,
    required: true,
    validator: (value) => ['services', 'drugs'].includes(value)
  },
  searchQuery: String,
  pending: Boolean,
  addedItems: {
    type: Array,
    default: () => []
  },
  primaryDiagnosis: String,
  secondaryDiagnosis: String,
  remarks: {
    type: Object,
    default: () => ({})
  },
  insuredUuid: String,
  contractHeaderUuid: String
});

const emit = defineEmits([
  'update:activeTab',
  'update:searchQuery',
  'add-item',
  'remove-item',
  'update-item',
  'search-items',
  'update:primaryDiagnosis',
  'update:secondaryDiagnosis',
  'update:remarks'
]);

// Search form fields
const searchForm = ref({
  serviceType: '',
  serviceCode: '',
  serviceName: '',
  servicePrice: '',
  serviceQuantity: 1,
  drugType: '',
  drugCode: '',
  drugName: '',
  drugPrice: '',
  drugQuantity: 1
});

// Computed properties for v-model
const currentType = computed({
  get: () => props.activeTab === 'services' ? searchForm.value.serviceType : searchForm.value.drugType,
  set: (value) => {
    if (props.activeTab === 'services') {
      searchForm.value.serviceType = value;
    } else {
      searchForm.value.drugType = value;
    }
  }
});

const currentCode = computed({
  get: () => props.activeTab === 'services' ? searchForm.value.serviceCode : searchForm.value.drugCode,
  set: (value) => {
    if (props.activeTab === 'services') {
      searchForm.value.serviceCode = value;
    } else {
      searchForm.value.drugCode = value;
    }
  }
});

const currentName = computed({
  get: () => props.activeTab === 'services' ? searchForm.value.serviceName : searchForm.value.drugName,
  set: (value) => {
    if (props.activeTab === 'services') {
      searchForm.value.serviceName = value;
    } else {
      searchForm.value.drugName = value;
    }
  }
});

const currentPrice = computed({
  get: () => props.activeTab === 'services' ? searchForm.value.servicePrice : searchForm.value.drugPrice,
  set: (value) => {
    if (props.activeTab === 'services') {
      searchForm.value.servicePrice = value;
    } else {
      searchForm.value.drugPrice = value;
    }
  }
});

const currentQuantity = computed({
  get: () => props.activeTab === 'services' ? searchForm.value.serviceQuantity : searchForm.value.drugQuantity,
  set: (value) => {
    if (props.activeTab === 'services') {
      searchForm.value.serviceQuantity = value;
    } else {
      searchForm.value.drugQuantity = value;
    }
  }
});
const currentFsNumber = computed({
  get: () => props.activeTab === 'services' ? searchForm.value.serviceFsNumber : searchForm.value.drugFsNumber,
  set: (value) => {
    if (props.activeTab === 'services') {
      searchForm.value.serviceFsNumber = value;
    } else {
      searchForm.value.drugFsNumber = value;
    }
  }
});

const localPrimaryDiagnosis = ref(props.primaryDiagnosis);
const localSecondaryDiagnosis = ref(props.secondaryDiagnosis);
const localRemarks = ref(props.remarks || {});
const searchResults = ref([]);

// Service type options
const serviceTypeOptions = [
  { value: 'inpatient', label: 'Inpatient' },
  { value: 'outpatient', label: 'Outpatient' },
  { value: 'dental', label: 'Dental' }
];

// Drug type options
const drugTypeOptions = [
  { value: 'tablet', label: 'Tablet' },
  { value: 'capsule', label: 'Capsule' },
  { value: 'injection', label: 'Injection' },
  { value: 'syrup', label: 'Syrup' }
];

function changeTab(tab) {
  emit('update:activeTab', tab);
  resetSearchForm();
}

function resetSearchForm() {
  searchForm.value = {
    serviceType: '',
    serviceCode: '',
    serviceName: '',
    servicePrice: '',
    serviceQuantity: 1,
    drugType: '',
    drugCode: '',
    drugName: '',
    drugPrice: '',
    drugQuantity: 1
  };
  searchResults.value = [];
}

// Watch for code search
watch(() => searchForm.value.serviceCode, (newCode) => {
  if (newCode && props.activeTab === 'services') {
    searchByCode('services', newCode);
  }
});

watch(() => searchForm.value.drugCode, (newCode) => {
  if (newCode && props.activeTab === 'drugs') {
    searchByCode('drugs', newCode);
  }
});

// Watch for name search
watch(() => searchForm.value.serviceName, (newName) => {
  if (newName && props.activeTab === 'services') {
    searchByName('services', newName);
  }
});

watch(() => searchForm.value.drugName, (newName) => {
  if (newName && props.activeTab === 'drugs') {
    searchByName('drugs', newName);
  }
});

function searchByCode(type, code) {
  if (code.length > 2) {
    emit('search-items', {
      type,
      query: code,
      searchType: 'code',
      insuredUuid: props.insuredUuid,
      contractHeaderUuid: props.contractHeaderUuid
    });
  }
}

function searchByName(type, name) {
  if (name.length > 2) {
    emit('search-items', {
      type,
      query: name,
      searchType: 'name',
      insuredUuid: props.insuredUuid,
      contractHeaderUuid: props.contractHeaderUuid
    });
  }
}

function setSearchResults(items) {
  if (!items || items.length === 0) {
    searchResults.value = [];
    return;
  }

  searchResults.value = items.map(item => {
    const isService = item.serviceUuid !== null && item.serviceUuid !== undefined;
    const isDrug = item.drugUuid !== null && item.drugUuid !== undefined;

    return {
      id: item.contractDetailUuid,
      contractDetailUuid: item.contractDetailUuid,
      price: item.negotiatedPrice || 0,
      paymentAmount: `ETB ${(item.negotiatedPrice || 0).toFixed(2)}`,
      status: item.status || 'UNKNOWN',
      itemType: isService ? 'SERVICE' : 'DRUG',
      ...(isService ? {
        serviceUuid: item.serviceUuid,
        serviceName: item.serviceName,
        serviceCode: item.serviceCode,
      } : {
        drugUuid: item.drugUuid,
        drugName: item.drugName,
        drugCode: item.drugCode,
      })
    };
  });

  // Auto-fill form if single result
  if (searchResults.value.length === 1) {
    fillFormFromResult(searchResults.value[0]);
  }
}

function fillFormFromResult(item) {
  if (props.activeTab === 'services') {
    searchForm.value.serviceCode = item.serviceCode || '';
    searchForm.value.serviceName = item.serviceName || '';
    searchForm.value.servicePrice = item.price || '';
  } else {
    searchForm.value.drugCode = item.drugCode || '';
    searchForm.value.drugName = item.drugName || '';
    searchForm.value.drugPrice = item.price || '';
  }
}

function canAddItem() {
  if (props.activeTab === 'services') {
    return searchForm.value.serviceCode && 
           searchForm.value.serviceName && 
           searchForm.value.servicePrice;
  } else {
    return searchForm.value.drugCode && 
           searchForm.value.drugName && 
           searchForm.value.drugPrice;
  }
}

function handleAddFromForm() {
  if (!canAddItem()) return;

  const newItem = props.activeTab === 'services' ? {
    id: `temp-${Date.now()}`,
    contractDetailUuid: `temp-${Date.now()}`,
    itemType: 'SERVICE',
    serviceCode: searchForm.value.serviceCode,
    serviceName: searchForm.value.serviceName,
    price: parseFloat(searchForm.value.servicePrice) || 0,
    paymentAmount: `ETB ${(parseFloat(searchForm.value.servicePrice) * parseInt(searchForm.value.serviceQuantity) || 0).toFixed(2)}`,
    quantity: parseInt(searchForm.value.serviceQuantity) || 1,
    totalCost: (parseFloat(searchForm.value.servicePrice) * parseInt(searchForm.value.serviceQuantity) || 0),
    remark: ''
  } : {
    id: `temp-${Date.now()}`,
    contractDetailUuid: `temp-${Date.now()}`,
    itemType: 'DRUG',
    drugCode: searchForm.value.drugCode,
    drugName: searchForm.value.drugName,
    price: parseFloat(searchForm.value.drugPrice) || 0,
    paymentAmount: `ETB ${(parseFloat(searchForm.value.drugPrice) * parseInt(searchForm.value.drugQuantity) || 0).toFixed(2)}`,
    quantity: parseInt(searchForm.value.drugQuantity) || 1,
    totalCost: (parseFloat(searchForm.value.drugPrice) * parseInt(searchForm.value.drugQuantity) || 0),
    route: 'oral',
    frequency: 'daily',
    dose: '1',
    duration: '7 days'
  };

  emit('add-item', newItem);
  resetSearchForm();
}

function handleUpdateRemark(index, itemId, value) {
  localRemarks.value = {
    ...localRemarks.value,
    [itemId]: value
  };
  emit('update:remarks', localRemarks.value);
}

function handleRemoveItem(index) {
  emit('remove-item', index);
}

function handleUpdateItem(index, field, value) {
  const currentItem = { ...props.addedItems[index] };
  const updatedItem = { [field]: value };

  if (field === 'quantity' && 'price' in currentItem) {
    const quantity = Number(value) || 0;
    updatedItem.totalCost = currentItem.price * quantity;
    updatedItem.paymentAmount = `ETB ${(currentItem.price * quantity).toFixed(2)}`;
  }

  const fullUpdate = { ...currentItem, ...updatedItem };
  
  emit('update-item', { 
    index, 
    item: fullUpdate
  });
}

const displayedItems = computed(() => {
  return props.addedItems.filter(item => 
    props.activeTab === 'services' ? item.itemType === 'SERVICE' : item.itemType === 'DRUG'
  );
});

watch(localPrimaryDiagnosis, (newValue) => {
  emit('update:primaryDiagnosis', newValue);
});

watch(localSecondaryDiagnosis, (newValue) => {
  emit('update:secondaryDiagnosis', newValue);
});

defineExpose({ setSearchResults });
</script>

<template>
  <div class="space-y-6">
    <!-- Search Form -->
    <div class="bg-white p-6 rounded-xl shadow border border-gray-100">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <!-- Tab Navigation -->
        <div class="flex bg-gray-100 p-1 rounded-lg shadow-sm">
          <button
            type="button"
            @click="changeTab('services')"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300',
              activeTab === 'services'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            ]"
          >
            Services
          </button>
          <button
            type="button"
            @click="changeTab('drugs')"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300',
              activeTab === 'drugs'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            ]"
          >
            Drugs
          </button>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold text-gray-800">
            Add {{ activeTab === 'services' ? 'Service' : 'Drug' }}
          </h3>
        </div>
      </div>

      <!-- Single Row Form -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 px-4 gap-4 items-end">
        <!-- Type Selection -->
        <div class="space-y-1 mx-6">
          <label class="block text-xs font-medium text-gray-700">
            Type
          </label>
          <select 
            v-model="currentType" 
            class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-gray-700"
          >
            <option value="">Select type</option>
            <option
              v-for="option in (activeTab === 'services' ? serviceTypeOptions : drugTypeOptions)"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- Service/Drug Code -->
        <div class="space-y-1 mx-6 ">
          <label class="block text-xs font-medium text-gray-700">
            {{ activeTab === 'services' ? 'Service Code' : 'Drug Code' }}
          </label>
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-3 h-4 w-4 text-teal-500" />
            <input
              v-model="currentCode"
              :placeholder="`Enter ${activeTab === 'services' ? 'service' : 'drug'} code`"
              class="w-full px-3 py-2 pl-9 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        <!-- Service/Drug Name -->
        <div class="space-y-1 mx-6">
          <label class="block text-xs font-medium text-gray-700">
            {{ activeTab === 'services' ? 'Service Name' : 'Drug Name' }}
          </label>
          <div class="relative">
            <ClipboardDocumentListIcon class="absolute left-3 top-3 h-4 w-4 text-teal-500" />
            <input
              v-model="currentName"
              :placeholder="`Enter ${activeTab === 'services' ? 'service' : 'drug'} name`"
              class="w-full px-3 py-2 pl-9 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>
 <div class="space-y-1 mx-6">
          <label class="block text-xs font-medium text-gray-700">
            Quantity
          </label>
          <input
            v-model="currentQuantity"
            type="number"
            min="1"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-gray-700"
          />
        </div>
        <!-- Price -->
        <div class="space-y-1 mx-6">
          <label class="block text-xs font-medium text-gray-700">
            Unit Price (ETB)
          </label>
          <div class="relative">
            <BanknotesIcon class="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              v-model="currentPrice"
              readonly
              placeholder="Auto-filled"
              class="w-full px-3 py-2 pl-9 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 placeholder-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <!-- Quantity -->
        <div class="space-y-1 mx-6">
          <label class="block text-xs font-medium text-gray-700">
           Fs Number
          </label>
          <input
            v-model="currentFsNumber"
            type="text"
            placeholder="Enter FS Number"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm text-gray-700"
          />
        </div>

        <!-- Add Button -->
        <div class="md:col-span-5">
          <button
            @click="handleAddFromForm"
            :disabled="!canAddItem()"
            :class="[
              'w-full px-4 py-2 rounded-lg font-medium text-sm shadow transition-all duration-300',
              canAddItem()
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            ]"
          >
            Add {{ activeTab === 'services' ? 'Service' : 'Drug' }}
          </button>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div
        v-if="pending"
        class="flex items-center justify-center mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200"
      >
        <Spinner class="h-5 w-5 text-teal-600" />
        <span class="ml-2 text-teal-700 text-sm">Searching for {{ activeTab }}...</span>
      </div>
    </div>

    <!-- Results Table -->
    <div class="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-800">
              Added {{ activeTab === 'services' ? 'Services' : 'Drugs' }}
            </h2>
            <p class="text-gray-500 text-xs mt-1">
              {{ displayedItems.length }} {{ displayedItems.length === 1 ? 'item' : 'items' }} selected
            </p>
          </div>
          <div class="bg-teal-100 text-teal-800 px-3 py-1 rounded-full font-medium text-xs">
            {{ activeTab === 'services' ? 'Services' : 'Drugs' }} List
          </div>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">#</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Code</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Unit Price</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Quantity</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Total Price</th>
              <th v-if="activeTab === 'services'" class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Remark</th>
              <th v-if="activeTab === 'drugs'" class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Dosage</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Action</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr
              v-for="(item, index) in displayedItems"
              :key="item.contractDetailUuid"
              class="hover:bg-gray-50"
            >
              <td class="px-4 py-3 text-sm font-medium text-gray-600">{{ index + 1 }}</td>
              <td class="px-4 py-3 text-sm font-medium text-gray-900">
                {{ item.serviceCode || item.drugCode }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-700">
                {{ item.serviceName || item.drugName }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-700">
                ETB {{ item.price?.toFixed(2) || '0.00' }}
              </td>
              <td class="px-4 py-3">
                <input
                  type="number"
                  min="1"
                  :value="item.quantity"
                  @input="handleUpdateItem(index, 'quantity', $event.target.value)"
                  class="w-16 px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm text-center font-medium"
                />
              </td>
              <td class="px-4 py-3 text-sm font-medium text-gray-700">
                ETB {{ item.totalCost?.toFixed(2) || '0.00' }}
              </td>

              <!-- Services -->
              <td v-if="activeTab === 'services'" class="px-4 py-3">
                <input
                  type="text"
                  :value="localRemarks[item.contractDetailUuid]"
                  @input="handleUpdateRemark(index, item.contractDetailUuid, $event.target.value)"
                  class="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  placeholder="Add remark..."
                />
              </td>

              <!-- Drugs -->
              <td v-if="activeTab === 'drugs'" class="px-4 py-3 text-sm text-gray-700">
                {{ item.dose }}
              </td>

              <td class="px-4 py-3">
                <button
                  @click="handleRemoveItem(index)"
                  class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  Remove
                </button>
              </td>
            </tr>
            <tr v-if="displayedItems.length === 0">
              <td
                :colspan="activeTab === 'services' ? 8 : 9"
                class="px-4 py-8 text-center"
              >
                <div class="flex flex-col items-center justify-center space-y-2">
                  <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <ClipboardDocumentListIcon class="w-5 h-5 text-gray-400" />
                  </div>
                  <p class="text-gray-500 text-sm">No {{ activeTab }} added yet</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Diagnosis Section (only for services) -->
    <div v-if="activeTab === 'services' && displayedItems.length > 0" class="bg-white p-6 rounded-xl shadow border border-gray-100">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Diagnosis Information</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="block text-xs font-medium text-gray-700">Primary Diagnosis</label>
          <input
            v-model="localPrimaryDiagnosis"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm text-gray-700"
            placeholder="Enter primary diagnosis"
          />
        </div>
        <div class="space-y-1">
          <label class="block text-xs font-medium text-gray-700">Secondary Diagnosis</label>
          <input
            v-model="localSecondaryDiagnosis"
            class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm text-gray-700"
            placeholder="Enter secondary diagnosis"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.space-y-6 > * {
  animation: fadeIn 0.3s ease-out;
}

/* Hover effects */
input:hover:not(:focus):not([readonly]) {
  @apply border-gray-300;
}

select:hover:not(:focus) {
  @apply border-gray-300;
}

/* Focus states */
input:focus, select:focus {
  @apply ring-1 ring-teal-500 border-teal-500;
}

/* Button hover effects */
button:not(:disabled):hover {
  transform: translateY(-1px);
}

button:not(:disabled):active {
  transform: translateY(0);
}

/* Table row animations */
tbody tr {
  transition: all 0.1s ease;
}

tbody tr:hover {
  @apply bg-gray-50;
}
</style>