<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import Spinner from '@/components/Spinner.vue';
import Select from '@/components/new_form_elements/Select.vue';
import { MagnifyingGlassIcon, ClipboardDocumentListIcon, InformationCircleIcon, BanknotesIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  activeTab: {
    type: String,
    required: true,
    validator: (value) => ['services', 'drugs'].includes(value)
  },
  pending: Boolean,
  fetchPending: Boolean,
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
  contractHeaderUuid: String,
  selectedCategory: String,
  selectedPackage: String,
  isInsurance: {
    type: Boolean,
    default: false
  },
  availablePackages: {
    type: Array,
    default: () => []
  },
  availableCategories: {
    type: Array,
    default: () => []
  },
  searchResults: {
    type: [Array, Object],
    default: () => []
  }
});
const isMaxQuantity = computed(() => {
  return parseInt(currentQuantity.value) >= 5;
});
function handleBlur() {
  nextTick(() => {
    showDropdown.value = false;
  });
}
const emit = defineEmits([
  'update:activeTab',
  'add-item',
  'remove-item',
  'update-item',
  'search-items',
  'update:primaryDiagnosis',
  'update:secondaryDiagnosis',
  'update:remarks',
  'update:selectedPackage',
  'update:selectedCategory',
  'add-service',
  'add-drug'
]);

// Search form fields
const searchForm = ref({
  serviceCode: '',
  serviceName: '',
  servicePrice: '',
  serviceQuantity: 1,
  drugCode: '',
  drugName: '',
  drugPrice: '',
  drugQuantity: 1
});

// Local state - replace showDropdown with separate dropdowns
const localSelectedPackage = ref(props.selectedPackage || '');
const localSelectedCategory = ref(props.selectedCategory || '');
const showCodeDropdown = ref(false);
const showNameDropdown = ref(false);
const localPrimaryDiagnosis = ref(props.primaryDiagnosis);
const localSecondaryDiagnosis = ref(props.secondaryDiagnosis);
const localRemarks = ref(props.remarks || {});

// Handle blur events for separate dropdowns
function handleCodeBlur() {
  nextTick(() => {
    showCodeDropdown.value = false;
  });
}

function handleNameBlur() {
  nextTick(() => {
    showNameDropdown.value = false;
  });
}

// Add these reactive variables for search results
const searchResults = ref([]);
const availablePackages = ref(props.availablePackages || []);
const availableCategories = ref(props.availableCategories || []);

// Function to set search results
function setSearchResults(results, packageResponse = null) {
  console.log('setSearchResults called with:', { results, packageResponse });

  if (packageResponse) {
    searchResults.value = packageResponse;
  } else {
    searchResults.value = results || [];
  }
}

function setAvailablePackages(packages) {
  console.log('setAvailablePackages called with:', packages);
  availablePackages.value = packages || [];
}

function setAvailableCategories(categories) {
  console.log('setAvailableCategories called with:', categories);
  availableCategories.value = categories || [];
}

// Expose these methods to parent component
defineExpose({
  setSearchResults,
  setAvailablePackages,
  setAvailableCategories
});

// Update processedSearchResults to include iligiblSServiceUuid doo inrurance insurance
const processedSearchResults = computed(() => {
  console.log('processedSearchResults computed with:', searchResults.value);
  
  if (!searchResults.value) return [];
  
  // Handle insurance package response
  if (props.isInsurance && searchResults.value.packageEligibleServices) {
    return searchResults.value.packageEligibleServices.map(service => ({
      id: service.serviceId,
      serviceId: service.serviceId, // For insurance claims
      eligibleServiceUuid: service.eligibleServiceUuid, // This will be used as contractDetailUuid
      serviceName: service.item,
      serviceCode: service.itemCode,
      price: service.price,
      paymentAmount: `ETB ${service.price.toFixed(2)}`,
      status: 'ACTIVE',
      itemType: 'SERVICE',
      category: service.category,
      subCategory: service.subCategory
    }));
  }
  
  // Handle regular array response (non-insurance)
  if (Array.isArray(searchResults.value)) {
    return searchResults.value.map(item => ({
      id: item.contractDetailUuid || item.serviceUuid,
      contractDetailUuid: item.contractDetailUuid, // For non-insurance claims
      serviceUuid: item.serviceUuid,
      // Preserve serviceId when present (fallback to serviceUuid or serviceCode)
      serviceId: item.serviceId || item.serviceUuid || item.serviceCode || null,
      price: (item.contractPrice ?? item.negotiatedPrice ?? item.price ?? item.servicePrice ?? 0),
      paymentAmount: `ETB ${Number(item.contractPrice ?? item.negotiatedPrice ?? item.price ?? item.servicePrice ?? 0).toFixed(2)}`,
      status: item.status || 'ACTIVE',
      itemType: props.activeTab === 'services' ? 'SERVICE' : 'DRUG',
      serviceName: item.serviceName,
      serviceCode: item.serviceCode,
      drugName: item.drugName,
      drugCode: item.drugCode,
    }));
  }
  
  return [];
});

