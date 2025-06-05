<script setup>
import { computed } from 'vue';

const props = defineProps({  
  rowData: {  
    type: Array,  
    required: true,  
  },  
  headKeys: {  
    type: Array,  
    required: true,
  },  
  rowKeys: {  
    type: Array,  
    required: true,  
  },
  onEdit: {
    type: Function,
    default: () => {}
  },
  onDelete: {
    type: Function,
    default: () => {}
  },
  onRowClick: {
    type: Function,
    default: () => {}
  }
}); 

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Helper function to format fullname with proper capitalization
function formatFullName(row) {
  const title = capitalizeFirstLetter(row?.title || '');
  const firstName = capitalizeFirstLetter(row?.firstName || '');
  const fatherName = capitalizeFirstLetter(row?.fatherName || '');
  const grandFatherName = capitalizeFirstLetter(row?.grandFatherName || '');
  
  return `${title} ${firstName} ${fatherName} ${grandFatherName}`.trim();
}

// Helper function to get status styling
function getStatusStyle(status) {
  switch(status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'inactive':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Helper function to get gender styling
function getGenderStyle(gender) {
  switch(gender?.toLowerCase()) {
    case 'male':
      return 'bg-blue-100 text-blue-800';
    case 'female':
      return 'bg-pink-100 text-pink-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
</script>

<template>  
  <tr 
    v-for="(row, idx) in rowData" 
    :key="idx"
    @click.self="onRowClick(row)" 
    class="bg-white border-b hover:bg-gray-50 transition-colors duration-150 ease-in-out" 
  >  
    <td class="p-4 font-medium text-gray-500">{{ idx + 1 }}</td>  

    <td class="p-3 py-4" v-for="key in rowKeys" :key="key">  
      <!-- Fullname field -->
      <span v-if="key === 'fullname'" class="font-medium text-gray-700">
        {{ formatFullName(row) }}
      </span>

      <!-- Email field -->
      <span v-else-if="key === 'email'" class="text-gray-600">
        {{ row.email }}
      </span>

      <!-- Mobile Phone field -->
      <span v-else-if="key === 'mobilePhone'" class="text-gray-600">
        {{ row.mobilePhone }}
      </span>

      <!-- Role Name field -->
      <span v-else-if="key === 'roleName'" class="text-gray-700">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
          {{ capitalizeFirstLetter(row.roleName) }}
        </span>
      </span>

      <!-- Gender field -->
      <span v-else-if="key === 'gender'" class="text-gray-700">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium"
              :class="getGenderStyle(row.gender)">
          {{ capitalizeFirstLetter(row.gender) }}
        </span>
      </span>

      <!-- Default field rendering with capitalization -->
      <span v-else class="text-gray-700">
        {{ typeof row[key] === 'string' ? capitalizeFirstLetter(row[key]) : row[key] }}
      </span>
    </td>  

    <td class="p-3" v-if="headKeys.includes('Actions') || headKeys.includes('actions')">  
      <div class="flex gap-2">
        <button class="rounded-lg bg-gray-600 text-white px-2 py-1 border-gray-300 flex gap-1"
          @click.stop.prevent="onEdit(row?.userUuid)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Edit
        </button>
        <button class="rounded-lg bg-[#FF4C4C] text-white px-2 py-1 border-gray-300 flex gap-1"
          @click.stop.prevent="onDelete(row?.userUuid)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          Delete
        </button>
      </div>
    </td>  
  </tr>
</template>