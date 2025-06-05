<script setup lang="ts">
import { ref, provide } from 'vue';
import { useApiRequest } from '@/composables/useApiRequest';
import { toasted } from '@/utils/utils';
import { createInsuredPerson, updateInsuredPerson } from '../api/insuredPersonsApi';

const props = defineProps({
  institutionUuid: {
    type: String,
    required: true
  }
});

const createPersonReq = useApiRequest();
const updatePersonReq = useApiRequest();

// Register a new insured person
function register(data: any) {
  console.log('Registering insured person with data:', data);
  
  // Add institution UUID to the payload
  data.institutionUuid = props.institutionUuid;
  
  return new Promise((resolve, reject) => {
    createPersonReq.send(
      () => createInsuredPerson(data),
      (res) => {
        console.log('API response:', res);
        if (res.success) {
          toasted(true, 'Insured person registered successfully');
          resolve(res);
        } else {
          toasted(false, res.error || 'Failed to register insured person');
          reject(new Error(res.error || 'Failed to register insured person'));
        }
      }
    );
  });
}

// Update an existing insured person
function update(uuid: string, data: any) {
  console.log('Updating insured person with data:', data);
  
  return new Promise((resolve, reject) => {
    updatePersonReq.send(
      () => updateInsuredPerson(uuid, data),
      (res) => {
        console.log('API response:', res);
        if (res.success) {
          toasted(true, 'Insured person updated successfully');
          resolve(res);
        } else {
          toasted(false, res.error || 'Failed to update insured person');
          reject(new Error(res.error || 'Failed to update insured person'));
        }
      }
    );
  });
}

// Provide the pending state to child components
provide('createPersonPending', createPersonReq.pending);
provide('updatePersonPending', updatePersonReq.pending);
</script>

<template>
  <slot 
    :register="register" 
    :update="update" 
    :createPending="createPersonReq.pending.value" 
    :updatePending="updatePersonReq.pending.value"
  />
</template>
