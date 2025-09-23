<script setup lang="ts">
import { useApiRequest } from "@/composables/useApiRequest";
import { createCreditService } from "../api/creditServicesApi";
import { ref } from "vue";
import { toasted } from "@/utils/utils";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const creditReq = useApiRequest();
const pending = ref(false);

function submitCreditService(formData: FormData) {
  console.log('Credit service form data received:', formData);
  
  // Extract credit service data from FormData
  const requestJson = formData.get('request');
  if (!requestJson) {
    const errorMsg = 'Missing credit service request data';
    return Promise.reject(new Error(errorMsg));
  }

  try {
    const requestData = JSON.parse(requestJson as string);

    // Required field validation
    const requiredFields = [
      'contractHeaderUuid',
      'insuredUuid', 
      'dispensingDate',
      'medicationItems'
    ];

    const missingFields = requiredFields.filter(field => {
      const value = requestData[field];
      return value === undefined || value === null || value === '' || 
             (Array.isArray(value) && value.length === 0);
    });

    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      console.error('Validation failed:', errorMsg);
      return Promise.reject(new Error(errorMsg));
    }

    // Validate medication items
    if (requestData.medicationItems && requestData.medicationItems.length > 0) {
      const invalidItems = requestData.medicationItems.filter(item => 
        !item.contractDetailUuid || !item.serviceId
      );
      
      if (invalidItems.length > 0) {
        const errorMsg = 'Some medication items are missing required fields';
        console.error('Validation failed:', errorMsg);
        return Promise.reject(new Error(errorMsg));
      }
    }

    // If everything's good, submit the request
    return sendCreditServiceRequest(formData);
  } catch (error) {
    console.error('Error parsing credit service data:', error);
    toasted(false, 'Invalid credit service data format');
    return Promise.reject(error);
  }
}

function sendCreditServiceRequest(formData: FormData) {
  console.log('Sending credit service request with form data');
  
  return new Promise((resolve, reject) => {
    creditReq.send(
      () => createCreditService(formData),
      (response) => {
        if (response.success) {
          console.log('Credit service created successfully:', response.data);
          toasted(true, 'Credit claim submitted successfully');
          resolve(response);
        } else {
          console.error('Credit service creation failed:', response.error);
          const errorMsg = response.error || 'Failed to submit credit claim';
          reject(new Error(errorMsg));
        }
      }
    );
  });
}

// Optional: Add other methods like import, download template if needed
function downloadTemplate() {
  // Implement if needed
  console.log('Download template functionality');
}

defineExpose({
  submitCreditService,
  downloadTemplate,
  pending: creditReq.pending
});
</script>

<template>
  <slot
    :submitCreditService="submitCreditService"
    :pending="creditReq.pending.value"
    :error="creditReq.error.value"
    :downloadTemplate="downloadTemplate"
  />
</template>