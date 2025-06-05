<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import DefaultPage from '@/components/DefaultPage.vue';
import ProviderForm from '../components/ProviderForm.vue';
import ProviderFormDataProvider from '../components/ProviderFormDataProvider.vue';
import { toasted } from '@/utils/utils';

const router = useRouter();
const formDataProvider = ref();

// Handle form submission
function handleSubmit(register, values) {
  console.log('Form submitted with values:', values);
  
  // Call the register function with the values
  register(values)
    .then(() => {
      router.push('/providers/active');
    })
    .catch(error => {
      console.error('Registration error:', error);
    });
}
</script>

<template>
  <DefaultPage title="Register Provider">
    <div class="bg-white rounded-lg shadow-sm p-6">
      <ProviderFormDataProvider ref="formDataProvider">
        <template v-slot="{ register, pending }">
          <ProviderForm 
            :pending="pending" 
            @submit="(values) => handleSubmit(register, values)"
          />
        </template>
      </ProviderFormDataProvider>
    </div>
  </DefaultPage>
</template>

<style scoped>
.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>
