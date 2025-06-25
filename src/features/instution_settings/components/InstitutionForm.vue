<script setup lang="ts">
import { ref, onMounted, watch, PropType } from 'vue';
import { useForm } from '@/components/new_form_builder/useForm';
import Form from '@/components/new_form_builder/Form.vue';
import Input from '@/components/new_form_elements/Input.vue';
import Select from '@/components/new_form_elements/Select.vue';
import Textarea from '@/components/new_form_elements/Textarea.vue';
import Button from '@/components/Button.vue';
import { openModal } from '@customizer/modal-x';
import icons from '@/utils/icons';
import InputEmail from '@/components/new_form_elements/InputEmail.vue';
import ModalFormSubmitButton from '@/components/new_form_builder/ModalFormSubmitButton.vue';

const props = defineProps({
  initialData: {
    type: Object as PropType<any>,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  pending: {
    type: Boolean,
    default: false
  },
  onSubmit: {
    type: Function as PropType<(formData: any) => void>,
    required: true
  },
  onCancel: {
    type: Function as PropType<() => void>,
    required: true
  }
});

// Form data
const payerLogo = ref<File | null>(null);
const payerName = ref('');
const DependentCoverage = ref(true);
const category = ref('');
const telephone = ref('');
const countryCode = ref('+251');
const address = ref('');
const tin = ref('');
const email = ref('');
const memo = ref('');
const previewImage = ref('');



// Initialize form data from props
onMounted(() => {
  console.log('PayerForm mounted with initialData:', props.initialData);
  
  if (props.initialData) {
    // Initialize form fields from props
    payerName.value = props.initialData.payerName || '';
    DependentCoverage.value = props.initialData.dependentCoverage || true;
    category.value = props.initialData.category || '';
    email.value = props.initialData.email || '';
    address.value = props.initialData.address || props.initialData.address1 || '';
    tin.value = props.initialData.tinNumber || '';
   
    memo.value = props.initialData.description || props.initialData.memo || '';

    const fullTelephone = props.initialData.telephone || props.initialData.contactPersonPhone || '';
    const possibleCodes = ['+251', '+1', '+44', '+91'];
    const matchedCode = possibleCodes.find(code => fullTelephone.startsWith(code));
    
    if (matchedCode) {
      countryCode.value = matchedCode;
      telephone.value = fullTelephone.slice(matchedCode.length);
    } else {
      countryCode.value = '+251';
      telephone.value = fullTelephone;
    }

    // Handle different logo formats
    if (props.initialData.logoBase64) {
      previewImage.value = props.initialData.logoBase64;
    } else if (props.initialData.logoUrl) {
      previewImage.value = props.initialData.logoUrl;
    } else if (props.initialData.logoPath) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      previewImage.value = `${baseUrl}/institution/logo/${props.initialData.logoPath}`;
    }
  }
  console.log('Form fields initialized:', {
    payerName: payerName.value,
    DependentCoverage: DependentCoverage.value,
    category: category.value,
    telephone: telephone.value,
    countryCode: countryCode.value,
    address: address.value,
    tin: tin.value,
   
    memo: memo.value
  });
});

// File upload handling
function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    payerLogo.value = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    
    console.log("File selected:", file);
  }
}

function browseFiles() {
  const fileInput = document.getElementById('file-upload') as HTMLInputElement;
  fileInput.click();
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  (event.currentTarget as HTMLElement).classList.add('border-primary');
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault();
  (event.currentTarget as HTMLElement).classList.remove('border-primary');
}

