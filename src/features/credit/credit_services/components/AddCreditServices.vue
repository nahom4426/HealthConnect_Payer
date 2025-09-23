<template>
  <div class="bg-white p-4 rounded-xl space-y-6 box-border">
    <div class="bg-white rounded-lg">
      <creditServicesFormDataProvider ref="formDataProvider">
        <template #default="{ pending: dataProviderPending }">
          <CreditServicesForm
            ref="formRef"
            :pending="req.pending.value || dataProviderPending"
            @submit="handleSubmit"
          />
        </template>
      </creditServicesFormDataProvider>
    </div>

    <div class="mt-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-md">
      <p class="text-sm text-blue-700">
        <strong>Note:</strong> Please ensure all required fields are filled and medication items are added before submission.
      </p>
    </div>

    <!-- <Button
      size="md"
      class="flex justify-center w-full items-center mt-3 gap-3 box-border text-white bg-primary"
      :pending="req.pending.value"
      @click="submitForm"
    >
      Submit Credit Claim
    </Button> -->
  </div> 
</template>

<script setup>
import CreditServicesForm from "../form/creditServicesForm.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { claimServices } from "../store/creditClaimsStore";
import { toasted } from "@/utils/utils";
import { createCreditService } from "../api/creditServicesApi";
import { useRouter } from "vue-router";
import Button from "@/components/Button.vue";
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import creditServicesFormDataProvider from "../form/creditServicesFormDataProvider.vue";

const req = useApiRequest();
const claimServicesStore = claimServices();
const router = useRouter();
const auth = useAuthStore();
const formRef = ref();

// Extract and validate form values
async function getFormValues() {
  if (!formRef.value) throw new Error("Form reference not available");

  const formState = formRef.value.getFormState ? formRef.value.getFormState() : {};
  console.log("DEBUG → Raw form state:", JSON.stringify(formState, null, 2));

  if (!formState.selectedContract) throw new Error("Please select a contract");
  if (!formState.selectedEmployee) throw new Error("Please select an employee");
  if (!formState.dispensingDate) throw new Error("Please select a dispensing date");

  const medicationItems = [
    ...(formState.addedServices || []),
    ...(formState.addedDrugs || []),
  ];
  if (medicationItems.length === 0) throw new Error("Please add at least one service or drug");

  // FIX: Proper file handling - check all possible file locations (child may expose different names)
  let attachmentFile = null;
  let medicalServiceFiles = [];

  // Direct attachment file (single)
  if (formState.attachmentFile instanceof File) {
    attachmentFile = formState.attachmentFile;
  }

  // Generic files array (some components expose 'files')
  if ((!attachmentFile) && Array.isArray(formState.files) && formState.files.length > 0) {
    attachmentFile = formState.files[0];
    medicalServiceFiles = formState.files.slice(1);
  }

  // medicalServiceFiles exposed directly from child
  if (Array.isArray(formState.medicalServiceFiles) && formState.medicalServiceFiles.length > 0) {
    // prefer real File objects
    medicalServiceFiles = [...medicalServiceFiles, ...formState.medicalServiceFiles.filter(f => f instanceof File)];
    // if no primary attachment yet, take the first
    if (!attachmentFile && formState.medicalServiceFiles[0] instanceof File) {
      attachmentFile = formState.medicalServiceFiles[0];
    }
  }

  // medicalServicePreviews may contain { file } objects
  if (Array.isArray(formState.medicalServicePreviews) && formState.medicalServicePreviews.length > 0) {
    const previewFiles = formState.medicalServicePreviews.map(p => p?.file).filter(f => f instanceof File);
    medicalServiceFiles = [...medicalServiceFiles, ...previewFiles];
    if (!attachmentFile && previewFiles.length > 0) attachmentFile = previewFiles[0];
  }

  // Map medication items to API expected shape (provide sensible fallbacks for serviceId)
  const mappedMedicationItems = medicationItems.map(item => {
    // try to find the original added service entry (if we only received a minimal item)
    const found = (formState.addedServices || []).find(a => a.contractDetailUuid === (item.contractDetailUuid || item.id));
    return {
      contractDetailUuid: item.contractDetailUuid || item.id || null,
      // prefer serviceId from the actual addedServices entry, then item.serviceId, then fallback to uuid/code
      serviceId: (found && (found.serviceId || found.serviceUuid)) || item.serviceId || item.serviceUuid || item.serviceCode || null,
      itemType: item.itemType || "SERVICE",
      remark: item.remark || "",
      price: Number(item.price || item.contractPrice || item.unitPrice || 0),
      quantity: Number(item.quantity || 1),
    };
  });

  const values = {
    contractHeaderUuid: formState.selectedContract,
    insuredUuid: formState.selectedEmployee.insuredUuid,
    dependantUuid: formState.selectedEmployee.isDependant
      ? formState.selectedEmployee.dependantUuid
      : null,
    primaryDiagnosis: formState.primaryDiagnosis || "",
    secondaryDiagnosis: formState.secondaryDiagnosis || "",
    isInsurance: !!formState.isInsurancePayer,
    packageUuid: formState.selectedPackage || null,
    dispensingDate: formState.dispensingDate,
    medicationItems: mappedMedicationItems,
  };

  console.log("DEBUG → Processed form values:", values);
  console.log("DEBUG → Attachment file:", attachmentFile ? attachmentFile.name : "None");
  console.log("DEBUG → Medical service files:", medicalServiceFiles.length);
  return { values, attachmentFile, medicalServiceFiles };
}

async function handleSubmit() {
  try {
    const { values, attachmentFile, medicalServiceFiles } = await getFormValues();

    // Build FormData
    const formData = new FormData();
    formData.append('request', JSON.stringify(values));

    // Append files: prefer real files; if none, append empty string to keep field present
    let appendedAny = false;
    if (attachmentFile instanceof File) {
      formData.append('attachment', attachmentFile, attachmentFile.name);
      appendedAny = true;
    }

    medicalServiceFiles.forEach((f, idx) => {
      if (f instanceof File) {
        formData.append('attachment', f, f.name || `attachment_${idx}`);
        appendedAny = true;
      }
    });

    if (!appendedAny) {
      formData.append('attachment', '');
    }

    // Debug entries
    console.log('DEBUG → FormData entries before submit:');
    for (const pair of formData.entries()) {
      const [k, v] = pair;
      if (v instanceof File || v instanceof Blob) {
        console.log(' ', k + ':', 'FILE(', v instanceof File ? v.name : 'blob', ',', v.type || 'unknown', ')');
      } else {
        console.log(' ', k + ':', v);
      }
    }

    console.log('DEBUG → Submitting to API...');
    await req.send(
      () => createCreditService(formData),
      (response) => {
        if (response.success) {
          toasted(true, 'Credit claim submitted successfully');
          router.push('/credit_services')
        } else {
          toasted(false, response.error || 'Failed to submit credit claim');
        }
      }
    );
  } catch (err) {
    console.error('Submit error:', err);
    toasted(false, err.message || 'Failed to submit form');
  }
}

function submitForm() {
  if (formRef.value?.submit) formRef.value.submit();
  else handleSubmit();
}
</script>