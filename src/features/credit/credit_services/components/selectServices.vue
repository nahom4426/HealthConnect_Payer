<script setup>
import { ref, computed, watch } from 'vue';
import Spinner from '@/components/Spinner.vue';
import icons from "@/utils/icons";

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

const localSearchQuery = ref(props.searchQuery);
const localPrimaryDiagnosis = ref(props.primaryDiagnosis);
const localSecondaryDiagnosis = ref(props.secondaryDiagnosis);
const localRemarks = ref(props.remarks || {});
const availableItems = ref([]); // Now managed internally

function changeTab(tab) {
  emit('update:activeTab', tab);
  localSearchQuery.value = '';
  availableItems.value = []; // Clear search results when changing tabs
}

watch(localSearchQuery, (newValue) => {
  emit('update:searchQuery', newValue);
  if (newValue.length > 0 && props.insuredUuid && props.contractHeaderUuid) {
    emit('search-items', { 
      type: props.activeTab, 
      query: newValue,
      insuredUuid: props.insuredUuid,
      contractHeaderUuid: props.contractHeaderUuid
    });
  } else {
    availableItems.value = []; // Clear results if search query is empty
  }
});

watch(localPrimaryDiagnosis, (newValue) => {
  emit('update:primaryDiagnosis', newValue);
});

watch(localSecondaryDiagnosis, (newValue) => {
  emit('update:secondaryDiagnosis', newValue);
});
watch(availableItems, (newItems) => {
  newItems.forEach(item => {
    if (props.activeTab === 'services' && !item.serviceName) {
      console.warn('Service item missing name:', item);
    }
    if (props.activeTab === 'drugs' && !item.drugName) {
      console.warn('Drug item missing name:', item);
    }
  });
}, { deep: true });
// This function should be called by the parent component when search results arrive
function setSearchResults(items) {
  if (!items) {
    availableItems.value = [];
    return;
  }

  availableItems.value = items.map(item => {
    // Determine if it's a service or drug
    const isService = item.serviceUuid !== null && item.serviceUuid !== undefined && item.serviceName !== "N/A";
    const isDrug = item.drugUuid !== null && item.drugUuid !== undefined && item.drugName !== "N/A";

    // Create the base item structure
    const mappedItem = {
      id: item.contractDetailUuid,
      contractDetailUuid: item.contractDetailUuid,
      price: item.negotiatedPrice || 0,
      paymentAmount: `ETB ${(item.negotiatedPrice || 0).toFixed(2)}`,
      status: item.status || 'UNKNOWN',
      itemType: isService ? 'SERVICE' : 'DRUG'
    };

    // Add service or drug specific fields
    if (isService) {
      Object.assign(mappedItem, {
        serviceUuid: item.serviceUuid,
        serviceName: item.serviceName,
        serviceCode: item.serviceCode,
        drugUuid: null,
        drugName: null,
        drugCode: null
      });
    } else if (isDrug) {
      Object.assign(mappedItem, {
        drugUuid: item.drugUuid,
        drugName: item.drugName,
        drugCode: item.drugCode || 'N/A', // Fallback if drugCode is missing
        serviceUuid: null,
        serviceName: null,
        serviceCode: null
      });
    }

    return mappedItem;
  }).filter(item => {
    // Filter based on active tab
    if (props.activeTab === 'services') {
      return item.itemType === 'SERVICE';
    } else if (props.activeTab === 'drugs') {
      return item.itemType === 'DRUG';
    }
    return false;
  });

  console.log('Mapped and filtered items:', availableItems.value);
}


const isItemAdded = (itemId) => {
  return props.addedItems.some(item => item.contractDetailUuid === itemId);
};

