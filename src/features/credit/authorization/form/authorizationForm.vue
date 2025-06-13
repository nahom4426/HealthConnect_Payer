<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useForm } from '@/components/new_form_builder/useForm';
import Form from '@/components/new_form_builder/Form.vue';
import Input from '@/components/new_form_elements/Input.vue';
import Select from '@/components/new_form_elements/Select.vue';
import Button from '@/components/Button.vue';
import InputEmail from '@/components/new_form_elements/InputEmail.vue';
import ModalFormSubmitButton from '@/components/new_form_builder/ModalFormSubmitButton.vue';
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const props = defineProps({
  initialData: {
    type: Object as PropType<any>,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  },
  institutionId: {
    type: String,
    required: true
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
const employeePhoto = ref<File | null>(null);
const firstName = ref('');
const fatherName = ref('');
const institutionId = ref(auth.auth?.user?.payerUuid || "");
const grandFatherName = ref('');
const gender = ref('');
const role = ref('');
const dateOfBirth = ref('');
const employeeId = ref('');
const phoneNumber = ref('');
const countryCode = ref('+251');
const address = ref('');
const email = ref('');
const status = ref('ACTIVE');
const previewImage = ref('');
const payerId = ref('');

// Initialize form data from props
onMounted(() => {
  if (props.initialData && Object.keys(props.initialData).length > 0) {
    payerId.value = props.initialData.payerUuid || '';
    firstName.value = props.initialData.firstName || '';
    fatherName.value = props.initialData.fatherName || '';
    grandFatherName.value = props.initialData.grandFatherName || props.initialData.grandfatherName || '';
    gender.value = props.initialData.gender || '';
    role.value = props.initialData.position || '';
    dateOfBirth.value = props.initialData.birthDate?.split('T')[0] || '';
    employeeId.value = props.initialData.idNumber || '';
    address.value = props.initialData.address || '';
    email.value = props.initialData.email || '';
    status.value = props.initialData.status || 'ACTIVE';

    const fullPhone = props.initialData.phone || '';
    const possibleCodes = ['+251', '+1', '+44', '+91'];
    const matchedCode = possibleCodes.find(code => fullPhone.startsWith(code));
    
    if (matchedCode) {
      countryCode.value = matchedCode;
      phoneNumber.value = fullPhone.slice(matchedCode.length);
    } else {
      countryCode.value = '+251';
      phoneNumber.value = fullPhone;
    }

    if (props.initialData.photoUrl) {
      previewImage.value = props.initialData.photoUrl;
    } else if (props.initialData.photoBase64) {
      previewImage.value = props.initialData.photoBase64;
    }
  }
});

// File upload handling
function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    employeePhoto.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

function browseFiles() {
  const fileInput = document.getElementById('employee-photo-upload') as HTMLInputElement;
  fileInput.click();
}

function handleSubmit() {
  const formData = {
    firstName: firstName.value,
    payerUuid:institutionId.value || payerId.value,
    fatherName: fatherName.value,
    grandFatherName: grandFatherName.value,
    gender: gender.value,
    position: role.value,
    birthDate: dateOfBirth.value ? `${dateOfBirth.value}T00:00:00.000Z` : '',
    idNumber: employeeId.value,
    phone: `${countryCode.value}${phoneNumber.value}`,
    address: address.value,
    email: email.value,
    status: status.value,
    country: 'Ethiopia',
    state: 'Addis Ababa' // Default as per your swagger example
  };

  if (employeePhoto.value) {
    formData.employeePhoto = employeePhoto.value;
  }

  if (previewImage.value && !employeePhoto.value && props.isEdit) {
    if (props.initialData.photoBase64) {
      formData.photoBase64 = props.initialData.photoBase64;
    }
  }

  props.onSubmit(formData);
}

const genderOptions = ['Male', 'Female', 'Other'];
const statusOptions = ['ACTIVE', 'INACTIVE'];
</script>

<template>
  <Form
    id="employee-form"
    class="bg-white rounded-lg shadow-sm"
    @submit.prevent="handleSubmit"
  >
    <!-- Header -->
  

    <div class="p-6 space-y-6">
      <!-- Top section: Photo and Personal Info -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Photo Upload Section -->
        <div class="col-span-1">
          <div class="bg-white p-5 border border-[#75778B33] rounded-lg flex flex-col items-center justify-center h-full">
            <div class="w-56 h-52 bg-[#F6F7FA] rounded-lg flex items-center justify-center mb-4 overflow-hidden">
              <img v-if="previewImage" :src="previewImage" alt="Employee photo" class="w-full h-full object-cover" />
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
            <button 
              type="button" 
              @click="browseFiles"
              class="w-full py-3 px-5 bg-primary hover:bg-teal-800 text-white rounded flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>
              Upload Photo
            </button>
            <input 
              id="employee-photo-upload" 
              type="file" 
              accept="image/*" 
              class="hidden" 
              @change="handleFileUpload"
            />
          </div>
        </div>

        <!-- Personal Information -->
        <div class="col-span-2  border border-[#75778B33] p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- First Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              First Name <span class="text-red-500">*</span>
            </label>
            <Input
              v-model="firstName"
              name="firstName"
              validation="required"
              :attributes="{
                placeholder: 'Enter first name',
              
              }"
            />
          </div>

          <!-- Father's Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Father's Name <span class="text-red-500">*</span>
            </label>
            <Input
              v-model="fatherName"
              name="fatherName"
              validation="required"
              :attributes="{
                placeholder: 'Enter father\'s name',
              
              }"
            />
          </div>

          <!-- Grandfather's Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Grandfather's Name <span class="text-red-500">*</span>
            </label>
            <Input
              v-model="grandFatherName"
              name="grandFatherName"
              validation="required"
              :attributes="{
                placeholder: 'Enter Grand father\'s name',
              
              }"
            />
          </div>

          <!-- Role -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Role <span class="text-red-500">*</span>
            </label>
            <Input
              v-model="role"
              name="role"
              validation="required"
              :attributes="{
                placeholder: 'Enter Role',
              
              }"
            />
          </div>

          <!-- Gender -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Gender <span class="text-red-500">*</span>
            </label>
            <Select
              v-model="gender"
              name="gender"
              validation="required"
              :options="genderOptions"
              :attributes="{
                placeholder: 'Select Gender',
              
              }"
            />
          </div>

          <!-- Date of Birth -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth <span class="text-red-500">*</span>
            </label>
            <Input
              v-model="dateOfBirth"
              name="dateOfBirth"
              type="date"
              validation="required"
              :attributes="{
                placeholder: 'Select Date',
                 type: 'date',
              }"
            />
          </div>
        </div>
      </div>

      <!-- Middle section: Employee ID and Address -->
      <div class="grid grid-cols-1 border border-[#75778B33] md:grid-cols-2 gap-6 p-5">
        <!-- Employee ID -->
        <div class="pb-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Employee ID <span class="text-red-500">*</span>
          </label>
          <Input
            v-model="employeeId"
            name="employeeId"
            validation="required"
            :attributes="{
              placeholder: 'Enter employee ID',
            
            }"
          />
        </div>

        <!-- Address -->
        <div class="py">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <Input
            v-model="address"
            name="address"
            :attributes="{
              placeholder: 'Enter address',
            
            }"
          />
        </div>

        <!-- Phone Number -->
        <div class="py-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span class="text-red-500">*</span>
          </label>
          <div class="flex w-full gap-2">
            <Select
              v-model="countryCode"
              name="countryCode"
              :options="['+251', '+1', '+44', '+91']"
              :attributes="{ 
                
                required: true 
              }"
            />
            <Input
              v-model="phoneNumber"
              name="phoneNumber"
              validation="required"
              :attributes="{
                placeholder: 'Enter phone number',
                
                required: true
              }"
            />
          </div>
        </div>

        <!-- Email -->
        <div class="py-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <InputEmail
            v-model="email"
            name="email"
            validation="email"
            :attributes="{
              placeholder: 'Enter email',
            
            }"
          />
        </div>
      </div>

      <!-- Bottom section: Insurance Status -->
      <div class="border border-[#75778B33] col-span-3 w-[33%] p-5">
        <label class="[#75778B33] block text-sm font-medium text-gray-700 mb-3">
          Start insurance status as
        </label>
        <div class="flex space-x-4">
          <label class="inline-flex items-center p-3   rounded-md" :class="{ 'text-[#02676B] bg-[#DFF1F1] ': status === 'ACTIVE' }">
            <input
              type="radio"
              v-model="status"
              value="ACTIVE"
              class="form-radio h-5 w-5 text-[#02676B] focus:ring-[#DFF1F1]"
              :checked="status === 'ACTIVE'"
            />
            <span class="ml-2 ">Active</span>
          </label>
         <label
  class="inline-flex items-center p-3 rounded-md bg-gray-50"
  :class="{
    'bg-red-200 text-red-400': status === 'INACTIVE'  // Add this line to change background
  }"
>
  <input
    type="radio"
    v-model="status"
    value="INACTIVE"
    class="form-radio h-5 w-5  focus:ring-[#DFF1F1]"
  />
  <span class="ml-2 ">InActive</span>
</label>

        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="px-6 py-4 bg-white border-t border-gray-200 flex justify-end space-x-4 rounded-b-lg">
      <Button
        type="button"
        @click="props.onCancel"
        class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        :disabled="pending"
      >
        Cancel
      </Button>
      <!-- <Button
        type="submit"
        class="px-6 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800"
        :disabled="pending"
      >
        {{ isEdit ? 'Update Employee' : 'Add Employee' }}
      </Button> -->
         <ModalFormSubmitButton
        :pending="pending"
        :btn-text="isEdit ? 'Update Employee' : 'Add Employee'"
        class="bg-[#02676B] hover:bg-[#014F4F] text-white px-6 py-3 border-[#02676B] hover:border-[#014F4F]"
        />
    </div>
  </Form>
</template>

<style scoped>
:deep(input), :deep(select) {
  @apply bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-teal-500 focus:border-teal-500;
}

:deep(.form-control) {
  @apply bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5;
}

:deep(.form-select) {
  @apply bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5;
}
</style>
