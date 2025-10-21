<script setup>
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import { closeModal } from "@customizer/modal-x";
import CreditServicesDetailsForm from "../form/CreditServicesDetailsForm.vue";

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({}),
  },
});

function handleClose() {
  closeModal();
}
</script>

<template>
  <ModalParent>
    <NewFormParent
      class=""
      size="lg"
      title="Credit Service Details"
      subtitle="View credit service information"
    >
      <div class="bg-white rounded-lg">
        <CreditServicesDetailsForm
          :dispensingUuid="props.data?.dispensingUuid"
          :onCancel="handleClose"
        />
      </div>
    </NewFormParent>
  </ModalParent>
</template>

<style scoped>
/* Additional styling if needed */
</style>
