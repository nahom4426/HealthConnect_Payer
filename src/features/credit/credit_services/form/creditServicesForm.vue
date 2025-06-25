<script setup lang="ts">
import { PropType, ref, onMounted, watch, computed } from 'vue';
import { useForm } from '@/components/new_form_builder/useForm';
import Form from '@/components/new_form_builder/Form.vue';
import Button from '@/components/Button.vue';
import ModalFormSubmitButton from '@/components/new_form_builder/ModalFormSubmitButton.vue';
import { getActiveInstitutions } from '@/features/instution_settings/api/institutionSettingsApi';
import { searchInsuredByInstitution } from '@/features/insured_persons/api/insuredPersonsApi';
import { useAuthStore } from '@/stores/auth';
import { openModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import Spinner from '@/components/Spinner.vue';
import Select from '@/components/new_form_elements/Select.vue';
import Input from '@/components/new_form_elements/Input.vue';
import { getAllServices } from '@/features/service/api/serviceApi';
import { getAllDrugs } from '@/features/service/api/drugApi';
import selectServices from '../components/selectServices.vue';
import EmployeeDetails from '../components/EmployeeDetails.vue';
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
  insuredIdNumber: string;
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
  primaryDiagnosis?: string;
  secondaryDiagnosis?: string;
  status: string;
}
interface Drug {
  id: string;
  drugUuid: string;
  drugCode: string;
  drugName: string;
  price: number;
  status: string;
  quantity: number;
  route?: string;
  frequency?: string;
  dose?: string;
  duration?: string;
}

interface CreditServiceFormData {
  payerUuid: string;
  payerName: string;
  insuredUuid: string;
  phone: string;
  dispensingDate: string;
  prescriptionNumber?: string;
  pharmacyTransactionId?: string;
  medicationItems: {
    serviceUuid: string;
    quantity: number;
    paymentAmount: number;
  }[];
}



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
// Reactive state
const payers = ref<Payer[]>([]);
const employees = ref<Employee[]>([]);
const selectedPayer = ref<string | null>(null);
const selectedEmployee = ref<Employee | null>(null);
const searchEmployeeQuery = ref('');
const searchServiceQuery = ref('');
const searchDrugQuery  = ref('');
const fetchPending = ref(false);
const error = ref<string | null>(null);
const currentStep = ref<'selectEmployee' | 'selectServices'>('selectEmployee');
const services = ref<Service[]>([]);
const addedServices = ref<Service[]>([]);
const filteredServices = ref<Service[]>([]);
const auth = useAuthStore();
const providerUuid = ref(auth.auth?.user?.providerUuid || '');
const filteredDrugs = ref<Drug[]>([]); 
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
    insuredUuid: selectedEmployee.value.insuredUuid,
    email: selectedEmployee.value.email || 'N/A',
    gender: selectedEmployee.value.gender || 'Unknown',
    address: selectedEmployee.value.address || 'Unknown',
    idNumber: selectedEmployee.value.idNumber,
    birthDate: selectedEmployee.value.birthDate || 'Unknown',
    status: selectedEmployee.value.status || 'UNKNOWN',
    profilePicture: selectedEmployee.value.profilePictureBase64,
  };
});



// Methods
async function fetchPayers() {
  try {
    fetchPending.value = true;
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
    fetchPending.value = false;
  }
}

