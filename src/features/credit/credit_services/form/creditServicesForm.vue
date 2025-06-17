<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useForm } from '@/components/new_form_builder/useForm';
import Form from '@/components/new_form_builder/Form.vue';
import Button from '@/components/Button.vue';
import ModalFormSubmitButton from '@/components/new_form_builder/ModalFormSubmitButton.vue';
import { getActiveInstitutions } from '@/features/instution_settings/api/institutionSettingsApi';
import { searchInsuredByInstitution } from '@/features/insured_persons/api/insuredPersonsApi';
import { searchServices } from '@/features/services/Api/serviceApi';
import { useAuthStore } from '@/stores/auth';
import { openModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import Spinner from '@/components/Spinner.vue';
import Select from '@/components/new_form_elements/Select.vue';
import Input from '@/components/new_form_elements/Input.vue';

interface Payer {
  payerUuid: string;
  payerName: string;
  email: string;
  telephone?: string;
}

interface Employee {
  insuredUuid: string;
  fullName: string;
  phone: string;
  position: string;
  idNumber: string;
  birthDate: string;
  eligible: boolean;
  profilePictureBase64?: string;
}

interface Service {
  id: string;
  serviceUuid: string;
  serviceCode: string;
  serviceName: string;
  paymentAmount: string;
  diagnosis?: string;
  quantity: number;
  status: string;
}

interface CreditServiceFormData {
  payerUuid: string;
  phone: string;
  dispensingDate: string;
  prescriptionNumber: string;
  pharmacyTransactionId: string;
  medicationItems: {
    serviceUuid: string;
    quantity: number;
  }[];
}

interface FormProps {
  initialData?: Partial<CreditServiceFormData>;
  isEdit?: boolean;
  pending?: boolean;
  onSubmit: (formData: CreditServiceFormData) => void;
  onCancel: () => void;
}

const props = defineProps<FormProps>();

// Reactive state
const payers = ref<Payer[]>([]);
const employees = ref<Employee[]>([]);
const selectedPayer = ref<string | null>(null);
const selectedEmployee = ref<Employee | null>(null);
const searchEmployeeQuery = ref('');
const searchServiceQuery = ref('');
const pending = ref(false);
const error = ref<string | null>(null);
const currentStep = ref<'selectEmployee' | 'selectServices'>('selectEmployee');
const services = ref<Service[]>([]);
const addedServices = ref<Service[]>([]);
const auth = useAuthStore();
const providerUuid = ref(auth.auth?.user?.providerUuid || '');

// Form fields
const prescriptionNumber = ref('');
const pharmacyTransactionId = ref('');
const dispensingDate = ref(new Date().toISOString().split('T')[0]);

// Computed properties
const employeeDetails = computed(() => {
  if (!selectedEmployee.value) return null;

  return {
   fullName: selectedEmployee.value.fullName,
    employeeId: selectedEmployee.value.idNumber,
    role: selectedEmployee.value.position,
    phone: selectedEmployee.value.phone,
    email: selectedEmployee.value.email,
    gender: selectedEmployee.value.gender,
    address: selectedEmployee.value.address,
    birthDate: selectedEmployee.value.birthDate,
    status: selectedEmployee.value.status,
    profilePicture: selectedEmployee.value.profilePictureBase64,
  };
});


// Lifecycle hooks
onMounted(async () => {
  await fetchPayers();
});

// Watchers
watch(selectedPayer, async (newPayerId) => {
  if (!newPayerId) return;
  await fetchEmployees();
});

let searchTimeout: number;
watch(searchEmployeeQuery, async (newQuery) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (selectedPayer.value) {
      await fetchEmployees();
    }
  }, 300);
});

let serviceSearchTimeout: number;
watch(searchServiceQuery, async (newQuery) => {
  clearTimeout(serviceSearchTimeout);
  serviceSearchTimeout = setTimeout(async () => {
    await fetchServices();
  }, 300);
});

// Methods
async function fetchPayers() {
  try {
    pending.value = true;
    error.value = null;
    
    const response = await getActiveInstitutions({ page: 1, limit: 100 });
    
    if (!response?.data?.content || !Array.isArray(response.data.content)) {
      throw new Error('Invalid data format: missing content array');
    }

    payers.value = response.data.content.map(item => ({
      payerUuid: item.payerUuid,
      payerName: item.payerName || `Unnamed Payer (${item.email})`,
      email: item.email,
      telephone: item.telephone
    }));

    if (payers.value.length === 0) {
      error.value = 'No payers available';
    }
  } catch (err) {
    console.error('Error fetching payers:', err);
    error.value = 'Failed to load payers. Please try again.';
  } finally {
    pending.value = false;
  }
}

