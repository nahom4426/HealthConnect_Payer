<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { PropType } from 'vue';
import Spinner from '@/components/Spinner.vue';
import icons from "@/utils/icons";

interface Service {
  id: string;
  serviceUuid: string;
  serviceCode: string;
  serviceName: string;
  paymentAmount: string;
  remark?: string;
  status: string;
}

interface Drug {
  id: string;
  drugUuid: string;
  drugCode: string;
  drugName: string;
  price: number;
   totalCost?: number;
  quantity: number;
  status: string;
  route: string;
  frequency: string;
  dose: string;
  duration: string;
}

const props = defineProps({
  activeTab: {
    type: String as PropType<'services' | 'drugs'>,
    required: true
  },
  searchQuery: String,
  pending: Boolean,
  availableItems: {
    type: Array as PropType<Array<Service | Drug>>,
    default: () => []
  },
  addedItems: {
    type: Array as PropType<Array<Service | Drug>>,
    default: () => []
  },
  primaryDiagnosis: String,
  secondaryDiagnosis: String,
  remarks: Object as PropType<Record<string, string>>
});

const emit = defineEmits([
  'update:activeTab',
  'update:searchQuery',
  'add-item',
  'remove-item',
  'update-item',
  'search-items',
  'clear-items',
  'update:primaryDiagnosis',
  'update:secondaryDiagnosis',
   'update:remarks' 
]);

const localSearchQuery = ref(props.searchQuery);
const localPrimaryDiagnosis = ref(props.primaryDiagnosis);
const localSecondaryDiagnosis = ref(props.secondaryDiagnosis);

function changeTab(tab: 'services' | 'drugs') {
  emit('update:activeTab', tab);
  emit('clear-items', tab);
  localSearchQuery.value = '';
}

watch(localSearchQuery, (newValue) => {
  emit('update:searchQuery', newValue);
  if (newValue.length > 0) {
    emit('search-items', { type: props.activeTab, query: newValue });
  }
});

watch(localPrimaryDiagnosis, (newValue) => {
  emit('update:primaryDiagnosis', newValue);
});

watch(localSecondaryDiagnosis, (newValue) => {
  emit('update:secondaryDiagnosis', newValue);
});

const isItemAdded = (itemId: string) => {
  return props.addedItems.some(item => item.id === itemId);
};

const filteredItems = computed(() => {
  if (!localSearchQuery.value || !props.availableItems) return [];
  
  const searchTerm = localSearchQuery.value.toLowerCase();
  return props.availableItems.filter(item => {
    const name = props.activeTab === 'services' 
      ? (item as Service).serviceName 
      : (item as Drug).drugName;
    const code = props.activeTab === 'services' 
      ? (item as Service).serviceCode 
      : (item as Drug).drugCode;
      
    return (
      name.toLowerCase().includes(searchTerm) ||
      code.toLowerCase().includes(searchTerm))
      && !isItemAdded(item.id);
  });
});
const localRemarks = ref<Record<string, string>>(props.remarks || {});
function handleAddItem(item: Service | Drug) {
  if (isItemAdded(item.id)) return;
  
  const newItem = { 
    ...item,
    ...(props.activeTab === 'drugs' ? {
      quantity: 1,
      totalCost: (item as Drug).price * 1, // Initialize total cost
      route: 'oral',
      frequency: 'daily',
      dose: '1',
      duration: '7 days'
    } : {
      remark: localRemarks.value[item.id] || ''
    })
  };
  emit('add-item', newItem);
  localSearchQuery.value = '';
}

function handleUpdateRemark(index: number, itemId: string, value: string) {
  localRemarks.value = {
    ...localRemarks.value,
    [itemId]: value
  };
  emit('update:remarks', localRemarks.value);
}

