<script setup>
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import Form from "@/components/new_form_builder/Form.vue";
import Input from "@/components/new_form_elements/Input.vue";
import Button from "@/components/Button.vue";
import Select from "@/components/new_form_elements/Select.vue";
import Textarea from "@/components/new_form_elements/Textarea.vue";
import { closeModal } from "@customizer/modal-x";
import { approveBatchClaims } from "@/features/claim/api/batchClaim";
import { usePayment } from "@/features/claim/store/paymentStore";
import { toasted } from "@/utils/utils";

const props = defineProps({
  data: {
    type: Object,
  },
});
const paymentStore = usePayment();

const api = useApiRequest();

function handlePayment() {
  api.send(
    () =>
      approveBatchClaims(props.data?.claimUuid, {
        newStatus: "PAYMENT_REQUESTED",
      }),
    (res) => {
      if (res.success) {
        paymentStore.remove(props.data?.claimUuid);
        closeModal();
      }
      toasted(res.success, "Claim Paid Successfully", res.error);
    }
  );
}
</script>

<template>
  <ModalParent>
    <NewFormParent
      class=""
      size="mdd"
      title="Claim Payment"
      subtitle="Please select payment method and payment information."
    >
      <Form class="space-y-10" id="paymentForm" v-slot="{ submit }">
        <div class="border p-4 space-y-6">
          <Select
            label="Payment Method"
            :options="['ghfgf', 'hghg']"
            :attributes="{
              placeholder: 'Select Payment Method ',
              type: 'text',
            }"
          />
          <Input
            label="Payment Reference Number"
            name="firstName"
            :attributes="{
              placeholder: 'Enter Payment Reference Number ',
            }"
          />
          <Textarea
            label="Remark"
            name="remark"
            :attributes="{
              placeholder: 'Write remark for payment ',
            }"
          />
        </div>

        <div class="flex justify-end space-x-4">
          <Button
            @click.prevent="closeModal"
            size="md"
            type="button"
            class="border"
            >Cancel</Button
          >
          <Button
            :pending="api.pending.value"
            @click.prevent="submit(handlePayment)"
            size="md"
            type="primary"
            class=""
          >
            Confirm Claim Payment
          </Button>
        </div>
      </Form>
    </NewFormParent>
  </ModalParent>
</template>