// Package/Category options
const packageOptions = computed(() => {
  return props.availablePackages.map(pkg => ({
    label: `${pkg.packageName}`,
    value: pkg.packageUuid
  }));
});

const categoryOptions = computed(() => {
  return props.availableCategories.map(cat => ({
    label: `${cat.categoryName} (${cat.totalServices || 0} services)`,
    value: cat.categoryName
  }));
});

// Computed properties for form fields
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

// Calculate total price
const totalPrice = computed(() => {
  const price = parseFloat(currentPrice.value) || 0;
  const quantity = parseInt(currentQuantity.value) || 1;
  return (price * quantity).toFixed(2);
});

// Prevent API calls during initialization
const isInitializing = ref(true);

function changeTab(tab, event) {
  // Prevent form submission
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  // Prevent API calls when changing tabs
  const wasInitializing = isInitializing.value;
  isInitializing.value = true;

  emit('update:activeTab', tab);
  resetSearchForm();

  // Restore initialization state after a brief delay
  nextTick(() => {
    setTimeout(() => {
      isInitializing.value = wasInitializing;
    }, 100);
  });
}

function resetSearchForm() {
  if (props.activeTab === 'services') {
    searchForm.value.serviceCode = '';
    searchForm.value.serviceName = '';
    searchForm.value.servicePrice = '';
    searchForm.value.serviceQuantity = 1;
  } else {
    searchForm.value.drugCode = '';
    searchForm.value.drugName = '';
    searchForm.value.drugPrice = '';
    searchForm.value.drugQuantity = 1;
  }
}

function selectFromDropdown(item, source = 'name') {
  console.log('Selecting item from dropdown:', item);
  
  if (props.activeTab === 'services') {
    searchForm.value.serviceName = item.serviceName || item.item;
    searchForm.value.serviceCode = item.serviceCode || item.itemCode;
    searchForm.value.servicePrice = (item.price ?? item.contractPrice ?? item.negotiatedPrice ?? item.servicePrice ?? 0);
    
    // Always keep serviceId when present (works for both insurance and non-insurance)
    searchForm.value.serviceId = item.serviceId || item.serviceUuid || item.serviceCode || null;

    // Set contractDetailUuid for non-insurance list items (preserve eligibleServiceUuid for insurance)
    if (props.isInsurance) {
      searchForm.value.eligibleServiceUuid = item.eligibleServiceUuid;
    } else {
      searchForm.value.contractDetailUuid = item.contractDetailUuid;
    }
  } else {
    searchForm.value.drugName = item.drugName || item.item;
    searchForm.value.drugCode = item.drugCode || item.itemCode;
    searchForm.value.drugPrice = (item.price ?? item.contractPrice ?? item.negotiatedPrice ?? item.servicePrice ?? 0);
    
    // Keep serviceId/identifier for drugs too when available
    searchForm.value.serviceId = item.serviceId || item.serviceUuid || item.drugCode || null;

    if (props.isInsurance) {
      searchForm.value.eligibleServiceUuid = item.eligibleServiceUuid;
    } else {
      searchForm.value.contractDetailUuid = item.contractDetailUuid;
    }
  }
  
  // Close the appropriate dropdown
  if (source === 'code') {
    showCodeDropdown.value = false;
  } else {
    showNameDropdown.value = false;
  }
}

