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

    <Form id="detailForm" class="grid grid-cols-3 gap-6">
      <Input
        label="Full Name"
        name="name"
        :value="props.data?.name || ''"
        :attributes="{
          placeholder: 'Full Name',
          disabled: true,
        }"
      />
      <Input
        label="Institution Name"
        :value="props.data?.institutionName || ''"
        name="institutionName"
        :attributes="{
          placeholder: 'Institution Name',
          disabled: true,
        }"
      />
      <Input
        label="Insurance Name"
        :value="props.data?.payerName || ''"
        name="insuranceName"
        :attributes="{
          placeholder: 'Insurance Name',
          disabled: true,
        }"
      />
      <Input
        label="Phone Number"
        name="phone"
        :value="props.data?.phone || ''"
        :attributes="{
          placeholder: 'Phone Number',
          disabled: true,
        }"
      />
      <Input
        label="Insured Id "
        name="assuredId"
        :value="props.data?.insuranceId || ''"
        :attributes="{
          placeholder: 'Assured Id ',
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

      <Input
        label="Contract Code"
        :value="props.data?.contractCode || ''"
        name="contractCode"
        :attributes="{
          placeholder: 'Contract Code',
          disabled: true,
        }"
      />
      <Input
        label="Email"
        :value="props.data?.email || ''"
        name="email"
        :attributes="{
          placeholder: 'Email',
          disabled: true,
        }"
      />
      <Input
        label="Status"
        :value="props.data?.status || ''"
        name="status"
        :attributes="{
          placeholder: 'Status',
          disabled: true,
        }"
      />
    </Form>
  </div>
</template>
