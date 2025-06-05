<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DefaultPage from '@/components/DefaultPage.vue';
import InstitutionForm from '../components/InstitutionForm.vue';
import InstitutionFormDataProvider from '../components/InstitutionFormDataProvider.vue';
import { toasted } from '@/utils/utils';

const router = useRouter();
const formDataProvider = ref();

// Handle form submission
function handleSubmit(register, values) {
  console.log('Form submitted with values:', values);
  
  // Check if any required fields are missing
  const requiredFields = [
    'institutionName', 'tinNumber', 'email', 'telephone', 
    'state', 'address1', 'address2', 'address3', 'description'
  ];
  
  const missingFields = requiredFields.filter(field => !values[field]);
  if (missingFields.length > 0) {
    console.error('Missing required fields:', missingFields);
    return; // Prevent submission if fields are missing
  }
  
  // Call the register function with the values
  register(values)
    .then(() => {
      router.push('/active_institution');
    })
    .catch(error => {
      console.error('Registration error:', error);
    });
}
</script>

<template>
  <DefaultPage title="Register Institution">
    <div class="bg-white rounded-lg shadow-sm">
      <InstitutionFormDataProvider ref="formDataProvider">
        <template v-slot="{ register, pending }">
          <InstitutionForm 
            :pending="pending" 
            :onSubmit="(values) => {
              // Only call handleSubmit if form validation passed
              handleSubmit(register, values);
            }"
            :onCancel="() => router.push('/institution-settings/institutions')"
          />
        </template>
      </InstitutionFormDataProvider>
    </div>
  </DefaultPage>
</template>

<style scoped>
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.transition-shadow {
  transition: box-shadow 0.3s ease;
}
</style>