function handleDrop(event: DragEvent) {
  event.preventDefault();
  (event.currentTarget as HTMLElement).classList.remove('border-primary');
  
  if (event.dataTransfer?.files.length) {
    const file = event.dataTransfer.files[0];
    payerLogo.value = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

function handleSubmit() {
  // For edit mode, logo might be optional
  if (!props.isEdit && !payerLogo.value) {
    console.error('Institution logo is required for new institutions');
    return;
  }

  // Create form data object with all the values
  const formData = {
    payerName: payerName.value,
    DependentCoverage: DependentCoverage.value,
    category: category.value,
    telephone: `${countryCode.value}${telephone.value}`,
    address: address.value,
    tinNumber: tin.value,
   email: email.value,
    description: memo.value
  };

  // Add the logo if it exists
  if (payerLogo.value) {
    formData.payerLogo = payerLogo.value;
    console.log("Including logo in form submission:", payerLogo.value);
  } else {
    console.log("No logo file to include in form submission");
  }

  console.log("InstitutionForm submitting data:", formData);
  
  // Call the parent's onSubmit function with the form data
  props.onSubmit(formData);
}

function resetForm() {
  payerLogo.value = null;
  payerName.value = '';
  email.value = '';
  category.value = '';
  telephone.value = '';
  countryCode.value = '+251';
  address.value = '';
  tin.value = '';
 
  memo.value = '';
  previewImage.value = '';
}

const categoryOptions = [
  'Insurance Company',
  'Government Agency',
  'Private company',
  'Non-Profit Organization'
];
</script>

<template>
  <Form
    ref="formEl"
    :inner="false"
    id="institution-form"
    v-slot="{}"
    class="bg-white"
    @submit.prevent="handleSubmit"
  >
    <div class="p-4 space-y-6">
      <!-- Payer Logo -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-[#75778B]">
          Payer logo <span v-if="!isEdit" class="text-red-500">*</span>
        </label>
        <div 
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
          @drop="handleDrop"
          class="border-[1px] bg-[#F6F7FA] border-dashed border-[#75778B] rounded-md items-center justify-center p-6 flex flex-col cursor-pointer hover:border-primary"
        >
          <div v-if="previewImage" class="mb-4 relative w-full">
            <img :src="previewImage" alt="Logo preview" class="h-20 w-auto object-contain mx-auto" />
          </div>
          
          <div class="flex items-end justify-center mt-2">
            <div class="flex items-center ml-4 rounded-md px-3 py-1">
              <button 
                v-if="isEdit"
                type="button" 
                @click="browseFiles"
                class="text-xs font-medium text-white bg-[#02676B] ml-2 py-2 px-3 hover:underline"
              >
                Change Logo
              </button>
            </div>
          </div>

          <template v-if="!previewImage">
            <p class="text-sm text-[#75778B]">Drag your logo file to start uploading</p>
            <p class="text-sm text-[#75778B] mt-1">or</p>
            <button 
              type="button" 
              @click="browseFiles"
              class="mt-2 px-4 py-2 text-sm font-medium text-[#75778B] border border-[#75778B] rounded-md hover:bg-gray-50"
            >
              Browse images
            </button>
          </template>
          <input 
            id="file-upload" 
            type="file" 
            accept="image/*" 
            class="hidden" 
            @change="handleFileUpload"
            :required="!isEdit"
          />
        </div>
      </div>
      
      <!-- Payer Name -->
   <div class="flex gap-6">
  <!-- Payer Name -->
  <div class="w-full gap-3 space-y-2">
    <label class="block text-sm font-medium text-[#75778B]">
      Payer Name <span class="text-red-500">*</span>
    </label>
    <Input
      v-model="payerName"
      name="payerName"
      validation="required"
      :attributes="{
        placeholder: 'Enter Payer\'s legal name',
        required: true
      }"
    />
  </div>

  <!-- Dependent Coverage -->
<div class="px-2 space-y-2">
    <label class="block text-sm font-medium text-[#75778B]">
      Dependent Coverage <span class="text-red-500">*</span>
    </label>
    <div class="flex gap-4 mt-1">
      <label
        class="flex items-center gap-2 pr-8 pl-4 py-4 rounded-lg cursor-pointer "
        :class="DependentCoverage === true ? 'bg-[#DFF1F1] text-[#02676B] border-[#02676B]' : 'bg-[#F9F9FD] text-gray-600 border-gray-300'"
      >
        <input
          type="radio"
          v-model="DependentCoverage"
          :value="true"
          class="sr-only"
        />
        <div
          class="w-5 h-5 flex items-center justify-center rounded-md border"
          :class="DependentCoverage === true ? 'bg-[#02676B] text-white' : 'border-gray-400'"
        >
          <svg v-if="DependentCoverage === true" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clip-rule="evenodd"/>
          </svg>
        </div>
        <span class="text-sm font-medium">Yes</span>
      </label>

      <label
        class="flex items-center gap-2 pr-8 pl-4 py-4  cursor-pointer "
        :class="DependentCoverage === false ? 'bg-[#DFF1F1] text-[#02676B] border-[#02676B]' : 'bg-[#F9F9FD] text-gray-600 border-gray-300'"
      >
        <input
          type="radio"
          v-model="DependentCoverage"
          :value="false"
          class="sr-only"
        />
        <div
          class="w-5 h-5 flex items-center justify-center rounded-md border"
          :class="DependentCoverage === false ? 'bg-[#02676B] text-white' : 'border-gray-400'"
        >
          <svg v-if="DependentCoverage === false" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clip-rule="evenodd"/>
          </svg>
        </div>
        <span class="text-sm font-medium">No</span>
      </label>
    </div>
  </div>
</div>
      
      <!-- Two column layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Category -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#75778B]">
            Category <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="category"
            name="category"
            validation="required"
            :options="categoryOptions"
            :attributes="{
              placeholder: 'Select Payer category',
              required: true
            }"
          />
        </div>
        
        <!-- Phone Number -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#75778B]">
            Phone Number <span class="text-red-500">*</span>
          </label>
          <div class="flex w-full gap-2 ">
            <Select
              v-model="countryCode"
              name="countryCode"
              :options="['+251', '+1', '+44', '+91']"
              :attributes="{
                class: 'pr-2 my-2 bg-[#F9F9FD]',
                required: true
              }"
            />
            <Input
              v-model="telephone"
              name="phoneNumber"
              validation="required"
              :attributes="{
                placeholder: 'Enter phone number',
                class: 'pr-40 my-2 bg-[#F9F9FD]',
                required: true
              }"
            />
          </div>
        </div>
      </div>
      
      <!-- Two column layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Address -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#75778B]">
            Address <span class="text-red-500">*</span>
          </label>
          <Input
            v-model="address"
            name="address"
            validation="required"
            :attributes="{
              placeholder: 'Enter Payer address',
              required: true
            }"
          />
        </div>
        
        <!-- TIN -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#75778B]">
            TIN <span class="text-red-500">*</span>
          </label>
          <Input
            v-model="tin"
            name="tin"
            validation="required"
            :attributes="{
              placeholder: 'Enter TIN',
              required: true
            }"
          />
        </div>
      </div>
      
      <!-- Admin User -->
     <div class="space-y-2">
        <label class="block text-sm font-medium text-[#75778B]">
          company's email  <span class="text-red-500">*</span>
        </label>
        <InputEmail
          v-model="email"
          name="email"
          validation="required|email"
          :attributes="{
            placeholder: 'Email of the Company',
            required: true
          }"
        />
      </div>
      
      <!-- Description -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-[#75778B]">
          Description
        </label>
        <Textarea
          v-model="memo"
          name="memo"
          :attributes="{
            placeholder: 'Write any description',
            rows: 3
          }"
        />
      </div>
    </div>
    
    <!-- Form Actions -->
    <div class="pt-4 px-6 border-t border-[#DFDEF2] flex justify-end space-x-4">
      <Button
        type="button"
        @click="props.onCancel"
        class="text-[#75778B] px-6 py-4 border-[1px] border-[#75778B] rounded-lg hover:bg-gray-50"
        :disabled="pending"
      >
        Cancel
      </Button>
      <ModalFormSubmitButton
        :pending="pending"
        :btn-text="isEdit ? 'Update Payer' : 'Add Payer'"
        class="bg-[#02676B] hover:bg-[#014F4F] text-white px-6 py-3 border-[#02676B] hover:border-[#014F4F]"
      />
    </div>
  </Form>
</template>

<style scoped>
/* Additional styling for the form */
:deep(.form-control) {
  @apply bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5;
}

:deep(.form-select) {
  @apply bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5;
}

:deep(.form-textarea) {
  @apply bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5;
}
</style>




