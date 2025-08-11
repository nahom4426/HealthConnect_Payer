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
  serviceDescription: '',
  servicePrice: '',
  drugType: '',
  drugCode: '',
  drugName: '',
  drugDescription: '',
  drugPrice: ''
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

const currentDescription = computed({
  get: () => props.activeTab === 'services' ? searchForm.value.serviceDescription : searchForm.value.drugDescription,
  set: (value) => {
    if (props.activeTab === 'services') {
      searchForm.value.serviceDescription = value;
    } else {
      searchForm.value.drugDescription = value;
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
    serviceDescription: '',
    servicePrice: '',
    drugType: '',
    drugCode: '',
    drugName: '',
    drugDescription: '',
    drugPrice: ''
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
        description: item.description || ''
      } : {
        drugUuid: item.drugUuid,
        drugName: item.drugName,
        drugCode: item.drugCode,
        description: item.description || ''
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
    searchForm.value.serviceDescription = item.description || '';
    searchForm.value.servicePrice = item.price || '';
  } else {
    searchForm.value.drugCode = item.drugCode || '';
    searchForm.value.drugName = item.drugName || '';
    searchForm.value.drugDescription = item.description || '';
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
    description: searchForm.value.serviceDescription,
    price: parseFloat(searchForm.value.servicePrice) || 0,
    paymentAmount: `ETB ${parseFloat(searchForm.value.servicePrice || 0).toFixed(2)}`,
    quantity: 1,
    remark: ''
  } : {
    id: `temp-${Date.now()}`,
    contractDetailUuid: `temp-${Date.now()}`,
    itemType: 'DRUG',
    drugCode: searchForm.value.drugCode,
    drugName: searchForm.value.drugName,
    description: searchForm.value.drugDescription,
    price: parseFloat(searchForm.value.drugPrice) || 0,
    paymentAmount: `ETB ${parseFloat(searchForm.value.drugPrice || 0).toFixed(2)}`,
    quantity: 1,
    totalCost: parseFloat(searchForm.value.drugPrice) || 0,
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
  <div class="space-y-8">
    <!-- Tab Navigation -->
    <div class="flex justify-center">
      <div class="flex bg-gray-100 p-1 rounded-full shadow-sm">
        <button
          type="button"
          @click="changeTab('services')"
          :class="[
            'px-8 py-3 text-sm font-medium rounded-full transition-all duration-300',
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
            'px-8 py-3 text-sm font-medium rounded-full transition-all duration-300',
            activeTab === 'drugs'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-200'
          ]"
        >
          Drugs
        </button>
      </div>
    </div>

    <!-- Search Form -->
    <div class="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <div class="mb-8">
        <h3 class="text-2xl font-bold text-gray-800 mb-2">
          Add {{ activeTab === 'services' ? 'Service' : 'Drug' }}
        </h3>
        <p class="text-gray-500">Search and add {{ activeTab }} to your request</p>
      </div>

      <!-- Single Row Form -->
      <div class="grid grid-cols-6 gap-6 items-end">
        <!-- Type Selection -->
        <div class="space-y-3">
          <label class="block text-sm font-semibold text-gray-700">
            Type
          </label>
          <div class="relative">
            <select 
              v-model="currentType" 
              class="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-gray-700 font-medium"
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
        </div>

        <!-- Service/Drug Code -->
        <div class="space-y-3">
          <label class="block text-sm font-semibold text-gray-700">
            {{ activeTab === 'services' ? 'Service Code' : 'Drug Code' }}
          </label>
          <div class="relative">
            <MagnifyingGlassIcon
              class="absolute left-4 top-4 h-5 w-5 text-teal-500"
            />
            <input
              v-model="currentCode"
              :placeholder="`Enter ${activeTab === 'services' ? 'service' : 'drug'} code`"
              class="w-full px-4 py-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-gray-700 font-medium placeholder-gray-400"
            />
          </div>
        </div>

        <!-- Service/Drug Name -->
        <div class="space-y-3">
          <label class="block text-sm font-semibold text-gray-700">
            {{ activeTab === 'services' ? 'Service Name' : 'Drug Name' }}
          </label>
          <div class="relative">
            <ClipboardDocumentListIcon
              class="absolute left-4 top-4 h-5 w-5 text-teal-500"
            />
            <input
              v-model="currentName"
              :placeholder="`Enter ${activeTab === 'services' ? 'service' : 'drug'} name`"
              class="w-full px-4 py-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-gray-700 font-medium placeholder-gray-400"
            />
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-3">
          <label class="block text-sm font-semibold text-gray-700">
            Description
          </label>
          <div class="relative">
            <InformationCircleIcon
              class="absolute left-4 top-4 h-5 w-5 text-gray-400"
            />
            <input
              v-model="currentDescription"
              readonly
              placeholder="Auto-filled"
              class="w-full px-4 py-4 pl-12 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-600 font-medium placeholder-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <!-- Price -->
        <div class="space-y-3">
          <label class="block text-sm font-semibold text-gray-700">
            Price (ETB)
          </label>
          <div class="relative">
            <BanknotesIcon
              class="absolute left-4 top-4 h-5 w-5 text-gray-400"
            />
            <input
              v-model="currentPrice"
              readonly
              placeholder="Auto-filled"
              class="w-full px-4 py-4 pl-12 bg-gray-100 border-2 border-gray-200 rounded-xl text-gray-600 font-medium placeholder-gray-400 cursor-not-allowed"
            />
          </div>
        </div>

        <!-- Add Button -->
        <div class="space-y-3">
          <label class="block text-sm font-semibold text-transparent">
            Action
          </label>
          <button
            @click="handleAddFromForm"
            :disabled="!canAddItem()"
            :class="[
              'w-full px-6 py-4 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 transform',
              canAddItem()
                ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            ]"
          >
            Add {{ activeTab === 'services' ? 'Service' : 'Drug' }}
          </button>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div
        v-if="pending"
        class="flex items-center justify-center mt-8 p-4 bg-teal-50 rounded-xl border border-teal-200"
      >
        <Spinner class="h-6 w-6 text-teal-600" />
        <span class="ml-3 text-teal-700 font-medium">Searching for {{ activeTab }}...</span>
      </div>
    </div>

    <!-- Results Table -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div class="p-8 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">
              Added {{ activeTab === 'services' ? 'Services' : 'Drugs' }}
            </h2>
            <p class="text-gray-500 mt-1">
              {{ displayedItems.length }} {{ displayedItems.length === 1 ? 'item' : 'items' }} selected
            </p>
          </div>
          <div class="bg-teal-100 text-teal-800 px-4 py-2 rounded-full font-semibold text-sm">
            {{ activeTab === 'services' ? 'Services' : 'Drugs' }} List
          </div>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">#</th>
              <th class="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Code</th>
              <th class="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
              <th class="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Price</th>
              <th v-if="activeTab === 'services'" class="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Remark</th>
              <th v-if="activeTab === 'drugs'" class="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Dosage</th>
              <th v-if="activeTab === 'drugs'" class="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Quantity</th>
              <th v-if="activeTab === 'drugs'" class="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total Cost</th>
              <th class="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr
              v-for="(item, index) in displayedItems"
              :key="item.contractDetailUuid"
              class="hover:bg-gray-50 transition-colors duration-200"
            >
              <td class="px-8 py-6 text-sm font-semibold text-gray-600">{{ index + 1 }}</td>
              <td class="px-8 py-6 text-sm font-bold text-gray-900">
                {{ item.serviceCode || item.drugCode }}
              </td>
              <td class="px-8 py-6 text-sm text-gray-700 font-medium">
                {{ item.serviceName || item.drugName }}
              </td>
              <td class="px-8 py-6">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                  {{ item.paymentAmount }}
                </span>
              </td>

              <!-- Services -->
              <td v-if="activeTab === 'services'" class="px-8 py-6">
                <input
                  type="text"
                  :value="localRemarks[item.contractDetailUuid]"
                  @input="handleUpdateRemark(index, item.contractDetailUuid, $event.target.value)"
                  class="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  placeholder="Add remark..."
                />
              </td>

              <!-- Drugs -->
              <template v-if="activeTab === 'drugs'">
                <td class="px-8 py-6 text-sm font-medium text-gray-700">{{ item.dose }}</td>
                <td class="px-8 py-6">
                  <input
                    type="number"
                    min="1"
                    :value="item.quantity"
                    @input="handleUpdateItem(index, 'quantity', $event.target.value)"
                    class="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-center font-semibold"
                  />
                </td>
                <td class="px-8 py-6">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                    ETB {{ item.totalCost?.toFixed(2) || '0.00' }}
                  </span>
                </td>
              </template>

              <td class="px-8 py-6">
                <button
                  @click="handleRemoveItem(index)"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Remove
                </button>
              </td>
            </tr>
            <tr v-if="displayedItems.length === 0">
              <td
                :colspan="activeTab === 'services' ? 5 : 8"
                class="px-8 py-12 text-center"
              >
                <div class="flex flex-col items-center justify-center space-y-3">
                  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <ClipboardDocumentListIcon class="w-8 h-8 text-gray-400" />
                  </div>
                  <p class="text-gray-500 font-medium">No {{ activeTab }} added yet</p>
                  <p class="text-gray-400 text-sm">Start by searching and adding {{ activeTab }} above</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Diagnosis Section (only for services) -->
    <div v-if="activeTab === 'services' && displayedItems.length > 0" class="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <h3 class="text-xl font-bold text-gray-800 mb-6">Diagnosis Information</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-3">
          <label class="block text-sm font-semibold text-gray-700">Primary Diagnosis</label>
          <input
            v-model="localPrimaryDiagnosis"
            class="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-gray-700 font-medium"
            placeholder="Enter primary diagnosis"
          />
        </div>
        <div class="space-y-3">
          <label class="block text-sm font-semibold text-gray-700">Secondary Diagnosis</label>
          <input
            v-model="localSecondaryDiagnosis"
            class="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-gray-700 font-medium"
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

.space-y-8 > * {
  animation: fadeIn 0.5s ease-out;
}

/* Hover effects */
input:hover:not(:focus):not([readonly]) {
  @apply border-gray-300 shadow-sm;
}

select:hover:not(:focus) {
  @apply border-gray-300 shadow-sm;
}

/* Focus states */
input:focus, select:focus {
  @apply ring-2 ring-teal-500 border-teal-500 shadow-lg;
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
  transition: all 0.2s ease;
}

tbody tr:hover {
  transform: translateX(4px);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .grid-cols-6 {
    @apply grid-cols-3 gap-4;
  }
}

@media (max-width: 768px) {
  .grid-cols-6 {
    @apply grid-cols-1 gap-4;
  }
  
  .px-8 {
    @apply px-4;
  }
  
  .py-6 {
    @apply py-4;
  }
}
</style>
