<script setup>
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import ProviderForm from "../components/ProviderForm.vue";
import ProviderFormDataProvider from "../components/ProviderFormDataProvider.vue";
import Button from "@/components/Button.vue";
import { useRouter } from "vue-router";
import { closeModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import { ref } from "vue";
import { useProviders } from "../store/providersStore";
const pending = ref(false);

const router = useRouter();
const formDataProvider = ref();
// Initialize the providers store
const providersStore = useProviders();

async function handleSubmit(formValues) {
  try {
    pending.value = true;

    const requiredFields = [
      "providerName",
      "threeDigitAcronym",
      "tinNumber",
      "category",
    ];

    const missingFields = requiredFields.filter((field) => !formValues[field]);
    if (missingFields.length > 0) {
      toasted(false, "Validation Error", `Missing required fields: ${missingFields.join(", ")}`);
      return;
    }

    const formData = new FormData();
    if (formValues.providerLogo) {
      formData.append("logo", formValues.providerLogo);
    }

    const providerData = {
      providerName: formValues.providerName,
      threeDigitAcronym: formValues.threeDigitAcronym,
      providerCode: formValues.providerCode,
      description: formValues.description || "",
      email: formValues.email,
      telephone: `${formValues.telephone}`,
      category: formValues.category,
      level: formValues.level || "PRIMARY",
      address1: formValues.address1 || "",
      address2: formValues.address2 || "",
      address3: formValues.address3 || "",
      state: formValues.state || "Ethiopia",
      country: formValues.country || "Ethiopia",
      latitude: formValues.latitude || 0,
      longitude: formValues.longitude || 0,
      tinNumber: formValues.tinNumber,
      status: formValues.status || "ACTIVE",
    };

    formData.append("provider", JSON.stringify(providerData));

    const result = await formDataProvider.value.register(formData);

    if (result.success) {
      const newProvider = {
        ...result.data,
        logoUrl:
          result.data.logoUrl ||
          (result.data.logoPath
            ? `${
                import.meta.env.VITE_API_URL || "http://localhost:8080/api"
              }/provider/logo/${result.data.logoPath}`
            : null),
      };

      providersStore.add(newProvider);

      if (
        formDataProvider.value.props &&
        formDataProvider.value.props.data &&
        formDataProvider.value.props.data.onAdded
      ) {
        formDataProvider.value.props.data.onAdded(newProvider);
      }

      closeModal();
      router.push("/provider_list");
      toasted(true, "Success", "Provider created successfully!");
    } else {
      // Handle API error response - don't throw, just show toast
      let errorMsg = "Registration failed";
      try {
        const errorObj = typeof result.error === 'string' ? JSON.parse(result.error) : result.error;
        errorMsg = Object.values(errorObj).join(", ");
      } catch (e) {
        errorMsg = result.error?.message || result.error || errorMsg;
      }
      toasted(false, "Error", errorMsg);
    }
  } catch (error) {
    console.error("Submission error:", error);
    // Only show toast if not already shown
    if (!error.handled) {
      let errorMsg = error.message;
      try {
        const errorObj = typeof error.message === 'string' ? JSON.parse(error.message) : error.message;
        errorMsg = Object.values(errorObj).join(", ");
      } catch (e) {
        errorMsg = error.message;
      }
      // toasted(false, "Error", errorMsg);
    }
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
            <!-- Keep sync with outer ref -->
            <ProviderForm
              :pending="pending"
              :onSubmit="handleSubmit"
              :onCancel="() => closeModal()"
            />
        </ProviderFormDataProvider>
      </div>
    </NewFormParent>
  </ModalParent>
</template>
