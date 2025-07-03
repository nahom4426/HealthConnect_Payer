<script setup>
import Button from "@/components/Button.vue";
import ModalParent from "@/components/ModalParent.vue";
import Form from "@/components/new_form_builder/Form.vue";
import Textarea from "@/components/new_form_elements/Textarea.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { approveBatchClaims } from "@/features/claim/api/batchClaim";
import { approveClaim } from "@/features/claim/api/clinicalApi";
import { useClinical } from "@/features/claim/store/clinicalStore";
import { useSubmittedClaimStore } from "@/features/claim/store/submittedClaimStore";
import { toasted } from "@/utils/utils";
import { closeModal, openModal } from "@customizer/modal-x";
import { ref } from "vue";
const props = defineProps({
  data: String,
});
const clinicalStore = useClinical();
const isOnDetailPage = ref(props.data?.insuredPersonUuid ? true : false);
console.log(isOnDetailPage.value);

const api = useApiRequest();

const title = ref(
  isOnDetailPage.value
    ? `Do you want to reject Patient ${props.data?.insuredPersonName}'s claim`
    : "Do you want to reject this batch"
);
//
const submittedClaimStore = useSubmittedClaimStore();
function handleDelete() {
  if (!isOnDetailPage.value) {
    api.send(
      () =>
        approveBatchClaims(props.data?.claimUuid, { newStatus: "REJECTED" }),
      (res) => {
        if (res.success) {
          submittedClaimStore.remove(props.data?.claimUuid);
          closeModal();
        }
        toasted(res.success, "Claim Rejected Successfully", res.error);
      }
    );
  } else {
    api.send(
      () =>
        approveClaim(props.data?.dispensingUuid, {
          newStatus: "REJECTED",
        }),
      (res) => {
        if (res.success) {
          clinicalStore.remove(props.data?.services?.dispensingUuid);
          closeModal();
        }
        toasted(res.success, "Claim Rejected Successfully", res.error);
      }
    );
  }
}
</script>
<template>
  <ModalParent>
    <NewFormParent
      size="md"
      class="flex justify-center bg-white"
      title="Reject Claim Request"
      :subtitle="title"
      >{{ console.log(props.data) }}
      <Form
        class="grid grid-cols-1 gap-4"
        id="clinicalrejectionForm"
        v-slot="{ submit }"
      >
        <Textarea
          name="description"
          label="Rejection Reason Remark"
          :attributes="{
            placeholder:
              'Provide a justification for denying the claim request.',
          }"
        />
        <div class="flex gap-5 justify-end items-center w-full">
          <Button
            @click.prevent="closeModal"
            class="flex items-center border border-base-clr text-base font-medium"
            size="lg"
          >
            Cancel
          </Button>
          <Button
            :pending="api.pending.value"
            @click.prevent="submit(handleDelete)"
            type="primary"
            class="flex rounded px-6 text-base font-bold items-center !text-white"
            size="lg"
          >
            Approve Rejection
          </Button>
        </div>
      </Form>
    </NewFormParent>
  </ModalParent>
</template>
