<script setup lang="ts">
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import CreditServicesForm from "../form/creditServicesForm.vue";
import { useRouter } from 'vue-router';
import { closeModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import { ref } from "vue";
import creditServicesFormDataProvider from "../form/creditServicesFormDataProvider.vue";
import { createCredit } from "../api/creditServicesApi";
import { useAuthStore } from "@/stores/auth";
import { claimServices } from "../store/creditClaimsStore";

const claimServicesStore = claimServices();
const auth = useAuthStore();

const formPending = ref(false); 
const router = useRouter();
const formDataProvider = ref();

async function handleSubmit(formValues: any) {
  try {
     formPending.value = true; // Start loading
    
    const payload = {
      providerUuid: auth.auth?.user?.providerUuid || '',
      payerUuid: formValues.payerUuid,
      phone: formValues.phone,
      patientName: formValues.patientName,
      dispensingDate: formValues.dispensingDate,
      prescriptionNumber: formValues.prescriptionNumber,
      pharmacyTransactionId: formValues.pharmacyTransactionId,
      medicationItems: formValues.medicationItems.map(item => ({
        serviceUuid: item.serviceUuid,
        quantity: Number(item.quantity) || 1
      }))
    };

    const result = await createCredit(payload);
    
    if (result.success) {
      toasted(true, 'Success', result.data.message || 'Credit service added successfully');
      claimServicesStore.add(result.data, { ...formValues });
      closeModal();
      router.push('/credit_services');
    }
  } catch (error) {
    console.error('Submission error:', error);
    toasted(false, 'Error', error.message || 'Failed to add credit service');
  } finally {
    formPending.value = false; // End loading
  }
}
</script>

<template>
  <ModalParent>
    <NewFormParent 
      class="" 
      size="xl" 
      title="Add Credit Service" 
      subtitle="To add a new credit service, please fill out the information in the fields below."
    >
     <div class="bg-white rounded-lg">
        <creditServicesFormDataProvider ref="formDataProvider">
          <template #default="{ pending: dataProviderPending }">
            <CreditServicesForm
              :pending="formPending || dataProviderPending"
              :onSubmit="handleSubmit"
              :onCancel="() => closeModal()"
            />
          </template>
        </creditServicesFormDataProvider>
      </div>
    </NewFormParent>
  </ModalParent>
</template>