async function fetchEmployees() {
  if (!selectedPayer.value) return;
  
  try {
    pending.value = true;
    error.value = null;
    
    const response = await searchInsuredByInstitution(selectedPayer.value, {
      search: searchEmployeeQuery.value
    });

    const employeesData = Array.isArray(response) ? response : 
                       response?.content ? response.content : 
                       response?.data?.content ? response.data.content : [];

    if (!Array.isArray(employeesData)) {
      throw new Error('Invalid employee data format');
    }

    employees.value = employeesData.map(emp => ({
      insuredUuid: emp.insuredUuid,
      fullName: `${emp.firstName || ''} ${emp.fatherName || ''} ${emp.grandFatherName || ''}`.trim(),
      phone: emp.phone,
      email: emp.email || 'N/A',
      gender: emp.gender || 'Unknown',
      address: emp.address || 'Unknown',
      eligible: emp.status === 'ACTIVE',
      position: emp.position || 'Unknown position',
      idNumber: emp.idNumber || 'N/A',
      birthDate: emp.birthDate || 'Unknown',
     
      profilePictureBase64: emp.profilePictureBase64 || null,
      status: emp.status || 'UNKNOWN'}));

    if (employees.value.length === 0) {
      error.value = 'No employees found for this payer';
    }
  } catch (err) {
    console.error('Error fetching employees:', err);
    error.value = 'Failed to load employees. Please try again.';
  } finally {
    pending.value = false;
  }
}

async function fetchServices() {
  if (!providerUuid.value) return;
  
  try {
    pending.value = true;
    const response = await searchServices(providerUuid.value, { 
      search: searchServiceQuery.value,
      page: 1,
      limit: 25
    });

    services.value = response.data.map((service: any) => ({
      id: service.serviceUuid,
      serviceUuid: service.serviceUuid,
      serviceCode: service.serviceCode,
      serviceName: service.serviceName,
      paymentAmount: `ETB ${service.price?.toFixed(2) || '0.00'}`,
      status: service.status || 'UNKNOWN',
      quantity: 1
    }));

  } catch (err) {
    console.error('Error fetching services:', err);
    error.value = 'Failed to load services. Please try again.';
  } finally {
    pending.value = false;
  }
}

function selectEmployee(employee: Employee) {
  if (!employee.eligible) return;
  selectedEmployee.value = employee;
}

async function continueToServices() {
  if (selectedEmployee.value) {
    currentStep.value = 'selectServices';
    await fetchServices();
  }
}

function backToEmployeeSelection() {
  currentStep.value = 'selectEmployee';
}

function addService(service: Service) {
  if (service.status !== 'ACTIVE') return;
  
  addedServices.value.push({ ...service });
}

function removeService(index: number) {
  addedServices.value.splice(index, 1);
}

function updateQuantity(index: number, value: number) {
  if (value < 1) return;
  addedServices.value[index].quantity = value;
}

function validateForm(): boolean {
  error.value = null;
  
  if (currentStep.value === 'selectEmployee') {
    if (!selectedPayer.value) {
      error.value = 'Please select a payer';
      return false;
    }
    if (!selectedEmployee.value) {
      error.value = 'Please select an employee';
      return false;
    }
    return true;
  }
  
  if (!prescriptionNumber.value) {
    error.value = 'Prescription number is required';
    return false;
  }
  if (!pharmacyTransactionId.value) {
    error.value = 'Pharmacy transaction ID is required';
    return false;
  }
  if (!dispensingDate.value) {
    error.value = 'Dispensing date is required';
    return false;
  }
  if (addedServices.value.length === 0) {
    error.value = 'Please add at least one service';
    return false;
  }
  
  if (addedServices.value.some(item => item.quantity <= 0)) {
    error.value = 'Quantity must be greater than 0';
    return false;
  }
  
  return true;
}