function handleRemoveItem(index: number) {
  emit('remove-item', index);
}
function handleUpdateItem(index: number, field: string, value: string) {
  const updatedItem = { [field]: value };
  
  // If quantity is being updated, calculate total cost
  if (field === 'quantity' && props.activeTab === 'drugs') {
    const drug = props.addedItems[index] as Drug;
    const quantity = Number(value) || 0;
    updatedItem.totalCost = drug.price * quantity;
  }
  
  emit('update-item', { 
    index, 
    item: updatedItem
  });
}
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
            @keyup.enter="$emit('search-items', { type: activeTab, query: localSearchQuery })"
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
                  <div class="font-medium">{{ 
                    activeTab === 'services' 
                      ? (item as Service).serviceName 
                      : (item as Drug).drugName 
                  }}</div>
                  <div class="text-sm text-gray-500">{{
                    activeTab === 'services' 
                      ? (item as Service).serviceCode 
                      : (item as Drug).drugCode 
                  }}</div>
                </div>
                <span class="text-sm font-medium">
                  {{ 
                    activeTab === 'services' 
                      ? (item as Service).paymentAmount 
                      : `ETB ${(item as Drug).price?.toFixed(2) || '0.00'}` 
                  }}
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
            <!-- <th v-if="activeTab === 'drugs'" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
            <th v-if="activeTab === 'drugs'" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th> -->
            <th v-if="activeTab === 'drugs'" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th v-if="activeTab === 'drugs'" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TotalCost</th>
            <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(item, index) in addedItems" :key="item.id">
            <td class="px-1 py-4 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
            <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ activeTab === 'services' ? (item as Service).serviceCode : (item as Drug).drugCode }}
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ activeTab === 'services' ? (item as Service).serviceName : (item as Drug).drugName }}
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
              <div class="bg-[#DFF1F1] px-2 py-1 font-bold text-primary">
                {{ activeTab === 'services' ? (item as Service).paymentAmount : `ETB ${((item as Drug).price || 0).toFixed(2)}` }}
              </div>
            </td>
            
            <!-- Service-specific remark field -->
             <td v-if="activeTab === 'services'" class="px-3 py-4 whitespace-nowrap">
    <input
      type="text"
      :value="localRemarks[(item as Service).id]"
      @input="handleUpdateRemark(index, (item as Service).id, ($event.target as HTMLInputElement).value)"
       class="w-full px-3  py-3 bg-[#F6F7FA]"
      placeholder="Service remark"
    />
  </td>
            
            <!-- Drug-specific fields -->
            <template v-if="activeTab === 'drugs'">
              <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ (item as Drug).dose }}
              </td>

              <!-- <td class="px-3 py-4 whitespace-nowrap">
                <div class="relative w-[104.5px] h-[30px]">
                  <select
                    :value="(item as Drug).route"
                    @change="handleUpdateItem(index, 'route', ($event.target as HTMLSelectElement).value)"
                    class="w-full h-full rounded border border-[#ECECEE] bg-[#F9F9FD] px-2 pr-6 text-gray-700 appearance-none"
                  >
                    <option value="oral">Oral</option>
                    <option value="iv">IV</option>
                    <option value="im">IM</option>
                  </select>
                  <div class="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
                    <i v-html="icons.drop" class="text-gray-500"></i>
                  </div>
                </div>
              </td>

              <td class="px-3 py-4 whitespace-nowrap">
                <div class="relative w-[104.5px] h-[30px]">
                  <select
                    :value="(item as Drug).frequency"
                    @change="handleUpdateItem(index, 'frequency', ($event.target as HTMLSelectElement).value)"
                    class="w-full h-full rounded border border-[#ECECEE] bg-[#F9F9FD] px-2 pr-6 text-gray-700 appearance-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="bid">BID</option>
                    <option value="tid">TID</option>
                  </select>
                  <div class="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2">
                    <i v-html="icons.drop" class="text-gray-500"></i>
                  </div>
                </div>
              </td> -->
  <td class="px-3 py-4 whitespace-nowrap">
               <input
  type="number"
  min="1"
  :value="(item as Drug).quantity"
  @input="handleUpdateItem(index, 'quantity', ($event.target as HTMLInputElement).value)"
  class="w-20 px-3 py-3 bg-[#F6F7FA]"
/>
              </td>
            <td class="px-3 py-3 whitespace-nowrap">
  <input
    type="text"
    :value="(item as Drug).totalCost?.toFixed(2) || '0.00'"
    readonly
    class="w-40 px-3 py-3 bg-[#F6F7FA] "
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
          <tr v-if="addedItems.length === 0">
            <td :colspan="activeTab === 'services' ? 5 : 10" class="px-3 py-4 text-center text-sm text-gray-500">
              No {{ activeTab }} added yet
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Diagnosis Fields (only shown for services and when items exist) -->
      <div v-if="activeTab === 'services' && addedItems.length > 0" class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Primary Diagnosis</label>
          <input
            v-model="localPrimaryDiagnosis"
            class="w-full px-3  py-3 bg-[#F6F7FA]"
            placeholder="Enter primary diagnosis"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Secondary Diagnosis</label>
          <input
            v-model="localSecondaryDiagnosis"
            class="w-full px-3  py-3 bg-[#F6F7FA]"
            placeholder="Enter secondary diagnosis"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* For the tab container */
.tab-container {
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb; /* gray-300 */
  overflow: hidden;
}

/* For individual tabs */
.tab-button {
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
}

.tab-button.active {
  background-color: #0d9488; /* primary color */
  color: white;
  font-weight: 500;
}

.tab-button.inactive {
  background-color: white;
  color: #6b7280; /* gray-500 */
}

.tab-button.inactive:hover {
  background-color: #f3f4f6; /* gray-100 */
}
</style>