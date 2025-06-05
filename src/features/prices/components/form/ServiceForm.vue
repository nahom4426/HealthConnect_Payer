<script setup>
import Form from "@/components/new_form_builder/Form.vue";
import Input from "@/components/new_form_elements/Input.vue";

const props = defineProps({
  services: {
    type: Object,
    Required: false,
  },
});
</script>
<template>
  <Form
    class="grid grid-cols-3 gap-4"
    :inner="false"
    id="serviceForm"
    v-slot="{}"
  >
    <div class="grid grid-cols-10 col-span-3 gap-4">
      <div class="col-span-3">
        <Input
          class="col-span-3"
          name="itemCode"
          validation="required"
          label="Item Code"
          :value="props.services?.itemCode || ''"
          :attributes="{
            placeholder: 'Item Code',
          }"
        />
      </div>
      <div class="col-span-3">
        <Input
          name="item"
          validation="required"
          label="Item"
          :value="props.services?.item || ''"
          :attributes="{
            placeholder: 'Item',
          }"
        />
      </div>
      <div class="col-span-3">
        <Input
          name="category"
          validation="required"
          label="Category"
          :value="props.services?.category || ''"
          :attributes="{
            placeholder: 'Category',
          }"
        />
      </div>
    </div>
    <Input
      name="subCategory"
      validation="required"
      label="Sub Category"
      :value="props.services?.subCategory || ''"
      :attributes="{
        placeholder: 'Sub Category',
      }"
    />

    <Input
      name="price"
      validation="required"
      label="Price"
      :value="props.services?.price || ''"
      :attributes="{
        placeholder: 'Price',
      }"
    />
  </Form>
</template>
