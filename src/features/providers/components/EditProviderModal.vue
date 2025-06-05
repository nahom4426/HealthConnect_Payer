<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { updateProvider, getProviderById } from '../api/providerApi';
import ProviderForm from './ProviderForm.vue';
import { addToast } from '@/toast';

const props = defineProps({
  providerUuid: {
    type: String,
    required: true
  },
  provider: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'updated']);

const error = ref('');
const updatePending = ref(false);
const formRef = ref(null);

// Log props for debugging
onMounted(() => {
  console.log('EditProviderModal mounted with props:', props);
});

// Handle form submission
async function handleSubmit(values) {
  try {
    updatePending.value = true;
    console.log('Submitting updated provider data:', values);
    
    const response = await updateProvider(props.providerUuid, values);
    console.log('Update response:', response);
    
    if (response.success) {
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Provider updated successfully'
      });
      emit('updated', { ...props.provider, ...values });
      emit('close');
    } else {
      error.value = response.error || 'Failed to update provider';
      addToast({
        type: 'error',
        title: 'Error',
        message: error.value
      });
    }
  } catch (err) {
    error.value = err.message || 'An error occurred while updating provider';
    
    addToast({
      type: 'error',
      title: 'Error',
      message: error.value
    });
    console.error('Error updating provider:', err);
  } finally {
    updatePending.value = false;
  }
}

// Handle cancel button click
function handleCancel() {
  emit('close');
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
      <div class="bg-gray-50 p-4 border-b flex justify-between items-center">
        <h1 class="font-medium text-lg">Edit Provider</h1>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div v-if="error" class="p-8 text-center text-red-500">
        {{ error }}
      </div>
      
      <div v-else>
        <ProviderForm 
          ref="formRef"
          :initial-data="provider"
          :is-edit="true"
          :pending="updatePending" 
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </div>
</template>



