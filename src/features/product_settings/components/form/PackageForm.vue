<script setup>
import Form from "@/components/new_form_builder/Form.vue";
import Input from "@/components/new_form_elements/Input.vue";
import Textarea from "@/components/new_form_elements/Textarea.vue";
import Select from "@/components/new_form_elements/Select.vue";
import { computed } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  formId: {
    type: String,
    default: "packageForm"
  }
});

console.log('PackageForm props:', props);

// Correctly handle the doubly-nested data structure
const packageData = computed(() => {
  // First check if props.data exists and has a data property
  if (props.data && props.data.data) {
    return {
      categoryCode: props.data.data.categoryCode || '',
      categoryName: props.data.data.categoryName || '',
      description: props.data.data.description || '',
      minLimit: props.data.data.minLimit || 0,
      maxLimit: props.data.data.maxLimit || 0,
      status: props.data.data.status || 'ACTIVE',
      gender: props.data.data.gender || 'BOTH'
    };
  }
  // Fallback to direct props.data if no nesting
  return {
    categoryCode: props.data.categoryCode || '',
    categoryName: props.data.categoryName || '',
    description: props.data.description || '',
    minLimit: props.data.minLimit || 0,
    maxLimit: props.data.maxLimit || 0,
    status: props.data.status || 'ACTIVE',
    gender: props.data.gender || 'BOTH'
  };
});

const genderOptions = ['BOTH', 'FEMALE', 'MALE'];
const categoryOptions = ['Medical', 'Dental', 'Vision', 'Pharmacy', 'Mental Health'];
const statusOptions = ['ACTIVE', 'INACTIVE'];
</script>

<template>
  <Form 
    class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4" 
    :inner="false" 
    :id="formId" 
    v-slot="{}"
  >
    <!-- Package Info Section -->
    <div class="md:col-span-2">
      <Input
        name="categoryName"
        validation="required|min:3|max:50"
        label="Package Name"
        :value="packageData.categoryName"
        :attributes="{
          placeholder: 'e.g. Premium Medical Coverage',
          maxlength: 50
        }"
      />
    </div>
  <div class="md:col-span-1">
      <Input
        name="categoryCode"
        validation="required|min:3|max:50"
        label="Package Code"
        :value="packageData.categoryCode"
        :attributes="{
          placeholder: 'e.g. PREM-1234',
          maxlength: 50
        }"
      />
    </div>
    <!-- <Select
      name="packageCategory"
      validation="required"
      label="Package Category"
      :value="packageData.packageCategory"
      :options="categoryOptions"
      :attributes="{
        placeholder: 'Select category',
      }"
    /> -->
 <Select
      name="status"
      validation="required"
      label="Package Status"
      :value="packageData.status"
      :options="statusOptions"
    />
    <!-- <Select
      name="gender"
      validation="required"
      label="Gender Applicability"
      :value="packageData.gender"
      :options="genderOptions"
    /> -->

    <!-- Limits Section -->
    <!-- <div class="md:col-span-2 border-t pt-4">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Coverage Limits</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          name="minLimit"
          validation="required|numeric|min_value:0"
          label="Minimum Coverage"
          :value="packageData.minLimit"
          :attributes="{
            placeholder: '0',
            min: '0',
            step: '100'
          }"
          prefix="$"
        />

        <Input
          name="maxLimit"
          validation="required|numeric|min_value:1"
          label="Maximum Coverage"
          :value="packageData.maxLimit"
          :attributes="{
            placeholder: '10000',
            min: '1',
            step: '100'
          }"
          prefix="$"
        />
      </div>
    </div> -->

    <!-- Description -->
    <div class="md:col-span-2">
      <Textarea
        name="description"
        validation="max:500"
        label="Package Description"
        :value="packageData.description"
        :attributes="{
          placeholder: 'Describe what this package covers...',
          rows: 3,
          maxlength: 500
        }"
      />
    </div>

    <!-- Status -->
   
  </Form>
</template>