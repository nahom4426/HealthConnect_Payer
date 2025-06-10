<script setup lang="ts">
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import ProviderForm from "./ProviderForm.vue";
import Button from "@/components/Button.vue";
import { closeModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import { ref, onMounted, watch } from "vue";
import { updateProvider } from "../api/providerApi";
import { useProviders } from "../store/providersStore";

// In modal-x, props are passed via the 'data' prop
const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

// Initialize the providers store
const providersStore = useProviders();

const error = ref('');
const pending = ref(false);
const providerData = ref({});
const providerUuid = ref('');

// Log props for debugging
onMounted(() => {
  console.log('EditProvider modal mounted with data prop:', props.data);
  
  // Extract the actual props from the data object
  if (props.data) {
    providerUuid.value = props.data.providerUuid || '';
    providerData.value = props.data.provider || {};
    
    console.log('Extracted provider UUID:', providerUuid.value);
    console.log('Extracted provider data:', providerData.value);
  }
});

// Watch for changes in props.data
watch(() => props.data, (newData) => {
  if (newData) {
    console.log('Data prop updated:', newData);
    providerUuid.value = newData.providerUuid || '';
    providerData.value = newData.provider || {};
  }
}, { deep: true });

// Handle form submission
async function handleSubmit(formValues: any) {
  try {
    pending.value = true;
    error.value = '';

    if (!providerUuid.value) {
      throw new Error('Provider UUID is missing');
    }

    const formData = new FormData();

    // Append the logo file if exists
    if (formValues.providerLogo) {
      formData.append('logo', formValues.providerLogo);
    }

    const providerPayload = {
      providerName: formValues.providerName,
      providerCode: formValues.providerCode,
      description: formValues.description || "",
      email: formValues.email,
      telephone: `${formValues.telephone}`, // already combined with country code
      category: formValues.category,
      level: formValues.level || "PRIMARY",
      address1: formValues.address,
      state: formValues.state || "Ethiopia",
      country: formValues.country,
      latitude: formValues.latitude || 0,
      longitude: formValues.longitude || 0,
      tinNumber: formValues.tinNumber,
      status: formValues.status || "ACTIVE",
      providerUuid: providerUuid.value
    };

    // If we have existing logo data and no new logo file, include it in the payload
    if (!formValues.providerLogo) {
      if (providerData.value.logoBase64) {
        providerPayload.logoBase64 = providerData.value.logoBase64;
      } else if (providerData.value.logoPath) {
        providerPayload.logoPath = providerData.value.logoPath;
      }
    }

    formData.append('provider', JSON.stringify(providerPayload));

    const result = await updateProvider(providerUuid.value, formData);

    // ✅ Normalize success check
    const isSuccess = result && (result.success || result.status === 200 || result.status === 'success');

    if (isSuccess) {
      const updatedProvider = {
        ...providerData.value,
        ...formValues,
        providerUuid: providerUuid.value
      };

      // Preserve logo information if not changed
      if (!formValues.providerLogo) {
        if (providerData.value.logoBase64) {
          updatedProvider.logoBase64 = providerData.value.logoBase64;
        }
        if (providerData.value.logoPath) {
          updatedProvider.logoPath = providerData.value.logoPath;
        }
        if (providerData.value.logoUrl) {
          updatedProvider.logoUrl = providerData.value.logoUrl;
        }
      }

      providersStore.update(providerUuid.value, updatedProvider);
      toasted(true, 'Provider updated successfully');

      if (props.data.onUpdated && typeof props.data.onUpdated === 'function') {
        props.data.onUpdated(updatedProvider);
      }

      closeModal();
    } else {
    }
  } catch (err) {
    console.error('Update error:', err);
    error.value = err.message || 'An error occurred while updating provider';
    toasted(false, 'Failed to update provider', error.value);
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
      title="Edit Provider" 
      subtitle="Update the provider information in the fields below."
    >
      <div class="bg-white rounded-lg">
        <div v-if="error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {{ error }}
        </div>
        
        <div v-if="!providerUuid || Object.keys(providerData).length === 0" class="p-4 mb-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg">
          Loading provider data...
        </div>
        
        <ProviderForm
          v-else
          :initial-data="providerData"
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