function handleSubmit() {
  if (!validateForm()) return;

  const formData: CreditServiceFormData = {
    payerUuid: selectedPayer.value!,
    phone: selectedEmployee.value!.phone,
    dispensingDate: dispensingDate.value,
    prescriptionNumber: prescriptionNumber.value,
    pharmacyTransactionId: pharmacyTransactionId.value,
    medicationItems: addedServices.value.map(item => ({
      serviceUuid: item.serviceUuid,
      quantity: Number(item.quantity)
    }))
  };

  props.onSubmit(formData);
}
const payerOptions = computed(() => {
  if (!payers.value || !Array.isArray(payers.value)) return [];
  return payers.value.map(payer => ({
    label: `${payer.payerName} (${payer.telephone || payer.email || 'N/A'})`,
    value: payer.payerUuid,
  }));
});
const updateFormData = (key: string, value: any) => {
  formData[key] = value;
};
</script>

<template>
  <Form
    id="credit-service-form"
    class="bg-white rounded-lg shadow-sm"
    @submit.prevent="handleSubmit"
  >
    <!-- Step 1: Select Employee -->
    <div v-if="currentStep === 'selectEmployee'" class="py-3 space-y-6">  
      <!-- <h1 class="text-2xl font-bold text-gray-800">Add Credit Services</h1>
      <p class="text-gray-600">Add a new credit service</p> -->

      <div v-if="error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        {{ error }}
      </div>

      <!-- <template v-if="pending">
        <div class="flex justify-center py-8">
          <Spinner class="h-8 w-8 text-teal-600" />
        </div>
      </template> -->
      <!-- <template v-else> -->
        <div class="flex gap-4 mt-4">
          <div class="w-72">
            <!-- <label class="block text-sm font-medium text-gray-700 mb-1">Select Payer *</label> -->
                        <Select     
                  :obj="true"
                  name="payer"
                  label="Select Payer"
                  validation="required"
                  :options="payerOptions"
                  :disabled="pending"
                  :attributes="{
                    placeholder: 'Select a Payer'
                  }"
                  v-model="selectedPayer"

                />

          </div>
          
                              <div class="w-full">
                              <Input 
                      name="searchEmployeeQuery" 
                      label="Search Employees" 
                      :attributes="{
                        placeholder: 'Search employees',
                        // disabled: !selectedPayer,
                      }"
                      v-model="searchEmployeeQuery"
                    />

          </div>
        </div>

        <!-- Employees Table -->
        <div  class="mt-6">
          
         <template v-if="pending">
          <div class="flex justify-center py-8">
            <Spinner class="h-8 w-8 text-teal-600" />
          </div>
        </template>
          <template v-else>
            <div class=" border rounded-lg">
             <table class="min-w-full divide-y divide-gray-200">
  <thead class="border-b">
    <tr>
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eligibility</th>
      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
    </tr>
  </thead>
  <tbody class="bg-white divide-y divide-gray-200">
    <tr 
      v-for="(employee, index) in employees" 
      :key="employee.insuredUuid"
      :class="{
        'bg-[#DFF1F1]': selectedEmployee && selectedEmployee.insuredUuid === employee.insuredUuid
      }"
    >
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {{ employee.idNumber }}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {{ employee.fullName }}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {{ employee.phone }}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {{ employee.position }}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-bold">
        <span :class="employee.eligible ? 'bg-[#DFF1F1] text-[#02676B] p-1' : 'text-red-600'">
          {{ employee.eligible ? 'Eligible' : 'Not Eligible' }}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          type="button"
          @click="selectEmployee(employee)"
          :class="{
            'text-white bg-[#02676B] px-4 py-2 hover:text-teal-900': !(selectedEmployee && selectedEmployee.insuredUuid === employee.insuredUuid),
            'text-white bg-[#02676B] px-4 py-2 rounded': selectedEmployee && selectedEmployee.insuredUuid === employee.insuredUuid
          }"
          :disabled="!employee.eligible"
        >
          {{ selectedEmployee && selectedEmployee.insuredUuid === employee.insuredUuid ? 'Selected' : 'Select' }}
        </button>
      </td>
    </tr>
  </tbody>
