<script setup>
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import { closeModal } from "@customizer/modal-x";
import Form from "@/components/new_form_builder/Form.vue";
import Input from "@/components/new_form_elements/Input.vue";
import Button from "@/components/Button.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { createGroup } from "../api/groupServiceApi";
import Textarea from "@/components/new_form_elements/Textarea.vue";
import Select from "@/components/new_form_elements/Select.vue";
import { useAuthStore } from "@/stores/auth";
import { useFamily } from "../store/FamilyStore";

const authStore = useAuthStore();
const groupApi = useApiRequest();
const familyStore = useFamily();
function handleCreateGroup({ values }) {
  values.status = "ACTIVE";
  groupApi.send(
    () => createGroup(authStore.auth?.user?.payerUuid, values),
    (res) => {
      if (res.success) {
        familyStore.add({ groupUuid: res.data?.groupUuid, ...values });
        closeModal();
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
      title="New Employee / Family Group"
      subtitle="Create a new group for employees or their families."
    >
      <Form
        class="grid grid-cols-2 gap-4"
        id="groupNameForm"
        v-slot="{ submit }"
      >
        <Input
          name="groupName"
          label="Enter Group Name"
          validation="required"
          :attributes="{
            placeholder: 'Enter Group Name',
          }"
        />
        <Select
          name="type"
          label="Select Type"
          validation="required"
          :attributes="{
            type: 'text',
            placeholder: 'Select Type',
          }"
          :options="['EMPLOYEE', 'DEPENDENT']"
        />
        <Textarea
          class="col-span-2"
          name="groupDescription"
          label="Group Description"
          validation="required"
          :attributes="{
            placeholder: 'Enter Group Description',
          }"
        />

        <div class="flex col-span-2 justify-end gap-4">
          <Button @click.prevent="closeModal()" class="border border-base-clr">
            Cancel
          </Button>

          <Button
            :pending="groupApi.pending.value"
            size="md"
            class="!text-white"
            type="primary"
            @click.prevent="submit(handleCreateGroup)"
          >
            Create Group
          </Button>
        </div>
      </Form>
    </NewFormParent>
  </ModalParent>
</template>
