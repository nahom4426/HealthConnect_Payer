<script setup>
import Form from "@/components/new_form_builder/Form.vue";
import Input from "@/components/new_form_elements/Input.vue";
import icons from "@/utils/icons";
const props = defineProps({
  data: {
    type: Object,
  },
});
</script>

<template>
  <div>
    <div
      tabindex="0"
      class="relative overflow-hidden isolate cursor-pointer h-80 w-full bg-grey-300 flex rounded-md"
    >
      <label
        class="grid place-items-center absolute inset-0 z-0 flex-1 cursor-pointer"
      >
        <i class="*:size-36 *:text-grey-2" v-html="icons.image" />
        <input
          @change="showChangedImage"
          :ref="setRef"
          type="file"
          class="hidden"
        />
      </label>
    </div>

    <Form id="dependentForm" class="grid grid-cols-2 gap-6">
      <Input
        label="Dependent First Name"
        name="dependantFirstName"
        :value="props.data?.dependantFirstName || ''"
        :attributes="{
          placeholder: 'Dependent First Name',
          disabled: true,
        }"
      />
      <Input
        label="Dependant Father Name"
        :value="props.data?.dependantFatherName || ''"
        name="dependantFatherName"
        :attributes="{
          placeholder: 'Dependant Father Name',
          disabled: true,
        }"
      />
      <Input
        label="Garnd Father Name"
        :value="props.data?.dependantGrandFatherName || ''"
        name="dependantGrandFatherName"
        :attributes="{
          placeholder: 'dependant GrandFather Name',
          disabled: true,
        }"
      />
      <Input
        label="Dependant Status"
        name="dependantStatus"
        :value="props.data?.dependantStatus || ''"
        :attributes="{
          placeholder: 'Dependant Status',
          disabled: true,
        }"
      />
      <Input
        label="Relationship"
        name="relationShip"
        :value="props.data?.relationship || ''"
        :attributes="{
          placeholder: 'Relationship',
          disabled: true,
        }"
      />
    </Form>
  </div>
</template>
