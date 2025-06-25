<script setup>
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import { ref } from "vue";
import Form from "@/components/new_form_builder/Form.vue";
import Textarea from "@/components/new_form_elements/Textarea.vue";
import { closeModal } from "@customizer/modal-x";
function handleSubmit({ values }) {}
</script>

<template>
  <ModalParent>
    <NewFormParent
      class=""
      size="lg"
      title="Claim Approval"
      subtitle="Request a new claim for the credits you provided."
    >
      <Form
        v-slot="{ submit }"
        id="employee-form"
        class="bg-white rounded-lg shadow-sm"
      >
        <Textarea
          name="description"
          Label="Remark"
          :attributes="{ placeholder: 'Write your remark here' }"
        />
      </Form>
      <template #bottom>
        <div class="flex gap- w-full justify-end items-center">
          <Button
            type=""
            @click="closeModal()"
            class="py-2 border border-base-clr"
          >
            Cancel
          </Button>

          <Button
            type="primary"
            @click="submit(handleSubmit)"
            class="py-2 border !text-white"
          >
            Confirm Approval
          </Button>
        </div>
      </template>
    </NewFormParent>
  </ModalParent>
</template>
