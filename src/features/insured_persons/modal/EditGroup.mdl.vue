<script setup>
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import { closeModal } from "@customizer/modal-x";
import { ref } from "vue";
import Form from "@/components/new_form_builder/Form.vue";
import Input from "@/components/new_form_elements/Input.vue";
import Button from "@/components/Button.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { updateGroup } from "../api/groupServiceApi";
import Textarea from "@/components/new_form_elements/Textarea.vue";
import Select from "@/components/new_form_elements/Select.vue";
import { useFamily } from "../store/FamilyStore";

const props = defineProps({
  data: Object,
});
const familyStore = useFamily();

const groupApi = useApiRequest();
function handleUpdateGroup({ values }) {
  delete props.data?.payerUuid;
  groupApi.send(
    () => updateGroup(props.data?.groupUuid, { ...props.data, ...values }),
    (res) => {
      if (res.success) {
        familyStore.update(props.data?.groupUuid, { ...props.data, ...values });
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
      title="Update Employee / Family Group"
      subtitle="Create a new group for employees or their families."
    >
      <Form class="grid grid-cols-2 gap-4" id="updateGroup" v-slot="{ submit }">
        <Input
          name="groupName"
          label="Enter Group Name"
          :value="props.data?.groupName"
          validation="required"
          :attributes="{
            placeholder: 'Enter Group Name',
          }"
        />

        <Select
          :value="props.data?.type"
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
          :value="props.data?.groupDescription"
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
            @click.prevent="submit(handleUpdateGroup)"
          >
            Update Group
          </Button>
        </div>
      </Form>
    </NewFormParent>
  </ModalParent>
</template>
