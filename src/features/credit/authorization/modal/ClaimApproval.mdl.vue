<script setup>
import { useForm } from "@/components/new_form_builder/useForm";
import { useApiRequest } from "@/composables/useApiRequest";
import { claimApproval } from "../api/claim";
import { closeModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import Form from "@/components/new_form_builder/Form.vue";
import Button from "@/components/Button.vue";
import Textarea from "@/components/new_form_elements/Textarea.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const props = defineProps({
  data: String,
});
const api = useApiRequest();
const { submit } = useForm("claimApproval");

function handleSubmit({ values }) {
  api.send(
    () => claimApproval(props.data),
    (res) => {
      if (res.success) {
        closeModal();
        toasted(res.success, "Claim Approved Successfully"); // Updated success message
        router.push(`/claim-approval`);
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
      title="Claim Approval"
      subtitle="Request a new claim for the credits you provided."
    >
      <Form
        :inner="false"
        id="claimApproval"
        class="bg-white rounded-lg shadow-sm"
      >
        <Textarea
          name="description"
          Label="Remark"
          :attributes="{ placeholder: 'Write your remark here' }"
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
            Confirm Approval
          </Button>
        </div>
      </template>
    </NewFormParent>
  </ModalParent>
</template>
