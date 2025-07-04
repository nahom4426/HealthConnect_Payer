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

const props = defineProps({
  data: {
    type: Object,
  },
});

const api = useApiRequest();
</script>

<template>
  <ModalParent>
    <NewFormParent
      class=""
      size="mdd"
      title="Claim Payment Rejection"
      subtitle="Please provide payment rejection details "
    >
      <Form class="space-y-10" id="paymentForm" v-slot="{ submit }">
        <div class="border p-4 space-y-6">
          <Select
            label="Rejection Reason"
            :options="['ghfgf', 'hghg']"
            :attributes="{
              placeholder: 'Select Rejection Reasons',
              type: 'text',
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
          <Button size="md" type="primary" class="">
            Confirm Payment Rejection
          </Button>
        </div>
      </Form>
    </NewFormParent>
  </ModalParent>
</template>
