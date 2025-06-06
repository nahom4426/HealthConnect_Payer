<script setup lang="ts">
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import InstitutionForm from "../components/InstitutionForm.vue";
import InstitutionFormDataProvider from "../components/InstitutionFormDataProvider.vue";
import Button from "@/components/Button.vue";
import icons from "@/utils/icons";
import { useRouter } from 'vue-router';
import { closeModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import { ref } from "vue";

const router = useRouter();
const formDataProvider = ref();

async function handleSubmit(formValues: any) {
  try {
    // Verify required fields exist
    const requiredFields = [
      'payerName',
      'email',
      'address',
      'tinNumber',
      'category',
      'telephone'
    ];
    
    const missingFields = requiredFields.filter(field => !formValues[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Create FormData for multipart request
    const formData = new FormData();
    
    // Append the logo file if exists
    if (formValues.payerLogo) {
      formData.append('logo', formValues.payerLogo);
    }

    // Append payer data as JSON string
    const payerData = {
      payerName: formValues.payerName,
      description: formValues.memo || "",
      email: formValues.email,
      telephone: `${formValues.telephone}`,
      category: formValues.category,
      address1: formValues.address,
      address2: formValues.address2 || "",
      address3: formValues.address3 || "",
      state: formValues.state || "Ethiopia",
      country: formValues.country || "Ethiopia",
      latitude: formValues.latitude || 0,
      longitude: formValues.longitude || 0,
      tinNumber: formValues.tinNumber,
      status: formValues.status || "ACTIVE"
    };
    
    formData.append('payerRequest', JSON.stringify(payerData));

    console.log('Submitting payer data:', payerData);
    
    const result = await formDataProvider.value.register(formData);
    
    if (result.success) {
      closeModal();
      router.push('/payer_list');
    } else {
      throw new Error(result.error || 'Registration failed');
    }
  } catch (error) {
    console.error('Submission error:', error);
    toasted(false, 'Failed to submit form', error.message);
  }
}
</script>

<template>
  <ModalParent>
    <NewFormParent 
      class="" 
      size="lg" 
      title="New Payer" 
      subtitle="To add a new payer, please fill out the information in the fields below."
    >
      <div class="bg-white rounded-lg">
        <InstitutionFormDataProvider ref="formDataProvider">
          <template #default="{ pending }">
            <InstitutionForm
              :pending="pending"
              :onSubmit="handleSubmit"
              :onCancel="() => closeModal()"
            />
          </template>
        </InstitutionFormDataProvider>
      </div>
    </NewFormParent>
  </ModalParent>
</template>