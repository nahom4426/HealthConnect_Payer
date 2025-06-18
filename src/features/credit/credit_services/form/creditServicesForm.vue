<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useForm } from '@/components/new_form_builder/useForm';
import Form from '@/components/new_form_builder/Form.vue';
import Button from '@/components/Button.vue';
import ModalFormSubmitButton from '@/components/new_form_builder/ModalFormSubmitButton.vue';
import { getActiveInstitutions } from '@/features/instution_settings/api/institutionSettingsApi';
import { searchInsuredByInstitution } from '@/features/insured_persons/api/insuredPersonsApi';
import { searchServices } from '@/features/service/api/serviceApi';
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
  status?: string;
  gender?: string;
  address?: string;
  email?: string;
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
    paymentAmount: number;
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
const filteredServices = ref<Service[]>([]);
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
    email: selectedEmployee.value.email || 'N/A',
    gender: selectedEmployee.value.gender || 'Unknown',
    address: selectedEmployee.value.address || 'Unknown',
    idNumber: selectedEmployee.value.idNumber,
    birthDate: selectedEmployee.value.birthDate || 'Unknown',
    status: selectedEmployee.value.status || 'UNKNOWN',
    profilePicture: selectedEmployee.value.profilePictureBase64,
  };
});

const isServiceAdded = (serviceId: string) => {
  return addedServices.value.some(service => service.id === serviceId);
};

const payerOptions = computed(() => {
  if (!payers.value || !Array.isArray(payers.value)) return [];
  return payers.value.map(payer => ({
    label: `${payer.payerName} (${payer.telephone || payer.email || 'N/A'})`,
    value: payer.payerUuid,
  }));
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
    if (newQuery.trim().length > 0) {
      await fetchServices();
    } else {
      filteredServices.value = [];
    }
  }, 500);
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
      status: emp.status || 'UNKNOWN'
    }));

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
  if (!providerUuid.value) {
    error.value = 'Provider UUID is missing';
    return;
  }

  try {
    pending.value = true;
    error.value = null;
    
    const response = await searchServices(providerUuid.value, { 
      search: searchServiceQuery.value,
      page: 1,
      limit: 25
    });

    // Handle the response structure that matches your API
    const servicesData = response.data; // Adjust this based on your actual API response structure

    if (!Array.isArray(servicesData)) {
      throw new Error('Invalid service data format');
    }

    services.value = servicesData.map((service: any) => ({
      id: service.serviceUuid,
      serviceUuid: service.serviceUuid,
      serviceCode: service.serviceCode,
      serviceName: service.serviceName,
      paymentAmount: `ETB ${service.price?.toFixed(2) || '0.00'}`,
      status: service.status || 'UNKNOWN',
      quantity: 1
    }));

    // Filter out already added services and inactive ones
    filteredServices.value = services.value.filter(
      service => service.status === 'ACTIVE' && !isServiceAdded(service.id)
    );

  } catch (err) {
    console.error('Error fetching services:', err);
    error.value = 'Failed to load services. Please try again.';
    filteredServices.value = [];
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
    // Don't fetch services yet - wait for user to search
    services.value = [];
    filteredServices.value = [];
  }
}

function backToEmployeeSelection() {
  currentStep.value = 'selectEmployee';
}

function addService(service: Service) {
  if (service.status !== 'ACTIVE' || isServiceAdded(service.id)) return;
  
  addedServices.value.push({ 
    ...service,
    quantity: 1
  });
  
  // Clear search results after adding
  searchServiceQuery.value = '';
  filteredServices.value = [];
}

function removeService(index: number) {
  addedServices.value.splice(index, 1);
}

