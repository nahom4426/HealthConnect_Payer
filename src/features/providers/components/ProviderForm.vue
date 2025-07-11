<script setup lang="ts">
import { useForm } from '@/components/new_form_builder/useForm';
import Form from '@/components/new_form_builder/Form.vue';
import Input from '@/components/new_form_elements/Input.vue';
import Select from '@/components/new_form_elements/Select.vue';
import Textarea from '@/components/new_form_elements/Textarea.vue';
import Button from '@/components/Button.vue';
import { PropType, ref, computed, watch, onMounted } from 'vue';
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
    type: Function as PropType<(values: any) => void>,
    required: true
  },
  onCancel: {
    type: Function as PropType<() => void>,
    required: true
  }
});

// Form data
const providerLogo = ref<File | null>(null);
const providerName = ref('');
const threeDigitAcronym = ref('');
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
  if (props.initialData && Object.keys(props.initialData).length > 0) {
    providerName.value = props.initialData.providerName || '';
    threeDigitAcronym.value = props.initialData.threeDigitAcronym || '';
    category.value = props.initialData.category || '';
    address.value = props.initialData.address1 || '';
    tin.value = props.initialData.tinNumber || '';
    email.value = props.initialData.email || '';
    memo.value = props.initialData.description || props.initialData.memo || '';

    const fullTelephone = props.initialData.telephone || '';
    const possibleCodes = ['+251', '+1', '+44', '+91'];
    const matchedCode = possibleCodes.find(code => fullTelephone.startsWith(code));
    
    if (matchedCode) {
      countryCode.value = matchedCode;
      telephone.value = fullTelephone.slice(matchedCode.length);
    } else {
      countryCode.value = '+251';
      telephone.value = fullTelephone;
    }

    if (props.initialData.logoBase64) {
      previewImage.value = props.initialData.logoBase64;
    } else if (props.initialData.logoUrl) {
      previewImage.value = props.initialData.logoUrl;
    } else if (props.initialData.logoPath) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      previewImage.value = `${baseUrl}/provider/logo/${props.initialData.logoPath}`;
    }
  }
});

// File upload handling
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    providerLogo.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
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
    providerLogo.value = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

function resetForm() {
  providerLogo.value = null;
  providerName.value = '';
  threeDigitAcronym.value = '';
  category.value = '';
  telephone.value = '';
  countryCode.value = '+251';
  address.value = '';
  tin.value = '';
  email.value = '';
  memo.value = '';
  previewImage.value = '';
}

function handleSubmit() {
  const formData = {
    providerName: providerName.value,
    threeDigitAcronym: threeDigitAcronym.value,
    category: category.value,
    telephone: `${countryCode.value}${telephone.value}`,
    address: address.value,
    tinNumber: tin.value,
    email: email.value,
    description: memo.value,
    country: 'Ethiopia'
  };

  // Only include logo if it exists
  if (providerLogo.value) {
    formData.providerLogo = providerLogo.value;
  }

  // If we have a preview image but no new logo file, pass the existing logo data
  if (previewImage.value && !providerLogo.value && props.isEdit) {
    if (props.initialData.logoBase64) {
      formData.logoBase64 = props.initialData.logoBase64;
    } else if (props.initialData.logoPath) {
      formData.logoPath = props.initialData.logoPath;
    }
  }

  props.onSubmit(formData);
}

const categoryOptions = [
  'Government provider',
  'Private provider',
  'NGO provider'
];
</script>

<template>
  <Form
    ref="formEl"
    :inner="false"
    id="provider-form"
    v-slot="{}"
    class="bg-white"
    @submit.prevent="handleSubmit"
  >
    <div class="p-4 space-y-6">
      <!-- Provider Logo -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-[#75778B]">
          Provider logo
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
          
          <div class="flex items-end justify-end mt-2">
            <button 
              v-if="previewImage"
              type="button" 
              @click="browseFiles"
              class="text-xs font-medium text-white bg-[#02676B] ml-2 py-2 px-3 rounded hover:bg-[#014F4F]"
            >
              Change Logo
            </button>
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
          />
        </div>
      </div>
      
      <!-- Provider Name -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-[#75778B]">
          Provider Name <span class="text-red-500">*</span>
        </label>
        <div class="flex w-full gap-2">
          <Input
            v-model="threeDigitAcronym"
            name="threeDigitAcronym"
            validation="required"
            :attributes="{
              placeholder: 'Enter three characters ID ',
              class: 'pr-4 my-2 bg-[#F9F9FD]',
              maxlength: 3,
              pattern: '^[A-Z]{3}$',
              title: 'Three-digit acronym must be uppercase letters (e.g., ABC)',
              required: true
            }"
          />
          <Input
            v-model="providerName"
            name="providerName"
            validation="required"
            :attributes="{
              placeholder: 'Enter provider\'s legal name',
              class: 'pr-[30rem] my-2 bg-[#F9F9FD]',
              required: true
            }"
          />
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
              placeholder: 'Select company category',
              required: true
            }"
          />
        </div>
        
        <!-- Phone Number -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#75778B]">
            Phone Number <span class="text-red-500">*</span>
          </label>
          <div class="flex w-full gap-2">
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
              placeholder: 'Enter company address',
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
          Provider's Email <span class="text-red-500">*</span>
        </label>
        <InputEmail
          v-model="email"
          name="email"
          validation="required|email"
          :attributes="{
            placeholder: 'Email of the provider',
            required: true
          }"
        />
      </div>
      
      <!-- Memo -->
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
        :btn-text="isEdit ? 'Update Provider' : 'Add Provider'"
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