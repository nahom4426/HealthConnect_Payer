<script setup lang="ts">
import { useApiRequest } from "@/composables/useApiRequest";
import { createPayerContract, importPayerContracts, downloadPayerContractTemplate } from "../api/payerContractApi";
import { ref } from "vue";
import { toasted } from "@/utils/utils";

const props = defineProps({
  auto: {
    type: Boolean,
    default: true
  }
});

const registerReq = useApiRequest();
const importReq = useApiRequest();
const downloadReq = useApiRequest();
const fileInputRef = ref<HTMLInputElement | null>(null);

function register(formData: FormData) {
  console.log('Registration form data received:', formData);
  
  // Check if required fields are present
  const contractJson = formData.get('payerContract');
  if (!contractJson) {
    const errorMsg = 'Missing payer contract data';
    toasted(false, errorMsg);
    return Promise.reject(new Error(errorMsg));
  }

  try {
    const contractData = JSON.parse(contractJson as string);
    
    const requiredContractFields = [
      'contractName', 
      'payerId',
      'startDate',
      'endDate',
      'contractType',
      'paymentTerms'
    ];

    const missingFields = requiredContractFields.filter(field => {
      const value = contractData[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      const errorMsg = `Missing required Contract fields: ${missingFields.join(', ')}`;
      console.error('Validation failed:', errorMsg);
      toasted(false, errorMsg);
      return Promise.reject(new Error(errorMsg));
    }

    return sendRegistrationRequest(formData);
  } catch (error) {
    console.error('Error parsing contract data:', error);
    toasted(false, 'Invalid contract data format');
    return Promise.reject(error);
  }
}

function sendRegistrationRequest(formData: FormData) {
  console.log('Sending registration request with form data');
  
  return new Promise((resolve, reject) => {
    registerReq.send(
      () => createPayerContract(formData),
      (response) => {
        if (response.success) {
          console.log('Registration successful:', response.data);
          toasted(true, 'Payer contract registered successfully');
          resolve(response);
        } else {
          console.error('Registration failed:', response.error);
          const errorMsg = response.error || 'Failed to register payer contract';
          toasted(false, errorMsg);
          reject(new Error(errorMsg));
        }
      }
    );
  });
}

function importFile(file: File) {
  return new Promise((resolve, reject) => {
    importReq.send(
      () => importPayerContracts(file),
      (res) => {
        if (res.success) {
          toasted(true, 'Payer contracts imported successfully');
          resolve(res);
        } else {
          toasted(false, res.error || 'Failed to import payer contracts');
          reject(new Error(res.error || 'Failed to import payer contracts'));
        }
      }
    );
  });
}

function downloadTemplate() {
  downloadReq.send(
    () => downloadPayerContractTemplate(),
    (res) => {
      try {
        const url = window.URL.createObjectURL(new Blob([res]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'payer_contract_template.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error downloading template:', error);
        toasted(false, 'Failed to download template');
      }
    }
  );
}

defineExpose({
  register,
  importFile,
  downloadTemplate,
  fileInputRef,
  pending: registerReq.pending
});
</script>

<template>
  <slot
    :register="register"
    :registerPending="registerReq.pending.value"
    :registerError="registerReq.error.value"
    :importFile="importFile"
    :importPending="importReq.pending.value"
    :importError="importReq.error.value"
    :downloadTemplate="downloadTemplate"
    :downloadPending="downloadReq.pending.value"
    :fileInputRef="fileInputRef"
  />
</template>