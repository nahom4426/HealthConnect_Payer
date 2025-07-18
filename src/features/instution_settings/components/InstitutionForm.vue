<script setup>
import { ref, onMounted, watch, computed } from 'vue';
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
import { 
  ethiopianRegions, 
  citiesByRegion, 
  subCitiesByCity, 
  getCitiesByRegion, 
  getSubCitiesByCity 
} from '@/features/instution_settings/utils/ethiopianLocations';
import { toasted } from "@/utils/utils";
const props = defineProps({
  initialData: {
    type: Object,
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
    type: Function,
    required: true
  },
  onCancel: {
    type: Function ,
    required: true
  }
});

// Form data
const payerLogo = ref(null); 
const payerName = ref('');
const dependantCoverage = ref(true);
const category = ref('');
const telephone = ref('');
const countryCode = ref('+251');
const state = ref('Addis Ababa');
const address3 = ref(''); // City
const address2 = ref(''); // Sub City
const address1 = ref(''); // Woreda
const tin = ref('');
const email = ref('');
const memo = ref('');
const previewImage = ref('');

// Computed properties for dynamic dropdowns
const availableCities = computed(() => {
  return getCitiesByRegion(state.value);
});

const availableSubCities = computed(() => {
  return getSubCitiesByCity(address3.value);
});

const isAddisAbaba = computed(() => {
  return state.value === 'Addis Ababa';
});

// Watch for state changes to reset city and sub-city
watch(state, (newState) => {
  address3.value = '';
  address2.value = '';
  address1.value = '';
});

// Watch for city changes to reset sub-city
watch(address3, (newCity) => {
  address2.value = '';
  address1.value = '';
});

// Initialize form data from props
onMounted(() => {
  console.log('PayerForm mounted with initialData:', props.initialData);
  
  if (props.initialData) {
    // Initialize form fields from props
    payerName.value = props.initialData.payerName || '';
    dependantCoverage.value = props.initialData.dependantCoverage || true;
    category.value = props.initialData.category || '';
    email.value = props.initialData.email || '';
    state.value = props.initialData.state || 'Addis Ababa';
    address3.value = props.initialData.address3 || ''; // City
    address2.value = props.initialData.address2 || ''; // Sub City
    address1.value = props.initialData.address1 || ''; // Woreda
    tin.value = props.initialData.tinNumber || '';
    memo.value = props.initialData.description || props.initialData.memo || '';

    const fullTelephone = props.initialData.telephone || props.initialData.contactPersonPhone || '';
    const possibleCodes = ['+251'];
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
    dependantCoverage: dependantCoverage.value,
    category: category.value,
    telephone: telephone.value,
    countryCode: countryCode.value,
    state: state.value,
    address3: address3.value,
    address2: address2.value,
    address1: address1.value,
    tin: tin.value,
    memo: memo.value
  });
});

// File upload handling
function handleFileUpload(event) {
  try {
    // First ensure we have a proper event with files
    if (!event || !event.target || !event.target.files) {
      toasted(false, "File Upload Error", "Invalid file upload event");
      return;
    }

    const file = event.target.files[0];
    
    // Check if file was selected
    if (!file) {
      toasted(false, "File Upload Error", "No file selected");
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toasted(false, "Invalid File Type", "Please upload only JPG, PNG or GIF images");
      return;
    }

    // Validate size (e.g.,  1MB max)
   if (file.size > 1 * 1024 * 1024) { // 1MB
  toasted(false, "File Too Large", "Maximum file size is 1MB");
  return;
}


    // Update the refs
    payerLogo.value = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target?.result || '';
    };
    reader.onerror = (error) => {
      toasted(false, "File Read Error", "Failed to process the image");
      console.error("Error reading file:", error);
    };
    reader.readAsDataURL(file);

  } catch (error) {
    toasted(false, "Unexpected Error", "An error occurred during file upload");
    console.error("File upload error:", error);
  }
}

function browseFiles() {
  const fileInput = document.getElementById('file-upload') ;
  fileInput.click();
}

function handleDragOver(event) {
  event.preventDefault();
  (event.currentTarget ).classList.add('border-primary');
}

function handleDragLeave(event) {
  event.preventDefault();
  (event.currentTarget ).classList.remove('border-primary');
}

function handleDrop(event) {
  event.preventDefault();
  (event.currentTarget ).classList.remove('border-primary');
  
  if (event.dataTransfer?.files.length) {
    const file = event.dataTransfer.files[0];
    payerLogo.value = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target?.result ;
    };
    reader.readAsDataURL(file);
  }
}

