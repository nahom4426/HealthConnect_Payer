<script setup lang="ts">
import { useApiRequest } from "@/composables/useApiRequest";
import { registerInstitution, importInstitutions, downloadInstitutionTemplate } from "../api/institutionSettingsApi";
import { ref } from "vue";
import { toasted } from "@/utils/utils";
import { updateInstitution } from "../api/institutionSettingsApi";
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
  const payerJson = formData.get('payerRequest');
  if (!payerJson) {
    const errorMsg = 'Missing payer data';
    toasted(false, errorMsg);
    return Promise.reject(new Error(errorMsg));
  }

  try {
    const payerData = JSON.parse(payerJson as string);
    
    const requiredPayerFields = [
      'payerName', 
      'email', 
      'telephone',
      'address1', 
      'tinNumber', 
      'category'
    ];

    const missingFields = requiredPayerFields.filter(field => {
      const value = payerData[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      const errorMsg = `Missing required payer fields: ${missingFields.join(', ')}`;
      console.error('Validation failed:', errorMsg);
      toasted(false, errorMsg);
      return Promise.reject(new Error(errorMsg));
    }

    return sendRegistrationRequest(formData);
  } catch (error) {
    console.error('Error parsing payer data:', error);
    toasted(false, 'Invalid payer data format');
    return Promise.reject(error);
  }
}

function sendRegistrationRequest(formData: FormData) {
  console.log('Sending registration request with form data');
  
  return new Promise((resolve, reject) => {
    registerReq.send(
      () => registerInstitution(formData), // Make sure your API function accepts FormData
      (response) => {
        if (response.success) {
          console.log('Registration successful:', response.data);
          toasted(true, 'Payer registered successfully');
          resolve(response);
        } else {
          console.error('Registration failed:', response.error);
          const errorMsg = response.error || 'Failed to register payer';
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
      () => importInstitutions(file),
      (res) => {
        if (res.success) {
          toasted(true, 'Institutions imported successfully');
          resolve(res);
        } else {
          toasted(false, res.error || 'Failed to import institutions');
          reject(new Error(res.error || 'Failed to import institutions'));
        }
      }
    );
  });
}
function update(uuid: string, formData: FormData) {
  if (!uuid) {
    const errorMsg = 'Missing payer UUID';
    toasted(false, errorMsg);
    return Promise.reject(new Error(errorMsg)); 
  }

  const payerJson = formData.get('payerRequest');
  if (!payerJson) {
    const errorMsg = 'Missing payer data';
    toasted(false, errorMsg);
    return Promise.reject(new Error(errorMsg));
  }

  try {
    const payerData = JSON.parse(payerJson as string);
    
    const requiredPayerFields = [
      'payerName', 
      'email', 
      'telephone',
      'address1', 
      'tinNumber', 
      'category'
    ];

    const missingFields = requiredPayerFields.filter(field => {
      const value = payerData[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      const errorMsg = `Missing required payer fields: ${missingFields.join(', ')}`;
      console.error('Validation failed:', errorMsg);
      toasted(false, errorMsg);
      return Promise.reject(new Error(errorMsg));
    }

    return new Promise((resolve, reject) => {
      registerReq.send(
        () => updateInstitution(uuid, formData), // <-- Call your API here
        (response) => {
          if (response.success) {
            toasted(true, 'Payer updated successfully');
            resolve(response);
          } else {
            const errorMsg = response.error || 'Failed to update payer';
            toasted(false, errorMsg);
            reject(new Error(errorMsg));
          }
        }
      );
    });
  } catch (error) {
    console.error('Error parsing payer data:', error);
    toasted(false, 'Invalid payer data format');
    return Promise.reject(error);
  }
}

function downloadTemplate() {
  downloadReq.send(
    () => downloadInstitutionTemplate(),
    (res) => {
      try {
        const url = window.URL.createObjectURL(new Blob([res]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'institution_template.xlsx');
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