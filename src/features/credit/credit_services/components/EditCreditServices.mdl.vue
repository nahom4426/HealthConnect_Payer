<script setup lang="ts">
    import ModalParent from "@/components/ModalParent.vue";
    import NewFormParent from "@/components/NewFormParent.vue";
    import CreditServicesForm from "../form/editCreditServicesForm.vue";
    import { closeModal } from "@customizer/modal-x";
    import { toasted } from "@/utils/utils";
    import { ref } from "vue";

    const props = defineProps({
        data: {
            type: Object,
            required: true,
            default: () => ({})
        },
    });

    const error = ref("");
    const dispensingUuid = ref(props.data?.dispensingUuid || "");
</script>

<template>
  <ModalParent>
    <NewFormParent
      class=""
      size="xlg"
      title="Edit Credit"
      subtitle="Update the credit record information below."
    >
      <div class="bg-white rounded-lg">
        <div
          v-if="error"
          class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
        >
          {{ error }}
        </div>

        <CreditServicesForm
          :dispensing-uuid="dispensingUuid"
          :on-updated="props.data?.onUpdated"
          :on-cancel="closeModal"
        />
      </div>
    </NewFormParent>
  </ModalParent>
</template>

<style scoped>
/* Additional styling if needed */
</style>