function handleSubmit() {
  // Create form data object with all the values
  const formData = {
    payerName: payerName.value,
    dependantCoverage: dependantCoverage.value,
    category: category.value,
    telephone: `${countryCode.value}${telephone.value}`,
    state: state.value,
    address3: address3.value, // City
    address2: address2.value, // Sub City
    address1: address1.value, // Woreda
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
  state.value = 'Addis Ababa';
  address3.value = '';
  address2.value = '';
  address1.value = '';
  tin.value = '';
  memo.value = '';
  previewImage.value = '';
}

const categoryOptions = [
  'Insurance Company',
  'Government Agency',
  'Private company',
  'Non-Profit Organization',
  'Others'
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
          Payer logo 
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
            <div class="flex items-end ml-4 rounded-md px-3 py-1">
              <button 
                v-if="previewImage"
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
            @change="handleFileUpload($event)"
            :required="false" 
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
              :class="dependantCoverage === true ? 'bg-[#DFF1F1] text-[#02676B] border-[#02676B]' : 'bg-[#F9F9FD] text-gray-600 border-gray-300'"
            >
              <input
                type="radio"
                v-model="dependantCoverage"
                :value="true"
                class="sr-only"
              />
              <div
                class="w-5 h-5 flex items-center justify-center rounded-md border"
                :class="dependantCoverage === true ? 'bg-[#02676B] text-white' : 'border-gray-400'"
              >
                <svg v-if="dependantCoverage === true" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" clip-rule="evenodd"/>
                </svg>
              </div>
              <span class="text-sm font-medium">Yes</span>
            </label>

            <label
              class="flex items-center gap-2 pr-8 pl-4 py-4 cursor-pointer "
              :class="dependantCoverage === false ? 'bg-[#DFF1F1] text-[#02676B] border-[#02676B]' : 'bg-[#F9F9FD] text-gray-600 border-gray-300'"
            >
              <input
                type="radio"
                v-model="dependantCoverage"
                :value="false"
                class="sr-only"
              />
              <div
                class="w-5 h-5 flex items-center justify-center rounded-md border"
                :class="dependantCoverage === false ? 'bg-[#02676B] text-white' : 'border-gray-400'"
              >
                <svg v-if="dependantCoverage === false" xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
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
              :options="['+251']"
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
      <h3 class="text-md font-medium text-[#75778B]">Address Information</h3>
      <!-- Address Information -->
       <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        
        <!-- State/Region -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#75778B]">
            State/Region 
          </label>
          <Select
            v-model="state"
            name="state"
          
            :options="ethiopianRegions"
            :attributes="{
              placeholder: 'Select State/Region',
              required: true
            }"
          />
        </div>
        
        <!-- City -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#75778B]">
            City 
          </label>
          <Select
            v-if="availableCities.length > 0"
            v-model="address3"
            name="address3"
          
            :options="availableCities"
            :attributes="{
              placeholder: 'Select City',
              
            }"
          />
          <Input
            v-else
            v-model="address3"
            name="address3"
          
            :attributes="{
              placeholder: 'Enter City',
              
            }"
          />
        </div>
        
        <!-- Sub City -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#75778B]">
            Sub City 
          </label>
          <Select
            v-if="isAddisAbaba && availableSubCities.length > 0"
            v-model="address2"
            name="address2"
          
            :options="availableSubCities"
            :attributes="{
              placeholder: 'Select Sub City',
              
            }"
          />
          <Input
            v-else
            v-model="address2"
            name="address2"
          
            :attributes="{
              placeholder: 'Enter Sub City',
              
            }"
          />
        </div>
        
        <!-- Woreda/address1 -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#75778B]">
            Woreda 
          </label>
          <Input
            v-model="address1"
            name="address1"
          
            :attributes="{
              placeholder: 'Enter Woreda',
              
            }"
          />
        </div>
      </div>
      
      <!-- Two column layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- TIN -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#75778B]">
            TIN 
          </label>
          <Input
            v-model="tin"
            name="tin"
            :attributes="{
              placeholder: 'Enter TIN',
            }"
          />
        </div>
        
        <!-- Email -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-[#75778B]">
            Company's Email  
          </label>
          <InputEmail
            v-model="email"
            name="email"
            :attributes="{
              placeholder: 'Email of the Company',
            }"
          />
        </div>
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