function updateQuantity(index: number, value: number) {
  if (value < 1) {
    addedServices.value[index].quantity = 1;
    return;
  }
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
    patientName: selectedEmployee.value!.fullName,
    dispensingDate: dispensingDate.value,
    prescriptionNumber: prescriptionNumber.value,
    pharmacyTransactionId: pharmacyTransactionId.value,
    medicationItems: addedServices.value.map(item => ({
      serviceUuid: item.serviceUuid,
      quantity: Number(item.quantity),
      paymentAmount: parseFloat(item.paymentAmount.replace('ETB ', '')) || 0
    }))
  };

  // Log the formData to the console
  console.log(formData);

  props.onSubmit(formData);
}
</script>

<template>
  <Form
    id="credit-service-form"
    class="bg-white rounded-lg shadow-sm"
    @submit.prevent="handleSubmit"
  >
    <!-- Step 1: Select Employee -->
    <div v-if="currentStep === 'selectEmployee'" class="py-3 space-y-6">  
      <div v-if="error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        {{ error }}
      </div>

      <div class="flex gap-4 mt-4">
        <div class="w-72">
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
            }"
            v-model="searchEmployeeQuery"
          />
        </div>
      </div>

      <!-- Employees Table -->
      <div class="mt-6">
        <template v-if="pending">
          <div class="flex justify-center py-8">
            <Spinner class="h-8 w-8 text-teal-600" />
          </div>
        </template>
        <template v-else>
          <div class="border rounded-lg">
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
    </div>

    <!-- Step 2: Select Services -->
    <div v-else-if="employeeDetails" class="py-3 space-y-6">
      <div v-if="error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
        {{ error }}
      </div>

      <!-- Employee Details -->
      <div class="bg-[#F6F7FA] p-4 flex">
        <div class="flex flex-col md:flex-row gap-4 p-4 bg-[#F6F7FA] rounded-xl shadow-sm w-full">
          <!-- Profile Photo -->
          <div class="w-[10rem] h-[10rem] flex items-center justify-center rounded-lg overflow-hidden">
            <img 
              :src="employeeDetails.profilePicture || 'https://randomuser.me/api/portraits/men/75.jpg'" 
              alt="Profile" 
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Left Info Section -->
          <div class="bg-white rounded-lg p-4 w-full md:w-[20rem] space-y-2">
            <div class="flex">
              <span class="text-xs text-[#75778B] w-28">Full Name</span>
              <span class="text-sm font-medium text-[#373946]">{{ employeeDetails.fullName }}</span>
            </div>
            <div class="flex">
              <span class="text-xs text-[#75778B] w-28">Role</span>
              <span class="text-sm font-medium text-[#373946]">{{ employeeDetails.role }}</span>
            </div>
            <div class="flex">
              <span class="text-xs text-[#75778B] w-28">Phone</span>
              <span class="text-sm font-medium text-[#373946]">{{ employeeDetails.phone }}</span>
            </div>
            <div class="flex">
              <span class="text-xs text-[#75778B] w-28">Email</span>
              <span class="text-sm font-medium text-[#373946]">{{ employeeDetails.email }}</span>
            </div>
          </div>

          <!-- Right Info Section -->
          <div class="bg-white rounded-lg p-4 w-full md:w-[20rem] space-y-2">
            <div class="flex">
              <span class="text-xs text-[#75778B] w-28">Employee ID</span>
              <span class="text-sm font-medium text-[#373946]">{{ employeeDetails.employeeId }}</span>
            </div>
            <div class="flex">
              <span class="text-xs text-[#75778B] w-28">Address</span>
              <span class="text-sm font-medium text-[#373946]">{{ employeeDetails.address }}</span>
            </div>
            <div class="flex">
              <span class="text-xs text-[#75778B] w-28">Gender</span>
              <span class="text-sm font-medium text-[#373946]">{{ employeeDetails.gender }}</span>
            </div>
            <div class="flex">
              <span class="text-xs text-[#75778B] w-28">Age</span>
              <span class="text-sm font-medium text-[#373946]">{{ employeeDetails.age }}</span>
            </div>
          </div>

          <!-- Status & Level Section -->
          <div class="bg-white rounded-lg p-4 w-full md:w-[20rem] space-y-2">
            <div class="flex p-2 gap-2 bg-[#DFF1F1]">
              <span class="text-xs font-medium bg-primary py-2 rounded-lg px-3 flex items-center gap-2 text-white">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M0 6C0 2.68629 2.68629 0 6 0C9.31371 0 12 2.68629 12 6C12 9.31371 9.31371 12 6 12C2.68629 12 0 9.31371 0 6ZM5.40001 8.34854L9.27427 4.47427L8.42575 3.62574L5.40001 6.65148L3.72427 4.97574L2.87574 5.82427L5.40001 8.34854Z" fill="white"/>
                </svg>
                {{ employeeDetails.status }}
              </span>
              <div class="flex-1 flex items-center px-2 justify-between">
                <span class="text-sm font-medium items-center text-center justify-center">{{ employeeDetails.idNumber }}</span>
              </div>
            </div>
            <div class="flex">
              <span class="bg-[#DFF1F1] text-[#02676B] px-6 py-3.5 rounded-md mt-2 text-sm font-medium">
                C-Level
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Credit Service Details -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div>
          <Input
            v-model="prescriptionNumber"
            name="prescriptionNumber"
            label="Prescription Number"
            validation="required"
            :attributes="{
              placeholder: 'Enter prescription number',
              required: true
            }"
          />
        </div>
        <div>
          <Input
            v-model="pharmacyTransactionId"
            name="pharmacyTransactionId"
            label="Pharmacy Transaction ID"
            validation="required"
            :attributes="{
              placeholder: 'Enter pharmacy transaction ID',
              required: true
            }"
          />
        </div> 
        <div>
          <Input
            v-model="dispensingDate"
            name="dispensingDate"
            label="Dispensing Date"
            validation="required"
            :attributes="{
              type: 'date',
              placeholder: 'Select dispensing date',
              required: true
            }"
          />
        </div>
      </div>

      <!-- Services Section -->
      <div>
        <h2 class="text-lg font-semibold mb-4">Add Services</h2>
        
        <!-- Service Search Input -->
        <div class="flex gap-4 mb-6">
          <div class="flex-1 relative">
          <input
  v-model="searchServiceQuery"
  @keyup.enter="searchServices"
  placeholder="Search services..."
  class="w-full p-3 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
