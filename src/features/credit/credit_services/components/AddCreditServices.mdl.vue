<script setup lang="ts">
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import CreditServicesForm from "../form/creditServicesForm.vue";
import { useRouter } from 'vue-router';
import { closeModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import { ref } from "vue";
import creditServicesFormDataProvider from "../form/creditServicesFormDataProvider.vue";
import { createCreditService, createCreditDrug } from "../api/creditServicesApi";
import { useAuthStore } from "@/stores/auth";
import { claimServices } from "../store/creditClaimsStore";

const claimServicesStore = claimServices();
const auth = useAuthStore();

const formPending = ref(false); 
const router = useRouter();
const formDataProvider = ref();
async function handleSubmit(formValues: any) {
  try {
    formPending.value = true;

    // Get payer name from your form or payer list
  

    // Common payload for both services and drugs
    const commonPayload = {
      providerUuid: auth.auth?.user?.providerUuid || '',
      payerUuid: formValues.payerUuid,
      payerName: formValues. payerName, // Add payerName here
      phone: formValues.phone,
      patientName: formValues.patientName || 'Unknown Patient',
      employeeId: formValues.employeeId,
      dispensingDate: formValues.dispensingDate,
      prescriptionNumber: formValues.prescriptionNumber,
      pharmacyTransactionId: formValues.pharmacyTransactionId
    };

    let result;

    if (formValues.medicationItems) {
      // Handle service submission
      const servicePayload = {
        ...commonPayload,
        medicationItems: formValues.medicationItems.map((item: any) => ({
          serviceUuid: item.serviceUuid,
          primaryDiagnosis: item.primaryDiagnosis || '',
          secondaryDiagnosis: item.secondaryDiagnosis || '',
          paymentAmount: item.paymentAmount || 0
        }))
      };
      result = await createCreditService(servicePayload);
    } else if (formValues.drugItems) {
      // Handle drug submission
      const drugPayload = {
        ...commonPayload,
        drugItems: formValues.drugItems.map((item: any) => ({
          drugUuid: item.drugUuid,
          quantity: Number(item.quantity) || 1,
          totalPrice: item.totalPrice || (item.price || 0) * (Number(item.quantity) || 1),
          route: item.route || 'oral',
          frequency: item.frequency || 'daily',
          dose: item.dose || '1',
          duration: item.duration || '7 days',
          itemType: 'DRUG'
        }))
      };
      result = await createCreditDrug(drugPayload);
    } else {
      throw new Error('Invalid items format - must have either medicationItems or drugItems');
    }

    if (result.success) {
      const successMessage = formValues.medicationItems 
        ? 'Credit service added successfully' 
        : 'Credit drug added successfully';
      
      toasted(true, 'Success', result.data.message || successMessage);
      
      // Prepare data for store
      const storeData = {
        ...commonPayload,
        invoiceNumber: result.data.invoiceNumber || `TEMP-${Date.now()}`,
        dispensingUuid: result.data.dispensingUuid || `TEMP-${Date.now()}`,
        totalAmount: formValues.medicationItems 
          ? formValues.medicationItems.reduce((sum: number, item: any) => sum + (parseFloat(item.paymentAmount?.replace('ETB ', '') || '0') || 0), 0)
          : formValues.drugItems.reduce((sum: number, item: any) => sum + ((item.price || 0) * (Number(item.quantity) || 1)), 0),
        patientResponsibility: 0, // Adjust as needed
        insuranceCoverage: 0, // Adjust as needed
        branchName: null, // Adjust as needed
        createdAt: new Date().toISOString(),
        type: formValues.medicationItems ? 'service' : 'drug',
        medicationItems: formValues.medicationItems,
        drugItems: formValues.drugItems
      };

      // Add to store immediately
      claimServicesStore.add(storeData);
      
      closeModal();
      router.push('/credit_services');
    }
  } catch (error: any) {
    console.error('Submission error:', error);
    const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to add credit item';
    toasted(false, 'Error', errorMessage);
  } finally {
    formPending.value = false;
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