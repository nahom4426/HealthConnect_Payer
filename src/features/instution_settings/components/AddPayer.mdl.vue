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
import { useInstitutions } from "../store/InstitutionsStore";

const payersStore = useInstitutions();
const pending = ref(false);
const router = useRouter();
const formDataProvider = ref();
function cleanPhoneNumber(phone: string): string {
  // Remove a leading 0 after the country code (e.g., +2510xxxx → +251xxxx)
  return phone.replace(/^(\+\d{3})0/, '$1');
}
async function handleSubmit(formValues: any) {
  try {
    pending.value = true;

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

    const formData = new FormData();
    if (formValues.payerLogo) {
      formData.append('logo', formValues.payerLogo);
    }

 const payerData = {
  payerName: formValues.payerName,
  DependentCoverage: formValues.DependentCoverage,
  description: formValues.description || formValues.memo,
 telephone: cleanPhoneNumber(formValues.telephone),
  category: formValues.category,
  email: formValues.email,
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
      const newPayer = {
        ...result.data,
        logoUrl: result.data.logoUrl || (result.data.logoPath
          ? `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/payer/logo/${result.data.logoPath}`
          : null)
      };

      // Add to store
      payersStore.add(newPayer);

      // Optional callback
      if (
        formDataProvider.value.props?.data?.onAdded &&
        typeof formDataProvider.value.props.data.onAdded === 'function'
      ) {
        formDataProvider.value.props.data.onAdded(newPayer);
      }

      closeModal();
      router.push('/payer_list');
    } else {
      throw new Error(result.error || 'Registration failed');
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
      size="lg" 
      title="New Payer" 
      subtitle="To add a new payer, please fill out the information in the fields below."
    >
      <div class="bg-white rounded-lg">
        <InstitutionFormDataProvider ref="formDataProvider">
          <template #default="{ pending : payerPending }">
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