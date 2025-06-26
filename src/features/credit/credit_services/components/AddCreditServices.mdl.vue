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

    // Validate required fields
    if (!formValues.payerUuid || !formValues.insuredUuid || !formValues.dispensingDate) {
      throw new Error('Please fill all required fields');
    }

    // Common payload for both services and drugs
    const commonPayload = {
      providerUuid: auth.auth?.user?.providerUuid || '',
      payerUuid: formValues.payerUuid,
      payerName: formValues.payerName, 
      insuredUuid: formValues.insuredUuid,
      phone: formValues.phone,
      patientName: formValues.patientName || `${formValues.employeeId} - ${formValues.phone}`,
      employeeId: formValues.employeeId,
      dispensingDate: formValues.dispensingDate,
      prescriptionNumber: formValues.prescriptionNumber || '',
      pharmacyTransactionId: formValues.pharmacyTransactionId || '',
      primaryDiagnosis: formValues.primaryDiagnosis || '',
      secondaryDiagnosis: formValues.secondaryDiagnosis || ''
    };

    let result;
    let storeData;

    if (formValues.medicationItems) {
      // Validate services
      if (formValues.medicationItems.length === 0) {
        throw new Error('Please add at least one service');
      }

      // Handle service submission
      const servicePayload = {
        ...commonPayload,
        medicationItems: formValues.medicationItems.map((item: any) => {
          const paymentAmount = typeof item.paymentAmount === 'string' 
            ? parseFloat(item.paymentAmount.replace('ETB ', '')) || 0
            : Number(item.paymentAmount) || 0;
            
          return {
            serviceUuid: item.serviceUuid,
            remark: item.remark || '', // Ensure remark is preserved
            quantity: Number(item.quantity) || 1,
            paymentAmount: paymentAmount,
            primaryDiagnosis: formValues.primaryDiagnosis || '',
            secondaryDiagnosis: formValues.secondaryDiagnosis || ''
          };
        })
      };
      result = await createCreditService(servicePayload);

      // Prepare data for store
      storeData = {
        ...commonPayload,
        invoiceNumber: result.data?.invoiceNumber || `TEMP-${Date.now()}`,
        dispensingUuid: result.data?.dispensingUuid || `TEMP-${Date.now()}`,
        totalAmount: formValues.medicationItems.reduce((sum: number, item: any) => {
          const paymentAmount = typeof item.paymentAmount === 'string' 
            ? parseFloat(item.paymentAmount.replace('ETB ', '')) || 0
            : Number(item.paymentAmount) || 0;
          return sum + (paymentAmount * (Number(item.quantity) || 1));
        }, 0),
        patientResponsibility: 0,
        insuranceCoverage: 0,
        branchName: null,
        createdAt: new Date().toISOString(),
        type: 'service',
        items: formValues.medicationItems.map((item: any) => ({
          ...item,
          type: 'service',
          name: item.serviceName,
          code: item.serviceCode,
          price: typeof item.paymentAmount === 'string' 
            ? parseFloat(item.paymentAmount.replace('ETB ', '')) || 0
            : Number(item.paymentAmount) || 0,
          remark: item.remark || '' // Ensure remark is preserved in store
        }))
      };
     } else if (formValues.drugItems) {
      // Validate drugs
      if (formValues.drugItems.length === 0) {
        throw new Error('Please add at least one drug');
      }

      const invalidDrug = formValues.drugItems.find((item: any) => 
        !item.route || !item.frequency || !item.dose || !item.duration
      );
      if (invalidDrug) {
        throw new Error('Please fill all drug administration details');
      }

      // Handle drug submission
      const drugPayload = {
        ...commonPayload,
        drugItems: formValues.drugItems.map((item: any) => ({
          drugUuid: item.drugUuid,
          quantity: Number(item.quantity) || 1,
          totalPrice: (item.price || 0) * (Number(item.quantity) || 1),
          route: item.route || 'oral',
          frequency: item.frequency || 'daily',
          dose: item.dose || '1',
          duration: item.duration || '7 days',
          remark: item.remark || ''
        }))
      };
      result = await createCreditDrug(drugPayload);

      // Prepare data for store
      storeData = {
        ...commonPayload,
        invoiceNumber: result.data?.invoiceNumber || `TEMP-${Date.now()}`,
        dispensingUuid: result.data?.dispensingUuid || `TEMP-${Date.now()}`,
        totalAmount: formValues.drugItems.reduce((sum: number, item: any) => 
          sum + ((item.price || 0) * (Number(item.quantity) || 1)), 0),
        patientResponsibility: 0,
        insuranceCoverage: 0,
        branchName: null,
        createdAt: new Date().toISOString(),
        type: 'drug',
        items: formValues.drugItems.map((item: any) => ({
          ...item,
          type: 'drug',
          name: item.drugName,
          code: item.drugCode,
          price: item.price || 0
        }))
      };
    } else {
      throw new Error('No items added - must have either services or drugs');
    }

    if (result.success) {
      const successMessage = formValues.medicationItems 
        ? 'Credit service added successfully' 
        : 'Credit drug added successfully';
      
      toasted(true, 'Success', result.data?.message || successMessage);
      
      // Add to store
      claimServicesStore.add(storeData);
      
      closeModal();
      router.push('/credit_services');
    } else {
      throw new Error(result.data?.message || 'Submission failed');
    }
  } catch (error: any) {
    console.error('Submission error:', error);
    const errorMessage = error.response?.data?.message || 
                       error.message || 
                       'Failed to process credit request';
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
      :title="`Add New Credit services/Drug`" 
      :subtitle="`To add a new credit services/Drug, please fill out the information in the fields below.`"
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