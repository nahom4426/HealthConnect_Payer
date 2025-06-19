<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { PropType } from 'vue';

interface Item {
  id: string;
  code: string;
  name: string;
  price: string;
  quantity: number;
  status: string;
  route?: string;
  frequency?: string;
  duration?: string;
}

const props = defineProps({
  searchQuery: String,
  pending: Boolean,
  availableItems: {
    type: Array as PropType<Item[]>,
    default: () => []
  },
  addedItems: {
    type: Array as PropType<Item[]>,
    default: () => []
  }
});

const emit = defineEmits([
  'update:searchQuery',
  'add-item',
  'remove-item',
  'update-quantity',
  'update-item',
  'search-items',
  'clear-items'

]);

const activeTab = ref<'services' | 'drugs'>('services');
const localSearchQuery = ref(props.searchQuery);
watch(activeTab, (newTab) => {
  emit('clear-items', newTab);
  localSearchQuery.value = '';
});
// Debug watchers
watch(() => props.availableItems, (newItems) => {
  console.log('Available items updated:', newItems);
}, { deep: true });

watch(localSearchQuery, (newValue) => {
  console.log('Search query changed:', newValue);
  emit('update:searchQuery', newValue);
  if (newValue.length > 0) {
    emit('search-items', { type: activeTab.value, query: newValue });
  }
});
const isItemAdded = (itemId: string) => {
  return props.addedItems.some(item => item.id === itemId);
};

const filteredItems = computed(() => {
  if (!localSearchQuery.value || !props.availableItems) return [];
  
  const searchTerm = localSearchQuery.value.toLowerCase();
  return props.availableItems.filter(item => {
    if (!item.name || !item.code) return false;
    return (
      (item.name.toLowerCase().includes(searchTerm) ||
       item.code.toLowerCase().includes(searchTerm)) &&
      !isItemAdded(item.id) // Exclude already added items
    );
  });
});
function handleAddItem(item: Item) {
  if (isItemAdded(item.id)) return; // Prevent duplicates
  
  const newItem = { 
    ...item,
    ...(activeTab.value === 'drugs' ? { 
      route: 'oral',
      frequency: 'daily',
      duration: '7 days'
    } : {})
  };
  emit('add-item', newItem);
  localSearchQuery.value = '';
}
function handleRemoveItem(index: number) {
  emit('remove-item', index);
}

function handleUpdateItem(index: number, field: string, value: string) {
  emit('update-item', { 
    index, 
    item: { [field]: value } 
  });
}
</script>

<template>
  <div>
    <!-- Tab Navigation -->
    <div class="flex gap-4 mb-4 border-b">
      <button
        @click="activeTab = 'services'"
        :class="{
          'border-b-2 border-primary text-primary': activeTab === 'services',
          'text-gray-500': activeTab !== 'services'
        }"
        class="px-4 py-2 font-medium"
      >
        Services
      </button>
      <button
        @click="activeTab = 'drugs'"
        :class="{
          'border-b-2 border-primary text-primary': activeTab === 'drugs',
          'text-gray-500': activeTab !== 'drugs'
        }"
        class="px-4 py-2 font-medium"
      >
        Drugs
      </button>
    </div>

    <!-- Search Input -->
    <div class="flex gap-4 mb-6">
      <div class="flex-1 relative">
        <input
          v-model="localSearchQuery"
          :placeholder="`Search ${activeTab}...`"
          class="w-full p-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
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
              <span>{{ item.name }}</span>
              <span class="text-sm text-gray-500">{{ item.price }}</span>
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

    <!-- Added Items Table -->
    <h2 class="text-lg font-semibold mb-4">Added {{ activeTab }}</h2>
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-white border-b px-2">
          <tr>
            <th class="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th v-if="activeTab === 'drugs'" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
            <th v-if="activeTab === 'drugs'" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
            <th v-if="activeTab === 'drugs'" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(item, index) in props.addedItems" :key="item.id">
            <td class="px-1 py-4 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.code }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.price }}</td>
            
            <!-- Drug-specific fields -->
            <td v-if="activeTab === 'drugs'" class="px-6 py-4 whitespace-nowrap">
              <select
                :value="item.route"
                @change="handleUpdateItem(index, 'route', $event.target.value)"
                class="p-1 border border-gray-300 rounded-md"
              >
                <option value="oral">Oral</option>
                <option value="iv">IV</option>
                <option value="im">IM</option>
              </select>
            </td>
            <td v-if="activeTab === 'drugs'" class="px-6 py-4 whitespace-nowrap">
              <select
                :value="item.frequency"
                @change="handleUpdateItem(index, 'frequency', $event.target.value)"
                class="p-1 border border-gray-300 rounded-md"
              >
                <option value="daily">Daily</option>
                <option value="bid">BID</option>
                <option value="tid">TID</option>
              </select>
            </td>
            <td v-if="activeTab === 'drugs'" class="px-6 py-4 whitespace-nowrap">
              <input
                type="text"
                :value="item.duration"
                @change="handleUpdateItem(index, 'duration', $event.target.value)"
                class="w-20 p-1 border border-gray-300 rounded-md"
                placeholder="7 days"
              />
            </td>
            
            <td class="px-6 py-4 whitespace-nowrap">
              <input
                type="number"
                min="1"
                :value="item.quantity"
                @change="$emit('update-quantity', {index, value: $event.target.valueAsNumber})"
                class="w-20 p-1 border border-gray-300 rounded-md"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                type="button"
                @click="handleRemoveItem(index)"
                class="bg-[#F14545] text-white px-3 rounded-md py-1 hover:bg-red-900"
              >
                Remove
              </button>
            </td>
          </tr>
          <tr v-if="props.addedItems.length === 0">
            <td :colspan="activeTab === 'services' ? 5 : 8" class="px-6 py-4 text-center text-sm text-gray-500">
              No {{ activeTab }} added yet
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>