<script setup lang="ts">
import { ref, watch } from 'vue';
import ModalParent from '@/components/ModalParent.vue';
import NewFormParent from '@/components/NewFormParent.vue';
import Button from '@/components/Button.vue';
import { useApiRequest } from '@/composables/useApiRequest';
import { updateProviderContract } from '../api/providerContractApi';
import { toasted } from '@/utils/utils';

const props = defineProps({
  contractUuid: {
    type: String,
    required: true
  },
  contract: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'updated']);

const formData = ref({
  providerName: props.contract?.providerName || '',
  startDate: props.contract?.startDate || '',
  endDate: props.contract?.endDate || '',
  contractType: props.contract?.contractType || '',
  description: props.contract?.description || '',
  status: props.contract?.status || 'ACTIVE'
});

const error = ref('');
const updateReq = useApiRequest();

// Watch for changes in the contract prop
watch(() => props.contract, (newContract) => {
  if (newContract) {
    formData.value = {
      providerName: newContract.providerName || '',
      startDate: newContract.startDate || '',
      endDate: newContract.endDate || '',
      contractType: newContract.contractType || '',
      description: newContract.description || '',
      status: newContract.status || 'ACTIVE'
    };
  }
}, { deep: true });

// Handle form submission
function handleSubmit() {
  if (updateReq.pending.value) return;
  
  updateReq.send(
    () => updateProviderContract(props.contractUuid, formData.value),
    (res) => {
      if (res.success) {
        toasted(res.success, 'Contract Updated Successfully');
        emit('updated', { ...props.contract, ...formData.value });
        emit('close');
      } else {
        error.value = res.error || 'Failed to update contract';
        toasted(error.value, 'Error', 'error');
      }
    }
  );
}
</script>

<template>
  <ModalParent>
    <NewFormParent title="Edit Provider Contract">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <template v-if="error">
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {{ error }}
          </div>
        </template>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-group">
            <label for="providerName" class="block text-sm font-medium text-gray-700">Provider Name</label>
            <input 
              id="providerName" 
              v-model="formData.providerName" 
              type="text" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="contractType" class="block text-sm font-medium text-gray-700">Contract Type</label>
            <input 
              id="contractType" 
              v-model="formData.contractType" 
              type="text" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="startDate" class="block text-sm font-medium text-gray-700">Start Date</label>
            <input 
              id="startDate" 
              v-model="formData.startDate" 
              type="date" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="endDate" class="block text-sm font-medium text-gray-700">End Date</label>
            <input 
              id="endDate" 
              v-model="formData.endDate" 
              type="date" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          
          <div class="form-group col-span-2">
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
              id="description" 
              v-model="formData.description" 
              rows="3" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
            <select 
              id="status" 
              v-model="formData.status" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            >
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </form>
      
      <template #bottom>
        <div class="flex justify-end space-x-3 p-2">
          <Button type="button" variant="secondary" @click="emit('close')">Cancel</Button>
          <Button type="submit" :pending="updateReq.pending.value" @click="handleSubmit">Update Contract</Button>
        </div>
      </template>
    </NewFormParent>
  </ModalParent>
</template>