function fetchServicesForPackage(packageUuid) {
  emit('search-items', {
    type: activeTab,
    query: '',
    searchType: 'package',
    insuredUuid: props.insuredUuid,
    contractHeaderUuid: props.contractHeaderUuid,
    selectedPackage: packageUuid,
    isInsurance: props.isInsurance
  });
}

function fetchServicesForCategory(categoryUuid) {
  emit('search-items', {
    type: activeTab,
    query: '',
    searchType: 'category',
    insuredUuid: props.insuredUuid,
    contractHeaderUuid: props.contractHeaderUuid,
    selectedCategory: categoryUuid,
    isInsurance: props.isInsurance
  });
}
function addItem(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (
    !currentName.value ||
    currentPrice.value === '' ||
    currentPrice.value === null ||
    Number.isNaN(Number(currentPrice.value))
  ) {
    return;
  }

  // Check if quantity exceeds maximum
  if (parseInt(currentQuantity.value) > 5) {
    console.warn('Maximum quantity is 5');
    return;
  }

  const item = {
    itemType: props.activeTab === 'services' ? 'SERVICE' : 'DRUG',
    quantity: currentQuantity.value,
    price: parseFloat(currentPrice.value),
    totalCost: parseFloat(totalPrice.value),
    remark: '',
    paymentAmount: `ETB ${totalPrice.value}`,
    fsNumber: 'N/A'
  };

  // Add the correct fields based on item type
  if (props.activeTab === 'services') {
    item.serviceName = currentName.value;
    item.serviceCode = currentCode.value;

    // Preserve serviceId regardless of insurance flag
    item.serviceId = searchForm.value.serviceId || null;

    if (props.isInsurance) {
      item.id = searchForm.value.serviceId;
      item.contractDetailUuid = searchForm.value.eligibleServiceUuid; // insurance uses eligibleServiceUuid
    } else {
      item.id = searchForm.value.contractDetailUuid;
      item.contractDetailUuid = searchForm.value.contractDetailUuid;
    }
  } else {
    item.drugName = currentName.value;
    item.drugCode = currentCode.value;

    // Preserve serviceId/identifier for drugs
    item.serviceId = searchForm.value.serviceId || null;

    if (props.isInsurance) {
      item.id = searchForm.value.serviceId;
      item.contractDetailUuid = searchForm.value.eligibleServiceUuid;
    } else {
      item.id = searchForm.value.contractDetailUuid;
      item.contractDetailUuid = searchForm.value.contractDetailUuid;
    }
  }

  console.log('Adding item with preserved ID:', item);
  emit('add-item', item);
  resetSearchForm();
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

function handleUpdateRemark(index, itemId, value) {
  localRemarks.value = {
    ...localRemarks.value,
    [itemId]: value
  };
  emit('update:remarks', localRemarks.value);
}

function handleRemoveItem(index, event) {
  // Prevent form submission
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  emit('remove-item', index);
}

function selectFromTable(item, event) {
  // Prevent form submission
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const itemName = props.activeTab === 'services' ? item.serviceName : item.drugName;
  const itemCode = props.activeTab === 'services' ? item.serviceCode : item.drugCode;

  currentName.value = itemName;
  currentCode.value = itemCode;
  currentPrice.value = item.price;
}

const displayedItems = computed(() => {
  return props.addedItems.filter(item =>
    props.activeTab === 'services' ? item.itemType === 'SERVICE' : item.itemType === 'DRUG'
  );
});

// Watch for package/category selection - only trigger API if not initializing
watch(localSelectedPackage, (newValue, oldValue) => {
  if (isInitializing.value || newValue === oldValue) return;

  if (newValue && props.isInsurance) {
    emit('update:selectedPackage', newValue);
    nextTick(() => {
      fetchServicesForPackage(newValue);
    });
  }
});

watch(localSelectedCategory, (newValue, oldValue) => {
  if (isInitializing.value || newValue === oldValue) return;

  if (newValue && !props.isInsurance) {
    emit('update:selectedCategory', newValue);
    nextTick(() => {
      fetchServicesForCategory(newValue);
    });
  }
});

// Watch for search inputs with debounce
let searchTimeout;
watch([currentName, currentCode], ([newName, newCode]) => {
  clearTimeout(searchTimeout);

  const searchTerm = newName || newCode;
  if (searchTerm && searchTerm.trim()) {
    searchTimeout = setTimeout(() => {
      if (props.isInsurance && localSelectedPackage.value) {
        emit('search-items', {
          type: props.activeTab,
          query: searchTerm.trim(),
          searchType: 'search',
          insuredUuid: props.insuredUuid,
          contractHeaderUuid: props.contractHeaderUuid,
          selectedPackage: localSelectedPackage.value,
          isInsurance: props.isInsurance
        });
      } else if (!props.isInsurance && localSelectedCategory.value) {
        emit('search-items', {
          type: props.activeTab,
          query: searchTerm.trim(),
          searchType: 'search',
          insuredUuid: props.insuredUuid,
          contractHeaderUuid: props.contractHeaderUuid,
          selectedCategory: localSelectedCategory.value,
          isInsurance: props.isInsurance
        });
      }

      // Show appropriate dropdown based on which field was updated
      if (newName && newName.trim()) {
        showNameDropdown.value = true;
        showCodeDropdown.value = false;
      } else if (newCode && newCode.trim()) {
        showCodeDropdown.value = true;
        showNameDropdown.value = false;
      }
    }, 300);
  } else {
    showCodeDropdown.value = false;
    showNameDropdown.value = false;
  }
});

// Watch for prop changes
watch(() => props.selectedPackage, (newValue) => {
  localSelectedPackage.value = newValue || '';
});

watch(() => props.selectedCategory, (newValue) => {
  localSelectedCategory.value = newValue || '';
});

watch(localPrimaryDiagnosis, (newValue) => {
  emit('update:primaryDiagnosis', newValue);
});

watch(localSecondaryDiagnosis, (newValue) => {
  emit('update:secondaryDiagnosis', newValue);
});

// Initialize search results when package/category is available
onMounted(() => {
  // Set initialization flag to false after component is mounted
  nextTick(() => {
    setTimeout(() => {
      isInitializing.value = false;

      if (localSelectedPackage.value) {
        fetchServicesForPackage(localSelectedPackage.value);
      } else if (localSelectedCategory.value) {
        fetchServicesForCategory(localSelectedCategory.value);
      }
    }, 200);
  });
});





// Expose these methods to parent component

</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <!-- Tab Navigation -->
      <div class="flex border-b border-gray-200">
        <button type="button" @click="changeTab('services', $event)" :class="[
          'flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors',
          activeTab === 'services'
            ? 'border-teal-500 text-teal-600 bg-teal-50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]">
          <ClipboardDocumentListIcon class="w-4 h-4 inline mr-2" />
          Services
        </button>
        <button type="button" @click="changeTab('drugs', $event)" :class="[
          'flex-1 px-6 py-3 text-sm font-medium border-b-2 transition-colors',
          activeTab === 'drugs'
            ? 'border-teal-500 text-teal-600 bg-teal-50'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]">
          <BanknotesIcon class="w-4 h-4 inline mr-2" />
          Drugs
        </button>
      </div>

      <!-- Search Form -->
      <div class="p-6">
        <!-- Package/Category Selection -->
       <div class="grid grid-cols-1 md:grid-cols-5 gap-3 items-end mb-4">
  <!-- Package / Category -->
  <div class="space-y-1 min-w-[12rem]">
    <label class="block text-xs font-medium text-gray-700">
      {{ isInsurance ? 'Select Package' : 'Select Category' }}
    </label>
    <select v-if="isInsurance" v-model="localSelectedPackage"
      :disabled="fetchPending || availablePackages.length === 0"
      class="w-[12rem] px-3 py-2 bg-white border border-gray-300 rounded-lg
        focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm
        text-gray-900 shadow-sm transition-all duration-200 hover:border-gray-400">
      <option value="" disabled>
        {{ availablePackages.length === 0 ? 'No packages available' : 'Select a package' }}
      </option>
      <option v-for="pkg in packageOptions" :key="pkg.value" :value="pkg.value">
        {{ pkg.label }}
      </option>
    </select>

    <select v-else v-model="localSelectedCategory"
      :disabled="fetchPending || availableCategories.length === 0"
      class="w-[12rem] px-3 py-2 bg-white border border-gray-300 rounded-lg
        focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm
        text-gray-900 shadow-sm transition-all duration-200 hover:border-gray-400">
      <option value="" disabled>
        {{ availableCategories.length === 0 ? 'No categories available' : 'Select a category' }}
      </option>
      <option v-for="cat in categoryOptions" :key="cat.value" :value="cat.value">
        {{ cat.label }}
      </option>
    </select>
  </div>

  <!-- Service/Drug Code -->
  <div class="space-y-1 relative min-w-[12rem]">
    <label class="block text-xs font-medium text-gray-700">
      {{ activeTab === 'services' ? 'Service Code' : 'Drug Code' }}
    </label>
    <div class="relative">
      <MagnifyingGlassIcon class="absolute left-3 top-3 h-4 w-4 text-teal-500" />
      <input v-model="currentCode" :placeholder="`Search ${activeTab === 'services' ? 'service' : 'drug'} code`"
        class="w-[12rem] px-3 py-2 pl-9 bg-white border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm
          text-gray-900 shadow-sm transition-all duration-200 hover:border-gray-400"
        @focus="showCodeDropdown = true" @blur="handleCodeBlur" />

      <!-- Code dropdown -->
      <div v-if="showCodeDropdown && processedSearchResults.length > 0"
        class="absolute z-50 mt-1 w-full bg-white shadow-xl rounded-lg border border-gray-200 max-h-60 overflow-auto">
        <div class="py-1">
          <div v-for="item in processedSearchResults" :key="item.id"
            class="px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
            @mousedown.prevent="selectFromDropdown(item, 'code')">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="font-semibold text-gray-900">
                  {{ item.serviceCode || item.drugCode || item.itemCode }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ item.serviceName || item.drugName || item.item }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-teal-600">
                  ETB {{ Number(item.price ?? item.contractPrice ?? item.negotiatedPrice ?? item.servicePrice ?? 0).toFixed(2) }}
                </div>
                <div class="text-xs text-gray-400">
                  {{ item.status || 'ACTIVE' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Service/Drug Name -->
  <div class="space-y-1 relative min-w-[12rem]">
    <label class="block text-xs font-medium text-gray-700">
      {{ activeTab === 'services' ? 'Service Name' : 'Drug Name' }}
    </label>
    <div class="relative">
      <ClipboardDocumentListIcon class="absolute left-3 top-3 h-4 w-4 text-teal-500" />
      <input v-model="currentName" :placeholder="`Search ${activeTab === 'services' ? 'service' : 'drug'} name`"
        class="w-[12rem] px-3 py-2 pl-9 bg-white border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm
          text-gray-900 shadow-sm transition-all duration-200 hover:border-gray-400"
        @focus="showNameDropdown = true" @blur="handleNameBlur" />

      <!-- Name dropdown -->
      <div v-if="showNameDropdown && processedSearchResults.length > 0"
        class="absolute z-50 mt-1 w-full bg-white shadow-xl rounded-lg border border-gray-200 max-h-60 overflow-auto">
        <div class="py-1">
          <div v-for="item in processedSearchResults" :key="item.id"
            class="px-4 py-3 text-sm text-gray-700 hover:bg-teal-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
            @mousedown.prevent="selectFromDropdown(item, 'name')">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="font-semibold text-gray-900">
                  {{ item.serviceName || item.drugName || item.item }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  Code: {{ item.serviceCode || item.drugCode || item.itemCode }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-teal-600">
                  ETB {{ Number(item.price ?? item.contractPrice ?? item.negotiatedPrice ?? item.servicePrice ?? 0).toFixed(2) }}
                </div>
                <div class="text-xs text-gray-400">
                  {{ item.status || 'ACTIVE' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Price + Quantity -->
  <div class="grid grid-cols-2 gap-2 min-w-[16rem]">
    <div class="space-y-1 min-w-[8rem]">
      <label class="block text-xs font-medium text-gray-700">Price (ETB)</label>
      <div class="relative">
        <BanknotesIcon class="absolute left-3 top-3 h-4 w-4 text-teal-500" />
        <input v-model="currentPrice" type="number" step="0.01" placeholder="0.00"
          class="w-[5rem] px-3 py-2 pl-9 bg-gray-50 border border-gray-200 rounded-lg
            focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm
            text-gray-700 placeholder-gray-400" readonly />
      </div>
    </div>
   <div class="space-y-1">
      <div class="flex items-center justify-between">
        <label class="block text-xs font-medium text-gray-700">Quantity</label>
        <span v-if="isMaxQuantity" class="text-xs text-red-500 font-medium">Max: 5</span>
      </div>
      <input 
        v-model="currentQuantity" 
        type="number" 
        min="1" 
        max="5"
        readonly
        :class="[
          'w-[6rem] px-3 py-2 bg-white border rounded-lg text-sm shadow-sm transition-all duration-200',
          isMaxQuantity 
            ? 'border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
        ]" 
      />
    </div>
  </div>

  <!-- Total + Add Button -->
  <div class="grid grid-cols-2 gap-2 min-w-[16rem]">
    <div class="space-y-1">
      <label class="block text-xs font-medium text-gray-700">Total</label>
      <div class="w-[6rem] px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-center">
        ETB {{ totalPrice }}
      </div>
    </div>
    <div class="flex items-center pt-4">
      <button type="button" @click="addItem($event)"
        class="w-full px-4 py-2 items-center bg-teal-600 text-white text-sm font-medium rounded-lg
          hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
          transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        :disabled="!localSelectedPackage && !localSelectedCategory">
        Add
      </button>
    </div>
  </div>
</div>


        <!-- Diagnosis Section -->
        <!-- <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Primary Diagnosis</label>
            <textarea v-model="localPrimaryDiagnosis" rows="3"
              class="w-full px-3 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              placeholder="Enter primary diagnosis..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Secondary Diagnosis</label>
            <textarea v-model="localSecondaryDiagnosis" rows="3"
              class="w-full px-3 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              placeholder="Enter secondary diagnosis..."></textarea>
          </div>
        </div> -->
      </div>
    </div>

    <!-- Added Items Table -->
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
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">FS Number</th>
              <th v-if="activeTab === 'services'"
                class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Remark</th>
              <th v-if="activeTab === 'drugs'" class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                Dosage</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Action</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="(item, index) in displayedItems" :key="item.contractDetailUuid" class="hover:bg-gray-50">
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
                  readonly
                  class="w-16 px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm text-center font-medium"
                />
              </td>

              <td class="px-4 py-3 text-sm font-medium text-gray-700">
                ETB {{ item.totalCost?.toFixed(2) || '0.00' }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-700">
                {{ item.fsNumber || 'N/A' }}
              </td>

              <!-- Services -->
              <td v-if="activeTab === 'services'" class="px-4 py-3">
                <input type="text" :value="localRemarks[item.contractDetailUuid]"
                  @input="handleUpdateRemark(index, item.contractDetailUuid, $event.target.value)"
                  class="w-full px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  placeholder="Add remark..." />
              </td>

              <!-- Drugs -->
              <td v-if="activeTab === 'drugs'" class="px-4 py-3 text-sm text-gray-700">
                {{ item.dose }}
              </td>

              <td class="px-4 py-3">
                <button type="button" @click="handleRemoveItem(index, $event)"
                  class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500">
                  Remove
                </button>
              </td>
            </tr>
            <tr v-if="displayedItems.length === 0">
              <td :colspan="activeTab === 'services' ? 9 : 10" class="px-4 py-8 text-center">
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
  </div>
</template>

<style scoped>
/* Custom animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.space-y-6>* {
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
input:focus,
select:focus {
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

/* Dropdown styles */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