</table>
            </div>
          </template>
        </div>

        <!-- Continue Button -->
        <div v-if="selectedEmployee" class="pt-4 px-6 border-t border-[#DFDEF2] flex justify-end space-x-4">
           <Button
        type="button"
        @click="props.onCancel"
        class="text-[#75778B] px-6 py-4 border-[1px] border-[#75778B] rounded-lg hover:bg-gray-50"
        :disabled="pending"
      >
        Cancel
      </Button>
          <button
            type="button"
            class="px-6 py-2 bg-primary text-white rounded-md hover:bg-teal-700"
            @click="continueToServices"
          >
            Continue to Services
          </button>

        </div>
      <!-- </template> -->
    </div>

    <!-- Step 2: Select Services -->
    <div v-else-if="employeeDetails" class="py-3 space-y-6">
      <!-- <h1 class="text-2xl font-bold text-gray-800">Add Credit Services</h1>
      <p class="text-gray-600">Add a new credit service</p> -->

      <div v-if="error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        {{ error }}
      </div>

      <!-- Employee Details -->
      <div v-if="employeeDetails" class="flex flex-col md:flex-row bg-gray-50 p-6 rounded-xl shadow-md">
    <!-- Profile Photo -->
    <div class="flex-shrink-0">
      <img
        :src="employeeDetails.profilePicture || defaultProfile"
        alt="Profile"
        class="w-40 h-40 object-cover rounded-lg"
      />
    </div>

    <!-- Details -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 ml-6 mt-6 md:mt-0">
      <div>
        <label class="block text-sm font-medium text-gray-700">Full Name</label>
        <p class="mt-1 text-sm text-gray-900">{{ employeeDetails.fullName }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Phone</label>
        <p class="mt-1 text-sm text-gray-900">{{ employeeDetails.phone }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <p class="mt-1 text-sm text-gray-900">{{ employeeDetails.email }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Employee ID</label>
        <p class="mt-1 text-sm text-gray-900">{{ employeeDetails.employeeId }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Role</label>
        <p class="mt-1 text-sm text-gray-900">{{ employeeDetails.role }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Gender</label>
        <p class="mt-1 text-sm text-gray-900">{{ employeeDetails.gender }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Address</label>
        <p class="mt-1 text-sm text-gray-900">{{ employeeDetails.address }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Birth Date</label>
        <p class="mt-1 text-sm text-gray-900">{{ employeeDetails.birthDate }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Status</label>
        <p class="mt-1">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            :class="employeeDetails.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
          >
            {{ employeeDetails.status }}
          </span>
        </p>
      </div>
    </div>
  </div>
      <!-- Credit Service Details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Prescription Number *</label>
          <input
            v-model="prescriptionNumber"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Pharmacy Transaction ID *</label>
          <input
            v-model="pharmacyTransactionId"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Dispensing Date *</label>
          <input
            v-model="dispensingDate"
            type="date"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            required
          />
        </div>
      </div>

      <!-- Services Section -->
      <div class="mt-8">
        <h2 class="text-lg font-semibold mb-4">Search and Select Services</h2>
        <div class="mb-4">
          <input
            v-model="searchServiceQuery"
            type="text"
            placeholder="Search Services"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <template v-if="pending">
          <div class="flex justify-center py-8">
            <Spinner class="h-8 w-8 text-teal-600" />
          </div>
        </template>
        <template v-else>
          <div class="overflow-x-auto mb-8">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Code</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(service, index) in services" :key="service.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ service.serviceCode }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ service.serviceName }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ service.paymentAmount }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span :class="service.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'">
                      {{ service.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      type="button"
                      @click="addService(service)"
                      class="text-teal-600 hover:text-teal-900"
                      :disabled="service.status !== 'ACTIVE'"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 class="text-lg font-semibold mb-4">Added Services</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Code</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(service, index) in addedServices" :key="index">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ service.serviceCode }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ service.serviceName }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ service.paymentAmount }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="1"
                      v-model.number="service.quantity"
                      @change="updateQuantity(index, $event.target.valueAsNumber)"
                      class="w-20 p-1 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      type="button"
                      @click="removeService(index)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>

      <!-- </template> -->
 
         <div  class="pt-4 px-6 border-t border-[#DFDEF2] flex justify-end space-x-4">
        <Button
          type="button"
          @click="backToEmployeeSelection"
          class="text-[#75778B] px-6 py-4 border-[1px] border-[#75778B] rounded-lg hover:bg-gray-50"
          :disabled="pending"
        >
          Back
        </Button>
        <ModalFormSubmitButton
          :pending="pending"
          btn-text="Add Service to Credit"
          class="bg-primary hover:bg-teal-700 text-white px-6 py-2"
        />
      </div>
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

table {
  @apply min-w-full divide-y divide-gray-200;
}

th {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

td {
  @apply px-6 py-4 whitespace-nowrap;
}
</style>