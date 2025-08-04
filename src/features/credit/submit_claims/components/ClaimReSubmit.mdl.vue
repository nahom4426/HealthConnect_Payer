<script setup>
import { useForm } from "@/components/new_form_builder/useForm";
import { useApiRequest } from "@/composables/useApiRequest";
// import { claimRejection } from "../api/claim"; // Changed from claimApproval to claimRejection
import { closeModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import Form from "@/components/new_form_builder/Form.vue";
import Button from "@/components/Button.vue";
import Textarea from "@/components/new_form_elements/Textarea.vue";
import { claimRejection } from "../../authorization/api/claim";
import { useRouter } from "vue-router";
const router = useRouter();
const props = defineProps({
  data: String,
});
const api = useApiRequest();
const { submit, values } = useForm("claimResubmission"); // Changed form ID

function handleSubmit({ values }) {
  api.send(
    () => claimRejection(props.data, { remark: values.description }), // Added remark to API call
    (res) => {
      if (res.success) {
        closeModal();
       toasted(res.success, "Claim Resubmitted Successfully"); // Resubmit success message
 router.push("/create_claims");
      }
    }
  );
}


</script>

<template>
  <ModalParent>
    <NewFormParent
      class=""
      size="md"
      title="Claim Resubmission"
      subtitle="Provide a reason for resubmitting this claim."
    >
      <Form
        :inner="false"
        id="claimResubmission"
        class="bg-white rounded-lg shadow-sm"
      >
        <Textarea
          name="description"
          Label="Resubmission Remark"
          :attributes="{ placeholder: 'Write your resubmission reason here' }"
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
            Confirm Resubmission
          </Button>
        </div>
      </template>
    </NewFormParent>
  </ModalParent>
</template>