/>
            <!-- Search Results Dropdown -->
            <div 
              v-if="filteredServices.length > 0"
              class="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto"
            >
              <ul>
                <li
                  v-for="service in filteredServices"
                  :key="service.id"
                  @click="addService(service)"
                  class="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                >
                  <span>{{ service.serviceName }}</span>
                  <span class="text-sm text-gray-500">{{ service.paymentAmount }}</span>
                </li>
              </ul>
            </div>
          </div>
          <button
            @click="searchServices"
            class="bg-primary text-white px-4 rounded-md hover:bg-teal-900 whitespace-nowrap"
          >
            Search
          </button>
        </div>

        <!-- Added Services Table -->
        <h2 class="text-lg font-semibold mb-4">Added Services</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-white border-b px-2">
              <tr>
                <th class="px-1 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Code</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(service, index) in addedServices" :key="service.id">
                <td class="px-1 py-4 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
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
                    class="bg-[#F14545] text-white px-3 rounded-md py-1 hover:bg-red-900"
                  >
                    Remove
                  </button>
                </td>
              </tr>
              <tr v-if="addedServices.length === 0">
                <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                  No services added yet. Search for services above to add them.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="pt-4 px-6 border-t border-[#DFDEF2] flex justify-end space-x-4">
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
:deep(.form-control) {
  @apply bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5;
}

table {
  @apply min-w-full divide-y divide-gray-200;
}

th {
  @apply py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

td {
  @apply py-4 whitespace-nowrap;
}
</style>