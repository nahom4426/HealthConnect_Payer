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
  insuredUuid: String,
  contractHeaderUuid: String
});

const emit = defineEmits([
  'update:activeTab',
  'update:searchQuery',
  'add-item',
  'remove-item',
  'update-quantity',
  'update-diagnosis',
  'update-item',
  'update:remarks'
]);

const localSearchQuery = ref(props.searchQuery);
const localPrimaryDiagnosis = ref('');
const localSecondaryDiagnosis = ref('');
const localRemarks = ref({});
const availableItems = ref([]);

function changeTab(tab) {
  emit('update:activeTab', tab);
  localSearchQuery.value = '';
  availableItems.value = [];
}

watch(() => props.searchQuery, (newValue) => {
  localSearchQuery.value = newValue;
});

const isItemAdded = (itemId) => {
  return props.addedItems.some(item => item.contractDetailUuid === itemId);
};

const filteredItems = computed(() => {
  if (!localSearchQuery.value || availableItems.value.length === 0) {
    return [];
  }

  const searchTerm = localSearchQuery.value.toLowerCase();
  return availableItems.value.filter(item => {
    const name = props.activeTab === 'services' 
      ? item.serviceName 
      : item.drugName;
    const code = props.activeTab === 'services' 
      ? item.serviceCode 
      : item.drugCode;

    return (
      name?.toLowerCase().includes(searchTerm) ||
      code?.toLowerCase().includes(searchTerm)
    ) && !isItemAdded(item.contractDetailUuid);
  });
});

function setSearchResults(items) {
  if (!items) {
    availableItems.value = [];
    return;
  }

  availableItems.value = items.map(item => {
    const isService = item.serviceUuid && item.serviceName !== "N/A";
    const isDrug = item.drugUuid && item.drugName !== "N/A";

    const mappedItem = {
      id: item.contractDetailUuid,
      contractDetailUuid: item.contractDetailUuid,
      price: item.negotiatedPrice || 0,
      paymentAmount: `ETB ${(item.negotiatedPrice || 0).toFixed(2)}`,
      status: item.status || 'UNKNOWN',
      itemType: isService ? 'SERVICE' : 'DRUG'
    };

    if (isService) {
      Object.assign(mappedItem, {
        serviceUuid: item.serviceUuid,
        serviceName: item.serviceName,
        serviceCode: item.serviceCode
      });
    } else if (isDrug) {
      Object.assign(mappedItem, {
        drugUuid: item.drugUuid,
        drugName: item.drugName,
        drugCode: item.drugCode || 'N/A'
      });
    }

    return mappedItem;
  }).filter(item => {
    return props.activeTab === 'services' 
      ? item.itemType === 'SERVICE'
      : item.itemType === 'DRUG';
  });
}

function handleAddItem(item) {
  if (isItemAdded(item.contractDetailUuid)) return;
  
  const newItem = { 
    ...item,
    itemType: props.activeTab === 'services' ? 'SERVICE' : 'DRUG',
    ...(props.activeTab === 'drugs' ? {
      quantity: 1,
      totalCost: item.price * 1,
      route: 'oral',
      frequency: 'daily',
      dose: '1',
      duration: '7 days'
    } : {
      remark: localRemarks.value[item.contractDetailUuid] || '',
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

defineExpose({ setSearchResults });
</script>

<template>
  <div class="bg-[#F6F7FA] p-4">
    <!-- Tab Navigation -->
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
            @input="$emit('update:searchQuery', localSearchQuery)"
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
                :key="item.contractDetailUuid"
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
            @input="$emit('update:primaryDiagnosis', localPrimaryDiagnosis)"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Secondary Diagnosis</label>
          <input
            v-model="localSecondaryDiagnosis"
            class="w-[95%] pl-3 py-3 bg-[#F6F7FA]"
            placeholder="Enter secondary diagnosis"
            @input="$emit('update:secondaryDiagnosis', localSecondaryDiagnosis)"
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