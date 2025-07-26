<script setup>
import { useForm } from "@/components/new_form_builder/useForm";
import { useApiRequest } from "@/composables/useApiRequest";
import { claimRejection } from "../api/claim"; // Changed from claimApproval to claimRejection
import { closeModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import Form from "@/components/new_form_builder/Form.vue";
import Button from "@/components/Button.vue";
import Textarea from "@/components/new_form_elements/Textarea.vue";

const props = defineProps({
  data: String,
});
const api = useApiRequest();
const { submit, values } = useForm("claimRejection"); // Changed form ID

function handleSubmit({ values }) {
  api.send(
    () => claimRejection(props.data, { remark: values.description }), // Added remark to API call
    (res) => {
      if (res.success) {
        closeModal();
      }
      toasted(res.success, "Claim Rejected Successfully", res.error); // Updated success message
    }
  );
}
</script>

<template>
  <ModalParent>
    <NewFormParent
      class=""
      size="md"
      title="Claim Rejection"
      subtitle="Provide a reason for rejecting this claim."
    > <!-- Updated subtitle -->
      <Form
        :inner="false"
        id="claimRejection"
        class="bg-white rounded-lg shadow-sm"
      >
        <Textarea
          name="description"
          Label="Rejection Remark"
          :attributes="{ placeholder: 'Write your rejection reason here' }"
          :required="true"
        />
      </Form>
      <template #bottom>
        <div class="flex gap-4 w-full justify-end items-center">
          <Button @click="closeModal()" class="py-2 border border-base-clr">
            Cancel
          </Button>

          <Button
            :pending="api.pending.value"
            type="primary"
            @click.prevent="submit(handleSubmit)"
            class="py-2 border !text-white"
          >
            Confirm Rejection <!-- Changed button text -->
          </Button>
        </div>
      </template>
    </NewFormParent>
  </ModalParent>
</template>