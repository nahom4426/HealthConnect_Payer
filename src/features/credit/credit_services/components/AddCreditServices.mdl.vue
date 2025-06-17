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

const auth = useAuthStore();

const pending = ref(false);
const router = useRouter();
const formDataProvider = ref();

async function handleSubmit(formValues: any) {
  try {
    pending.value = true;

    // Validate required fields with better error messages
    const requiredFields = [
      { field: 'payerUuid', name: 'Payer' },
      { field: 'phone', name: 'Phone Number' },
      { field: 'dispensingDate', name: 'Dispensing Date' },
      { field: 'prescriptionNumber', name: 'Prescription Number' },
      { field: 'pharmacyTransactionId', name: 'Pharmacy Transaction ID' },
      { field: 'medicationItems', name: 'Medication Items' }
    ];
    
    const missingFields = requiredFields.filter(fieldInfo => {
      const value = formValues[fieldInfo.field];
      return value === undefined || value === null || value === '' || 
            (Array.isArray(value) && value.length === 0);
    });

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(f => f.name).join(', ');
      throw new Error(`Please fill in all required fields: ${fieldNames}`);
    }

    // Additional validation for medication items
    if (formValues.medicationItems.some(item => !item.serviceUuid || !item.quantity)) {
      throw new Error('All medication items must have both service and quantity specified');
    }

    // Prepare the form data
    const formData = {
      providerUuid: auth.auth?.user?.providerUuid || '', 
      payerUuid: formValues.payerUuid,
      phone: formValues.phone,
      dispensingDate: formValues.dispensingDate,
      prescriptionNumber: formValues.prescriptionNumber,
      pharmacyTransactionId: formValues.pharmacyTransactionId,
      medicationItems: formValues.medicationItems.map(item => ({
        serviceUuid: item.serviceUuid,
        quantity: Number(item.quantity) // Ensure quantity is a number
      }))
    };

    console.log('Submitting credit service data:', formData);
    
    const result = await createCredit(formData);
    
    if (result.success) {
      toasted(true, 'Success', 'Credit service added successfully');
      closeModal();
      router.push('/claim_services');
    } else {
      throw new Error(result.error || 'Failed to add credit service');
    }
  } catch (error) {
    console.error('Submission error:', error);
    
  } finally {
    pending.value = false;
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
          <template #default="{ pending: insuredPending }">
            <CreditServicesForm
              :pending="pending"
              :onSubmit="handleSubmit"
              :onCancel="() => closeModal()"
            />
          </template>
        </creditServicesFormDataProvider>
      </div>
    </NewFormParent>
  </ModalParent>
</template>