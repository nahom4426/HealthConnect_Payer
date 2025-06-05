<script setup lang="ts">
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import InstitutionForm from "./InstitutionForm.vue";
import Button from "@/components/Button.vue";
import { closeModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import { ref, onMounted, watch } from "vue";
import { updateInstitution } from "../api/institutionSettingsApi";
import { useInstitutions } from "../store/InstitutionsStore";

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

const error = ref('');
const pending = ref(false);
const payerData = ref({});
const payerUuid = ref('');
const payersStore = useInstitutions();

onMounted(() => {
  console.log('EditPayer modal mounted with data prop:', props.data);
  if (props.data) {
    payerUuid.value = props.data.payerUuid || props.data.institutionUuid || "";
    payerData.value = props.data.payer || props.data.institution || {};
    console.log('Extracted payer UUID:', payerUuid.value);
    console.log('Extracted payer data:', payerData.value);
  }
});

watch(
  () => props.data,
  (newData) => {
    if (newData) {
      console.log('Data prop updated:', newData);
      payerUuid.value = newData.payerUuid || newData.institutionUuid || "";
      payerData.value = newData.payer || newData.institution || {};
    }
  },
  { deep: true }
);
async function handleSubmit(formValues: any) {
  try {
    pending.value = true;
    error.value = "";
    
    console.log("Received form values:", formValues);

    if (!payerUuid.value) {
      throw new Error("Payer UUID is missing");
    }

    // Create FormData for multipart request
    const formData = new FormData();
    
    // Create the payer payload object based on the API requirements
    const payerRequestObj = {
      payerName: formValues.payerName || "",
      tinNumber: formValues.tinNumber || 0,
      email: formValues.email || "",
      description: formValues.description || "",
      telephone: formValues.telephone || "",
      category: formValues.category || "",
      address1: formValues.address || "",
      state: formValues.state || "Ethiopia",
      country: formValues.country || "Ethiopia",
      latitude: 0,
      longitude: 0,
      referralType: "",
      referredBy: "",
      status: "ACTIVE"
    };

    // Log the payload to verify data is present
    console.log("Constructed payerRequestObj:", payerRequestObj);

    // Append payer data as JSON string with key 'payerRequest'
    formData.append('payerRequest', JSON.stringify(payerRequestObj));

    // Append the logo file if exists with key 'logo'
    if (formValues.payerLogo) {
      console.log("Appending logo file to FormData:", formValues.payerLogo);
      formData.append('logo', formValues.payerLogo);
    } else {
      console.log("No new logo file to append");
      // If we're in edit mode and there's no new logo, we need to send an empty value
      // to match the Swagger UI's "Send empty value" checkbox
      formData.append('logo', new Blob([], { type: 'application/octet-stream' }));
    }

    // Log all keys in FormData to verify
    for (const pair of formData.entries()) {
      console.log(`FormData contains: ${pair[0]}: ${pair[1]}`);
    }

    console.log("Submitting FormData with payerRequest:", payerRequestObj);
    console.log("Logo included:", formValues.payerLogo ? "Yes" : "No");

    const result = await updateInstitution(payerUuid.value, formData);

    // Success handling (same as Provider)
    if (result?.success) {
      const updatedPayer = {
        ...payerData.value,
        ...formValues,
        payerUuid: payerUuid.value
      };

      if (formValues.payerLogo) {
        updatedPayer.logoBase64 = null;
        updatedPayer.logoPath = result.logoPath || payerData.value.logoPath;
        updatedPayer.logoUrl = result.logoUrl || payerData.value.logoUrl;
      }

      payersStore.update(payerUuid.value, updatedPayer);
      toasted(true, "Payer updated successfully");

      if (props.data.onUpdated) {
        props.data.onUpdated(updatedPayer);
      }

      closeModal();
    } else {
      throw new Error(result?.error || "Update failed");
    }
  } catch (err) {
    console.error("Update error:", err);
    error.value = err.message || "Update failed";
    toasted(false, "Failed to update payer", error.value);
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
      title="Edit Payer" 
      subtitle="Update the payer information in the fields below."
    >
      <div class="bg-white rounded-lg">
        <div v-if="error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {{ error }}
        </div>
        
        <div v-if="!payerUuid || Object.keys(payerData).length === 0" class="p-4 mb-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg">
          Loading payer data...
        </div>
        
        <InstitutionForm
          v-else
          :initial-data="payerData"
          :is-edit="true"
          :pending="pending"
          :onSubmit="handleSubmit"
          :onCancel="() => closeModal()"
        />
      </div>
    </NewFormParent>
  </ModalParent>
</template>

<style scoped>
/* Additional styling if needed */
</style>