async function fetchEmployees() {
  if (!selectedPayer.value) return;
  
  try {
    fetchPending.value = true;
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
    fetchPending.value = false;
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
  
  // Ensure the service object contains serviceUuid
  addedServices.value.push({ 
    ...service,
    quantity: 1,
    serviceUuid: service.serviceUuid // Explicitly include if needed
  });
  
  searchServiceQuery.value = '';
}

function removeService(index: number) {
  addedServices.value.splice(index, 1);
}

function updateQuantity(payload: {index: number, value: number}) {
  const { index, value } = payload;
  if (value < 1) {
    addedServices.value[index].quantity = 1;
    return;
  }
  addedServices.value[index].quantity = value;
}

function validateForm(): boolean {
  // Common validation
 if (!selectedPayer.value || !selectedEmployee.value || 
      // !prescriptionNumber.value || !pharmacyTransactionId.value || 
      !dispensingDate.value) {
    error.value = 'Please fill all required fields';
    return false;
  } 

  // Tab-specific validation
  if (activeTab.value === 'services') {
    if (addedServices.value.length === 0) {
      error.value = 'Please add at least one service';
      return false;
    }
    // Add diagnosis validation
    // const invalidService = addedServices.value.find(item => 
    //   !item.primaryDiagnosis || !item.secondaryDiagnosis
    // );
    // if (invalidService) {
    //   error.value = 'Please fill both diagnosis fields for all services';
    //   return false;
    // }
  } else {
    if (addedDrugs.value.length === 0) {
      error.value = 'Please add at least one drug';
      return false;
    }
    const invalidDrug = addedDrugs.value.find(item => 
      !item.route || !item.frequency || !item.dose || !item.duration
    );
    if (invalidDrug) {
      error.value = 'Please fill all drug administration details';
      return false;
    }
  }
  
  return true;
}
const activeTab = ref<'services' | 'drugs'>('services');
const availableServices = ref<Service[]>([]);
const availableDrugs = ref<Drug[]>([]);
const addedDrugs = ref<Drug[]>([]);

// Update your fetchServices function
// In parent component
async function fetchServices(query: string) {
  try {
    fetchPending.value = true;
    const response = await getAllServices(providerUuid.value, {
      search: query,
      page: 1,
      limit: 25
    });

    availableServices.value = response.data.content.map((service: any) => ({
      id: service.serviceUuid,
      serviceUuid: service.serviceUuid,
      serviceCode: service.serviceCode,
      serviceName: service.serviceName,
      paymentAmount: `ETB ${service.price?.toFixed(2) || '0.00'}`,
      status: service.status || 'UNKNOWN',
      quantity: 1
    }));
  } catch (error) {
    console.error('Error fetching services:', error);
    availableServices.value = [];
  } finally {
    fetchPending.value = false;
  }
}
// Add fetchDrugs function
async function fetchDrugs(query: string) {
  try {
    fetchPending.value = true;
    const response = await getAllDrugs(providerUuid.value, {
      search: query,
      page: 1,
      limit: 25
    });
    
    // Properly map the API response to our Drug interface
    availableDrugs.value = response.data.content.map((drug: any) => ({
      id: drug.drugUuid || `temp-${Math.random().toString(36).substr(2, 9)}`, // Handle null drugUuid
      drugUuid: drug.drugUuid,
      drugCode: drug.drugCode,
      drugName: drug.drugName,
      price: drug.price || 0,
      status: drug.status || 'UNKNOWN',
      quantity: 1,
      route: 'oral', // Default value
      frequency: 'daily', // Default value
      dose: drug.dosage || '1', // Use dosage from API or default
      duration: '7 days' // Default value
    }));
    
    filteredDrugs.value = [...availableDrugs.value];
  } catch (error) {
    console.error('Error fetching drugs:', error);
    availableDrugs.value = [];
    filteredDrugs.value = [];
  } finally {
    fetchPending.value = false;
  }
}
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

let drugSearchTimeout: number;

// Watch for changes in the drug search query
watch(searchDrugQuery, async (newQuery) => {
  clearTimeout(drugSearchTimeout);
  drugSearchTimeout = setTimeout(async () => {
    if (newQuery.trim().length > 0) {
      await fetchDrugs(newQuery);
    } else {
      filteredDrugs.value = [];
    }
  }, 500);
});

// Modified handleSearchItems to include drug search
function handleSearchItems({ type, query }: { type: string, query: string }) {
  if (type === 'services') {
    fetchServices(query);
  } else if (type === 'drugs') {
    fetchDrugs(query);
  }
}
function changeTab(tab: 'services' | 'drugs') {
  activeTab.value = tab;
  error.value = null;
}
function handleAddItem(item: any) {
  if (activeTab.value === 'services') {
    addedServices.value.push(item);
  } else {
    addedDrugs.value.push(item);
  }
}

function handleRemoveItem(index: number) {
  if (activeTab.value === 'services') {
    addedServices.value.splice(index, 1);
  } else {
    addedDrugs.value.splice(index, 1);
  }
}

function handleUpdateQuantity({ index, value }: { index: number, value: number }) {
  if (activeTab.value === 'services') {
    addedServices.value[index].quantity = value;
  } else {
    addedDrugs.value[index].quantity = value;
  }
}
// In selectServices component
function handleUpdateDiagnosis(payload: { index: number, primaryDiagnosis?: string, secondaryDiagnosis?: string }) {
  const { index, primaryDiagnosis, secondaryDiagnosis } = payload;
  if (primaryDiagnosis !== undefined) {
    addedServices.value[index].primaryDiagnosis = primaryDiagnosis;
  }
  if (secondaryDiagnosis !== undefined) {
    addedServices.value[index].secondaryDiagnosis = secondaryDiagnosis;
  }
}
function handleUpdateItem({ index, item }: { index: number, item: any }) {
  if (activeTab.value === 'drugs') {
    addedDrugs.value[index] = { ...addedDrugs.value[index], ...item };
  }
}
function handleSubmit() {
  if (!validateForm()) return;

  const getPayerLabel = (payerUuid: string) => {
    const payer = payers.value.find(p => p.payerUuid === payerUuid);
    return payer ? payer.payerName : 'Unknown Payer';
  };

  if (activeTab.value === 'services') {
    const formData = {
      payerUuid: selectedPayer.value!,
      payerName: getPayerLabel(selectedPayer.value!),
      phone: selectedEmployee.value!.phone,
      employeeId: selectedEmployee.value!.idNumber,
      patientName: selectedEmployee.value!.fullName, // Add this
      dispensingDate: dispensingDate.value,
      prescriptionNumber: prescriptionNumber.value,
      pharmacyTransactionId: pharmacyTransactionId.value,
      medicationItems: addedServices.value.map(item => ({
        serviceUuid: item.serviceUuid,
        primaryDiagnosis: item.primaryDiagnosis || '',
        secondaryDiagnosis: item.secondaryDiagnosis || '',
        totalPrice: parseFloat(item.paymentAmount.replace('ETB ', '')) || 0
      }))
    };
    props.onSubmit(formData);
  } else {
    const formData = {
      providerUuid: providerUuid.value,
      payerUuid: selectedPayer.value!,
      payerName: getPayerLabel(selectedPayer.value!), // Add this
      phone: selectedEmployee.value!.phone,
      insuredUuid: selectedEmployee.value!.insuredUuid,
      patientName: selectedEmployee.value!.fullName, // Add this
      employeeId: selectedEmployee.value!.idNumber,
      dispensingDate: dispensingDate.value,
      prescriptionNumber: prescriptionNumber.value,
      pharmacyTransactionId: pharmacyTransactionId.value,
      drugItems: addedDrugs.value.map(item => ({
        drugUuid: item.drugUuid,
        quantity: Number(item.quantity),
        totalPrice: item.price * item.quantity,
        route: item.route,
        frequency: item.frequency,
        dose: item.dose,
        duration: item.duration
      }))
    };
    props.onSubmit(formData);
  }
}
function handleClearItems(tab: 'services' | 'drugs') {
  if (tab === 'services') {
    addedDrugs.value = []; // Clear drugs when switching to services
  } else {
    addedServices.value = []; // Clear services when switching to drugs
  }
}
</script>

<template>
  <Form
     ref="formEl"
    :inner="false"
      v-slot="{}"
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
            :disabled="fetchPending"
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
        <template v-if="fetchPending">
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
  <span :class="employee.eligible ? 'bg-[#DFF1F1] text-[#02676B] p-1' : 'text-[#DB2E48] bg-[#DB2E481A] p-1'">
    {{ employee.eligible ? 'Eligible' : 'Not Eligible' }}
  </span>
</td>
<td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
  <button
    type="button"
    @click="selectEmployee(employee)"
    :class="{
      'text-white bg-[#02676B] px-4 py-2 hover:bg-teal-900': 
        !(selectedEmployee && selectedEmployee.insuredUuid === employee.insuredUuid) && employee.eligible,
      'text-white bg-[#02676B] px-4 py-2 rounded': 
        selectedEmployee && selectedEmployee.insuredUuid === employee.insuredUuid && employee.eligible,
      'bg-[#02676B1A] text-white px-4 py-2 cursor-not-allowed': 
        !employee.eligible
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
          :disabled="fetchPending"
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
    <EmployeeDetails :employee="employeeDetails" />

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
     <!-- In your parent component -->
  <selectServices
    v-model:activeTab="activeTab"
    :search-query="activeTab === 'services' ? searchServiceQuery : searchDrugQuery"
    :pending="fetchPending"
    :available-items="activeTab === 'services' ? availableServices : availableDrugs"
    :added-items="activeTab === 'services' ? addedServices : addedDrugs"
    @update:search-query="activeTab === 'services' ? searchServiceQuery = $event : searchDrugQuery = $event"
    @add-item="activeTab === 'services' ? addedServices.push($event) : addedDrugs.push($event)"
    @remove-item="activeTab === 'services' ? addedServices.splice($event, 1) : addedDrugs.splice($event, 1)"
    @update-quantity="({index, value}) => {
      if (activeTab === 'services') {
        addedServices[index].quantity = value;
      } else {
        addedDrugs[index].quantity = value;
      }
    }"
   @update-diagnosis="handleUpdateDiagnosis"
    @update-item="({index, item}) => {
      if (activeTab === 'drugs') {
        addedDrugs[index] = { ...addedDrugs[index], ...item };
      }
    }"
    @search-items="handleSearchItems"
  />

      <!-- Form Actions -->
     <div class="pt-4 px-6 border-t border-[#DFDEF2] flex justify-end space-x-4">
  <Button
    type="button"
    @click="onCancel"
    class="text-[#75778B] px-6 py-4 border-[1px] border-[#75778B] rounded-lg hover:bg-gray-50"
    :disabled="pending"
  >
    Back
  </Button>
  <ModalFormSubmitButton
    :pending="pending"
    btn-text="Add Service to Credit"
    class="bg-primary hover:bg-teal-700 text-white px-6 py-2"
    :disabled="pending"
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