const filteredItems = computed(() => {
  if (!localSearchQuery.value || availableItems.value.length === 0) {
    return [];
  }

  const searchTerm = localSearchQuery.value.toLowerCase();
  return availableItems.value.filter(item => {
    // Get the appropriate name and code based on item type
    const name = props.activeTab === 'services' 
      ? item.serviceName 
      : item.drugName;
    const code = props.activeTab === 'services' 
      ? item.serviceCode 
      : item.drugCode;

    return (
      name.toLowerCase().includes(searchTerm) ||
      code.toLowerCase().includes(searchTerm)
    ) && !isItemAdded(item.id);
  });
});
function handleAddItem(item) {
  if (isItemAdded(item.id)) return;
  
  const newItem = { 
    ...item,
    itemType: props.activeTab === 'services' ? 'SERVICE' : 'DRUG',
    contractDetailUuid: item.contractDetailUuid, // Include contractDetailUuid
    ...(props.activeTab === 'drugs' ? {
      quantity: 1,
      totalCost: item.price * 1,
      route: 'oral',
      frequency: 'daily',
      dose: '1',
      duration: '7 days'
    } : {
      remark: localRemarks.value[item.id] || '',
      quantity: 1
    })
  };
  
  emit('add-item', newItem);
  localSearchQuery.value = '';
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

// Expose the setSearchResults function to parent
defineExpose({ setSearchResults });
</script>

<template>
  <div class="bg-[#F6F7FA] p-4">
    <!-- Tab Navigation -->
     <div class="debug-section" style="display: none;">
  <h3>Debug Info:</h3>
  <p>Search Query: {{ localSearchQuery }}</p>
  <p>Available Items Count: {{ availableItems.length }}</p>
  <p>Filtered Items Count: {{ filteredItems.length }}</p>
  <pre>Available Items: {{ JSON.stringify(availableItems, null, 2) }}</pre>
  <pre>Filtered Items: {{ JSON.stringify(filteredItems, null, 2) }}</pre>
</div>
    <div class="flex items-center mb-6">
      <div class="flex border border-gray-300 rounded w-fit">
        <button
          type="button"
          @click="changeTab('services')"
          :class="[
            'px-6 py-4 transition-colors duration-300',
            activeTab === 'services'
              ? 'bg-[#75778B] text-white rounded-l font-medium'
              : 'bg-white text-[#75778B] hover:bg-gray-100'
          ]"
        >
          Services
        </button>
        <button
          type="button"
          @click="changeTab('drugs')"
          :class="[
            'px-6 py-4 transition-colors duration-300',
            activeTab === 'drugs'
              ? 'bg-[#75778B] text-white rounded-r font-medium'
              : 'bg-white text-[#75778B] hover:bg-gray-100'
          ]"
        >
          Drugs
        </button>
      </div>
      
      <!-- Search Input -->
      <div class="flex-1 w-full ml-4">
        <div class="relative">
          <input
            v-model="localSearchQuery"
            :placeholder="`Search ${activeTab}...`"
            class="w-full p-4 rounded-md focus:ring-teal-500 focus:border-teal-500"
            @keyup.enter="$emit('search-items', { 
              type: activeTab, 
              query: localSearchQuery,
              insuredUuid,
              contractHeaderUuid 
            })"
          />
          
          <!-- Loading State -->
          <div 
            v-if="localSearchQuery && pending"
            class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 p-4 text-center"
          >
            <Spinner class="h-5 w-5 text-teal-600 mx-auto" />
            <p class="text-sm text-gray-500 mt-2">Searching...</p>
          </div>
          
          <!-- Search Results Dropdown -->
          <div 
            v-else-if="localSearchQuery && filteredItems.length > 0"
            class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto"
          >
            <ul>
              <li
                v-for="item in filteredItems"
                :key="item.id"
                @click="handleAddItem(item)"
                class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
              >
                <div>
                  <div class="font-medium">
                    {{ item.serviceName || item.drugName }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ item.serviceCode || item.drugCode }}
                  </div>
                </div>
                <span class="text-sm font-medium">
                  {{ item.paymentAmount }}
                </span>
              </li>
            </ul>
          </div>
          
          <!-- Empty State -->
          <div 
            v-else-if="localSearchQuery && !pending && filteredItems.length === 0"
            class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 p-4 text-center text-sm text-gray-500"
          >
            No matching {{ activeTab }} found
          </div>
        </div>
      </div>
    </div>

    <!-- Added Items Table -->
    <div class="overflow-x-auto bg-white p-3">
      <h2 class="text-xs text-[#75778B] mb-4">Added {{ activeTab }}</h2>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="border-b px-2">
          <tr>
            <th class="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th v-if="activeTab === 'services'" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
            <th v-if="activeTab === 'drugs'" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
            <th v-if="activeTab === 'drugs'" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th v-if="activeTab === 'drugs'" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(item, index) in displayedItems" :key="item.contractDetailUuid">
            <td class="px-1 py-4 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
            <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ item.serviceCode || item.drugCode }}
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ item.serviceName || item.drugName }}
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
              <div class="bg-[#DFF1F1] px-2 py-1 font-bold text-primary">
                {{ item.paymentAmount }}
              </div>
            </td>
            
            <!-- Service-specific fields -->
            <td v-if="activeTab === 'services'" class="px-3 py-4 whitespace-nowrap">
              <input
                type="text"
                :value="localRemarks[item.contractDetailUuid]"
                @input="handleUpdateRemark(index, item.contractDetailUuid, $event.target.value)"
                class="w-full px-3 py-3 bg-[#F6F7FA]"
                placeholder="Service remark"
              />
            </td>
            
            <!-- Drug-specific fields -->
            <template v-if="activeTab === 'drugs'">
              <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ item.dose }}
              </td>
              <td class="px-3 py-4 whitespace-nowrap">
                <input
                  type="number"
                  min="1"
                  :value="item.quantity"
                  @input="handleUpdateItem(index, 'quantity', $event.target.value)"
                  class="w-20 px-3 py-3 bg-[#F6F7FA]"
                />
              </td>
              <td class="px-3 py-3 whitespace-nowrap">
                <input
                  type="text"
                  :value="item.totalCost?.toFixed(2) || '0.00'"
                  readonly
                  class="w-40 px-3 py-3 bg-[#F6F7FA]"
                  placeholder="Total Cost"
                />
              </td>
            </template>
            
            <td class="px-3 py-4 whitespace-nowrap text-sm font-medium">
              <button
                type="button"
                @click="handleRemoveItem(index)"
                class="bg-[#F14545] text-white px-3 rounded-md py-1 hover:bg-red-900"
              >
                Remove
              </button>
            </td>
          </tr>
          <tr v-if="displayedItems.length === 0">
            <td :colspan="activeTab === 'services' ? 5 : 8" class="px-3 py-4 text-center text-sm text-gray-500">
              No {{ activeTab }} added yet
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Diagnosis Fields -->
      <div v-if="activeTab === 'services' && displayedItems.length > 0" class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Primary Diagnosis</label>
          <input
            v-model="localPrimaryDiagnosis"
            class="w-[95%] pl-2  py-3 bg-[#F6F7FA]"
            placeholder="Enter primary diagnosis"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Secondary Diagnosis</label>
          <input
            v-model="localSecondaryDiagnosis"
            class="w-[95%] pl-3 py-3 bg-[#F6F7FA]"
            placeholder="Enter secondary diagnosis"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab-container {
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.tab-button {
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
}

.tab-button.active {
  background-color: #0d9488;
  color: white;
  font-weight: 500;
}

.tab-button.inactive {
  background-color: white;
  color: #6b7280;
}

.tab-button.inactive:hover {
  background-color: #f3f4f6;
}
</style>