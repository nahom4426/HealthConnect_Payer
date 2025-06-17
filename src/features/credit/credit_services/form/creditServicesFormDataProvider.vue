<script setup lang="ts">
import { useApiRequest } from "@/composables/useApiRequest";
import { createInsured, importInsuredMembers, downloadInsuredTemplate } from "../api/creditServicesApi";
import { ref } from "vue";
import { toasted } from "@/utils/utils";

interface InsuredData {
  payerUuid: string;
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  gender: string;
  position: string;
  birthDate: string;
  idNumber: string;
  phone: string;
  [key: string]: any; // For additional properties
}

interface RegistrationResponse {
  success: boolean;
  data?: any;
  error?: string;
}

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

// Validate insured data structure
function validateInsuredData(data: any): data is InsuredData {
  const requiredFields = [
    'payerUuid',
    'firstName',
    'fatherName',
    'grandFatherName',
    'gender',
    'position',
    'birthDate',
    'idNumber',
    'phone'
  ];

  return requiredFields.every(field => data[field] !== undefined && data[field] !== null && data[field] !== '');
}

async function register(formData: FormData): Promise<RegistrationResponse> {
  console.log('Registration form data received:', formData);
  
  try {
    const insuredJson = formData.get('insured');
    if (!insuredJson) {
      throw new Error('Missing insured data');
    }

    const insuredData = JSON.parse(insuredJson as string);
    
    if (!validateInsuredData(insuredData)) {
      const missingFields = [
        'payerUuid',
        'firstName',
        'fatherName',
        'grandFatherName',
        'gender',
        'position',
        'birthDate',
        'idNumber',
        'phone'
      ].filter(field => !insuredData[field]);

      throw new Error(`Missing required insured fields: ${missingFields.join(', ')}`);
    }

    return await sendRegistrationRequest(formData);
  } catch (error) {
    console.error('Registration error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Registration failed';
    toasted(false, errorMsg);
    throw error;
  }
}

async function sendRegistrationRequest(formData: FormData): Promise<RegistrationResponse> {
  return new Promise((resolve, reject) => {
    registerReq.send(
      () => createInsured(formData),
      (response) => {
        if (response.success) {
          toasted(true, 'Insured member registered successfully');
          resolve(response);
        } else {
          const errorMsg = response.error || 'Failed to register insured member';
          throw new Error(errorMsg);
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
}

async function importFile(file: File): Promise<any> {
  if (!file) {
    throw new Error('No file selected');
  }

  return new Promise((resolve, reject) => {
    importReq.send(
      () => importInsuredMembers(file),
      (res) => {
        if (res.success) {
          toasted(true, `Successfully imported ${res.data?.count || 0} members`);
          resolve(res);
        } else {
          throw new Error(res.error || 'Import failed');
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
}

function downloadTemplate(): void {
  downloadReq.send(
    () => downloadInsuredTemplate(),
    (res) => {
      try {
        const url = window.URL.createObjectURL(new Blob([res]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'insured_members_template.xlsx');
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);
        toasted(true, 'Template downloaded successfully');
      } catch (error) {
        console.error('Download error:', error);
        throw new Error('Failed to download template');
      }
    },
    (error) => {
      console.error('Download request error:', error);
      toasted(false, 'Failed to download template');
    }
  );
}

defineExpose({
  register,
  importFile,
  downloadTemplate,
  fileInputRef,
  pending: registerReq.pending,
  importPending: importReq.pending,
  downloadPending: downloadReq.pending
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
    :downloadError="downloadReq.error.value"
    :fileInputRef="fileInputRef"
  />
</template>