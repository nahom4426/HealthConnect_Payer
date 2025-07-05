<script setup lang="ts">
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import CreditServicesForm from "../form/creditServicesForm.vue";
import { useRouter } from "vue-router";
import { closeModal } from "@customizer/modal-x";
import { ref } from "vue";
import creditServicesFormDataProvider from "../form/creditServicesFormDataProvider.vue";
import { createCreditService } from "../api/creditServicesApi";
import { useAuthStore } from "@/stores/auth";
import { claimServices } from "../store/creditClaimsStore";
import { toasted } from "@/utils/utils";

const claimServicesStore = claimServices();
const auth = useAuthStore();

const formPending = ref(false);
const router = useRouter();
const formDataProvider = ref();

async function handleSubmit(formValues: any) {
  try {
    formPending.value = true;

    // Validate required fields
    if (!formValues.payerUuid || !formValues.dispensingDate || 
        (!formValues.insuredUuid && !formValues.dependantUuid)) {
      throw new Error('Please fill all required fields');
    }

    // Validate at least one medication item exists
    if (!formValues.medicationItems || formValues.medicationItems.length === 0) {
      throw new Error('Please add at least one medication item');
    }

    // Prepare the payload according to the new structure
    const payload = {
      providerUuid: auth.auth?.user?.providerUuid || "",
      payerUuid: formValues.payerUuid,
      insuredUuid: formValues.insuredUuid,
      contractHeaderUuid: formValues.contractHeaderUuid,
      dependantUuid: formValues.dependantUuid,
      phone: formValues.phone,
      patientName: formValues.patientName || `${formValues.employeeId} - ${formValues.phone}`,
      employeeId: formValues.employeeId,
      dispensingDate: formValues.dispensingDate,
      prescriptionNumber: formValues.prescriptionNumber || '',
      pharmacyTransactionId: formValues.pharmacyTransactionId || '',
      primaryDiagnosis: formValues.primaryDiagnosis || '',
      secondaryDiagnosis: formValues.secondaryDiagnosis || '',
      medicationItems: formValues.medicationItems.map((item: any) => ({
        contractDetailUuid: item.contractDetailUuid || '',
        itemType: item.itemType,
        remark: item.remark || '',
        price: item.price || 
              (item.itemType === 'SERVICE' 
                ? (typeof item.paymentAmount === 'string' 
                    ? parseFloat(item.paymentAmount.replace('ETB ', '')) || 0
                    : Number(item.paymentAmount) || 0)
                : item.price || 0),
        quantity: Number(item.quantity) || 1,
        // Include drug-specific fields if present
        ...(item.itemType === 'DRUG' ? {
          route: item.route || 'oral',
          frequency: item.frequency || 'daily',
          dose: item.dose || '1',
          duration: item.duration || '7 days'
        } : {})
      }))
    };

    // Submit the claim
    const result = await createCreditService(payload);

    if (result.success) {
      // Prepare data for store
      const storeData = {
        ...payload,
        invoiceNumber: result.data?.invoiceNumber || `TEMP-${Date.now()}`,
        dispensingUuid: result.data?.dispensingUuid || `TEMP-${Date.now()}`,
        totalAmount: payload.medicationItems.reduce((sum: number, item: any) => 
          sum + ((item.price || 0) * (Number(item.quantity) || 1)), 0),
        patientResponsibility: 0,
        insuranceCoverage: 0,
        branchName: null,
        createdAt: new Date().toISOString(),
        items: payload.medicationItems.map((item: any) => ({
          ...item,
          name: item.itemType === 'SERVICE' ? item.serviceName : item.drugName,
          code: item.itemType === 'SERVICE' ? item.serviceCode : item.drugCode,
        }))
      };

      toasted(true, 'Success', result.data?.message || 'Credit claim added successfully');
      
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
      :title="`Add New Credit Claim`" 
      :subtitle="`To add a new credit claim, please fill out the information in the fields below.`"
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