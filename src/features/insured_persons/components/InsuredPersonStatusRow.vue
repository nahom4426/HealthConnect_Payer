<script setup lang="ts">
import { defineProps, ref } from 'vue';
import { Status } from '@/types/interface';
import Button from '@/components/Button.vue';
import Dropdown from '@/components/Dropdown.vue';
import icons from '@/utils/icons';

const props = defineProps({
  rowData: {
    type: Array,
    required: true
  },
  rowKeys: {
    type: Array,
    required: true
  },
  headKeys: {
    type: Array,
    required: true
  },
  onView: {
    type: Function,
    default: () => {}
  },
  onEdit: {
    type: Function,
    default: () => {}
  },
  onActivate: {
    type: Function,
    default: () => {}
  },
  onDeactivate: {
    type: Function,
    default: () => {}
  },
  onRowClick: {
    type: Function,
    default: () => {}
  }
});

const showDropdown = ref(false);

function formatName(row) {
  if (!row) return '';
  return `${row.title || ''} ${row.firstName || ''} ${row.fatherName || ''} ${row.grandFatherName || ''}`.trim();
}

function formatAddress(row) {
  if (!row) return '';
  return `${row.address3 || ''}, ${row.address2 || ''}, ${row.address1 || ''}, ${row.state || ''}`.replace(/^,\s*|,\s*$|(?:,\s*)+/g, ', ').trim();
}

function getStatusStyle(status) {
  switch (status) {
    case Status.ACTIVE:
      return 'bg-green-100 text-green-800';
    case Status.INACTIVE:
    case Status.SUSPENDED:
      return 'bg-red-100 text-red-800';
    case Status.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
</script>

<template>
  <tr 
    v-for="(row, idx) in rowData" 
    :key="idx"
    @click="onRowClick(row)" 
    class="bg-white border-b hover:bg-gray-50 transition-colors duration-150 ease-in-out cursor-pointer" 
  >  
    <td class="p-4 font-medium text-gray-500">{{ idx + 1 }}</td>  

    <td class="p-3 py-4" v-for="key in rowKeys" :key="key">  
      <!-- Status field -->
      <div v-if="key === 'status'" class="truncate">  
        <span 
          class="px-2.5 py-1 rounded-full text-xs font-medium"
          :class="getStatusStyle(row.status)"
        >
          {{ row.status || 'Active' }}
        </span>
      </div>
      <!-- Name field -->
      <span v-else-if="key === 'fullName'" class="text-gray-700">
        {{ formatName(row) }}
      </span>
      <!-- Address field -->
      <span v-else-if="key === 'address'" class="text-gray-700">
        {{ formatAddress(row) }}
      </span>
      <!-- Default field rendering -->
      <span v-else class="text-gray-700">
        {{ row[key] }}
      </span>
    </td>  

    <td class="p-3" v-if="headKeys.includes('Actions') || headKeys.includes('actions')">  
      <div class="flex gap-2">
        <Button 
          type="secondary" 
          size="xs" 
          @click.stop="onView(row)"
          class="flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View
        </Button>
        
        <Button 
          type="secondary" 
          size="xs" 
          @click.stop="onEdit(row)"
          class="flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </Button>

        <Button 
          v-if="row.status !== Status.INACTIVE && row.status !== Status.SUSPENDED"
          type="danger" 
          size="xs" 
          @click.stop="onDeactivate(row.insuredUuid)"
          class="flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Deactivate
        </Button>
        
        <Button 
          v-else
          type="success" 
          size="xs" 
          @click.stop="onActivate(row.insuredUuid)"
          class="flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Activate
        </Button>
      </div>
    </td>   
  </tr>   
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>