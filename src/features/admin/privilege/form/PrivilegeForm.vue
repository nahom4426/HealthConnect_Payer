<script setup>
import Form from "@/components/new_form_builder/Form.vue";
import Input from "@/components/new_form_elements/Input.vue";
import { ref, watch, onMounted } from 'vue';

const props = defineProps({
  privilege: {
    type: Object,
    default: () => ({})
  }
});

// Define emits for form field updates
const emit = defineEmits([
  'update:privilegeName',
  'update:privilegeDescription',
  'update:privilegeCategory'
]);

// Create local refs for form values
const privilegeName = ref(props.privilege?.privilegeName || '');
const privilegeDescription = ref(props.privilege?.privilegeDescription || '');
const privilegeCategory = ref(props.privilege?.privilegeCategory || '');

// Watch for changes in props.privilege
watch(() => props.privilege, (newVal) => {
  if (newVal) {
    privilegeName.value = newVal.privilegeName || '';
    privilegeDescription.value = newVal.privilegeDescription || '';
    privilegeCategory.value = newVal.privilegeCategory || '';
  }
}, { deep: true, immediate: true });

// Watch for local changes and emit them
watch(privilegeName, (val) => emit('update:privilegeName', val));
watch(privilegeDescription, (val) => emit('update:privilegeDescription', val));
watch(privilegeCategory, (val) => emit('update:privilegeCategory', val));

// Emit initial values on mount
onMounted(() => {
  emit('update:privilegeName', privilegeName.value);
  emit('update:privilegeDescription', privilegeDescription.value);
  emit('update:privilegeCategory', privilegeCategory.value);
});
</script>
<template>
  <Form
    class="grid grid-cols-4 gap-4 grid-rows-3"
    :inner="false"
    id="privilegeForm"
  >
    <Input
      name="privilegeName"
      validation="required|min:3|max:50"
      label="Privilege Name"
      v-model="privilegeName"
      :attributes="{
        placeholder: 'Enter Privilege (3-50 characters)',
        minlength: 3,
        maxlength: 50
      }"
    />
    <Input
      validation="required|min:3|max:255"
      class="col-span-2"
      name="privilegeDescription"
      v-model="privilegeDescription"
      label="Privilege Description"
      :attributes="{
        placeholder: 'Enter Privilege description (3-255 characters)',
        minlength: 3,
        maxlength: 255
      }"
    />
    <Input
      v-model="privilegeCategory"
      name="privilegeCategory"
      label="Privilege Category"
      validation="required|min:3|max:50"
      :attributes="{
        placeholder: 'Enter Privilege Category (3-50 characters)',
        minlength: 3,
        maxlength: 50
      }"
    />
  </Form>
</template>
