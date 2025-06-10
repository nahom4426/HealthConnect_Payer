<script setup lang="ts">
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import ProviderForm from "./PayerContractForm.vue";
import ProviderFormDataProvider from "./payerContractFormDataProvider.vue";
import Button from "@/components/Button.vue";
import { useRouter } from 'vue-router';
import { closeModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import { ref } from "vue";
import { usePayerContracts } from "../store/payerContractStore";
const pending = ref(false);

const router = useRouter();
const formDataProvider = ref();
// Initialize the providers store
const payerContractStore = usePayerContracts();

async function handleSubmit(formValues: any) {
  try {
    pending.value = true;

    const requiredFields = [
      'providerName',
      'email',
      'telephone',
      'address',
      'tinNumber',
      'category'
    ];
    
    const missingFields = requiredFields.filter(field => !formValues[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const formData = new FormData();
    if (formValues.providerLogo) {
      formData.append('logo', formValues.providerLogo);
    }

    const providerData = {
      providerName: formValues.providerName,
      providerCode: formValues.providerCode,
      description: formValues.description || "",
      email: formValues.email,
      telephone: `${formValues.telephone}`,
      category: formValues.category,
      level: formValues.level || "PRIMARY",
      address1: formValues.address,
      state: formValues.state || "Ethiopia",
      country: formValues.country || "Ethiopia",
      latitude: formValues.latitude || 0,
      longitude: formValues.longitude || 0,
      tinNumber: formValues.tinNumber,
      status: formValues.status || "ACTIVE"
    };
    
    formData.append('provider', JSON.stringify(providerData));

    console.log('Submitting provider data:', providerData);
    
    const result = await formDataProvider.value.register(formData);
    
    if (result.success) {
      // Process the provider data to include logo information
      const newProvider = {
        ...result.data,
        // If the API returns logoPath but no logoUrl, create a URL
        logoUrl: result.data.logoUrl || (result.data.logoPath ? 
          `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/provider/logo/${result.data.logoPath}` : 
          null)
      };
      
      // Add the new provider to the store
      payerContractStore.add(newProvider);
      
      // Show success message
      
      // Call the onAdded callback if it exists
      if (formDataProvider.value.props && formDataProvider.value.props.data && 
          formDataProvider.value.props.data.onAdded && 
          typeof formDataProvider.value.props.data.onAdded === 'function') {
        formDataProvider.value.props.data.onAdded(newProvider);
      }
      
      closeModal();
      router.push('/provider_list');
    } else {
      throw new Error(result.error || 'Registration failed');
    }
  } catch (error) {
    console.error('Submission error:', error);
    toasted(false, 'Failed to submit form', error.message);
  } finally {
    pending.value = false;
  }
}

</script>

<template>
  <ModalParent>
    <NewFormParent 
      class="" 
      size="lg" 
      title="New Provider" 
      subtitle="To add a new provider, please fill out the information in the fields below."
    >
      <div class="bg-white rounded-lg">
       <ProviderFormDataProvider ref="formDataProvider">
  <template #default="{ pending: providerPending }">
    <!-- Keep sync with outer ref -->
   <ProviderForm
  :pending="pending"
  :onSubmit="handleSubmit"
  :onCancel="() => closeModal()"
/>
  </template>
</ProviderFormDataProvider>

      </div>
    </NewFormParent>
  </ModalParent>
</template>
