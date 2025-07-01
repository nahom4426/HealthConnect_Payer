<script setup>
import Button from "@/components/Button.vue";
import ModalParent from "@/components/ModalParent.vue";
import Form from "@/components/new_form_builder/Form.vue";
import Textarea from "@/components/new_form_elements/Textarea.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import { useApiRequest } from "@/composables/useApiRequest";

const req = useApiRequest();
</script>
<template>
  <ModalParent>
    <NewFormParent
      size="lg"
      class="flex justify-center bg-white"
      title="Reject Claim Request"
      subtitle="Do you want to reject Patient Girma Lemma's claim?"
    >
      <Form id="clinicalrejectionForm" v-slot="{ submit }">
        <Textarea
          name="description"
          validation="required"
          label="Rejection Reason Remark"
          :attributes="{
            placeholder:
              'Provide a justification for denying the claim request.',
          }"
        />
      </Form>
      <template #bottom>
        <div class="flex gap-5 justify-end items-center w-full">
          <Button
            @click.prevent="closeModal"
            class="flex items-center border border-base-clr text-base font-medium"
            size="lg"
          >
            Cancel
          </Button>
          <button
            :pending="req.pending.value"
            @click.prevent="submit(handleRejection)"
            class="flex rounded px-6 text-white bg-error font-bold items-center"
            size="lg"
          >
            Confirm Rejection
          </button>
        </div>
      </template>
    </NewFormParent>
  </ModalParent>
</template>
