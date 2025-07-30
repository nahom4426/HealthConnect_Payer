<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useForm } from '@/components/new_form_builder/useForm';
import Form from '@/components/new_form_builder/Form.vue';
import Button from '@/components/Button.vue';
import ModalFormSubmitButton from '@/components/new_form_builder/ModalFormSubmitButton.vue';
import { getPayersWithContractForLoggedInProvider } from '@/features/instution_settings/api/institutionSettingsApi';
import { useAuthStore } from '@/stores/auth';
import { openModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import Spinner from '@/components/pageSpinner.vue';
import Select from '@/components/new_form_elements/Select.vue';
import Input from '@/components/new_form_elements/Input.vue';
import { getEligibleServicesAndDrugs } from '../api/creditServicesApi';
import selectServices from '../components/selectServices.vue';
import EmployeeDetails from '../components/EmployeeDetails.vue';
import { getPayerContractById } from '@/features/provider_contract/active_provider_contracts/api/providerContractApi';

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
    type: Function,
    required: true
  }
});

// Reactive state
const payers = ref([]);
const employees = ref([]);
const selectedPayer = ref(null);
const selectedEmployee = ref(null);
const selectedContract = ref(null);
const searchEmployeeQuery = ref('');
const fetchPending = ref(false);
const error = ref(null);
const activeTab = ref('select');
const addedServices = ref([]);
const addedDrugs = ref([]);
const primaryDiagnosis = ref('');
const secondaryDiagnosis = ref('');
const auth = useAuthStore();
const providerUuid = ref(auth.auth?.user?.providerUuid || '');
const prescriptionNumber = ref('');
const pharmacyTransactionId = ref('');
const dispensingDate = ref(new Date().toISOString().split('T')[0]);
const remarks = ref({});
const selectServicesRef = ref(null);

const employeeDetails = computed(() => {
  if (!selectedEmployee.value) return null;
  return {
    fullName: selectedEmployee.value.fullName,
    employeeId: selectedEmployee.value.membershipNumber,
    role: selectedEmployee.value.position,
    phone: selectedEmployee.value.phone,
    insuredUuid: selectedEmployee.value.insuredUuid,
    email: selectedEmployee.value.email || 'N/A',
    gender: selectedEmployee.value.gender || 'Unknown',
    address: selectedEmployee.value.address || 'Unknown',
    idNumber: selectedEmployee.value.membershipNumber,
    birthDate: selectedEmployee.value.birthDate || 'Unknown',
    status: selectedEmployee.value.status || 'ACTIVE',
    profilePicture: selectedEmployee.value.profilePictureBase64,
    isDependant: selectedEmployee.value.isDependant || false,
    relationshipType: selectedEmployee.value.relationshipType || '',
    employeeUuid: selectedEmployee.value.employeeUuid || ''
  };
});

const payerOptions = computed(() => {
  return payers.value.map(payer => ({
    label: `${payer.payerName} (${payer.telephone || payer.email || 'N/A'})`,
    value: payer.payerUuid,
  }));
});

const contractOptions = computed(() => {
  if (!selectedPayer.value) return [];
  const payer = payers.value.find(p => p.payerUuid === selectedPayer.value);
  if (!payer || !payer.contracts) return [];
  
  return payer.contracts.map(contract => ({
    label: contract.contractName,
    value: contract.contractHeaderUuid
  }));
});

async function fetchPayers() {
  try {
    fetchPending.value = true;
    error.value = null;
    const response = await getPayersWithContractForLoggedInProvider({ page: 1, limit: 1000 });
    
    if (!response?.data?.content || !Array.isArray(response.data.content)) {
      throw new Error('Invalid data format: missing content array');
    }

    payers.value = response.data.content.map(item => ({
      payerUuid: item.payerUuid,
      payerName: item.payerName || `Unnamed Payer (${item.email})`,
      email: item.email,
      telephone: item.telephone,
      contracts: item.contracts || []
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
  if (!selectedPayer.value || !selectedContract.value) return;
  
  try {
    fetchPending.value = true;
    error.value = null;
    
    // Prepare search parameters
    const params = {};
    if (searchEmployeeQuery.value.trim()) {
      params.search = searchEmployeeQuery.value.trim();
    }

    const response = await getPayerContractById(selectedContract.value, params);

    if (!response?.data?.insuredSummaries || !Array.isArray(response.data.insuredSummaries)) {
      throw new Error('Invalid employee data format: insuredSummaries not found in response.data');
    }

    employees.value = response.data.insuredSummaries.flatMap(employee => {
      const employeeRecord = {
        insuredUuid: employee.insuredUuid,
        fullName: employee.fullName,
        membershipNumber: employee.membershipNumber || 'N/A',
        phone: '',
        email: '',
        gender: '',
        address: '',
        eligible: true,
        position: 'Employee',
        idNumber: employee.membershipNumber || 'N/A',
        birthDate: '',
        profilePictureBase64: null,
        status: 'ACTIVE',
        isDependant: false,
        dependants: employee.dependants || []
      };
      
      const dependantRecords = employee.dependants?.map(dependant => ({
        insuredUuid: dependant.dependantUuid,
        fullName: dependant.fullName,
        phone: '',
        email: '',
        gender: '',
        address: '',
        eligible: true,
        position: `Dependant (${dependant.relationshipType})`,
        idNumber: 'N/A',
        birthDate: '',
        profilePictureBase64: null,
        status: 'ACTIVE',
        isDependant: true,
        employeeId: employee.membershipNumber || 'N/A',
        relationshipType: dependant.relationshipType,
        employeeUuid: employee.insuredUuid
      })) || [];
      
      return [employeeRecord, ...dependantRecords];
    });

    if (employees.value.length === 0) {
      error.value = searchEmployeeQuery.value.trim() 
        ? 'No matching employees found' 
        : 'No employees found for this contract';
    }
  } catch (err) {
    console.error('Error fetching employees:', err);
    error.value = `Failed to load employees: ${err.message}`;
  } finally {
    fetchPending.value = false;
  }
}

function selectEmployee(employee) {
  selectedEmployee.value = {
    ...employee,
    isDependant: employee.isDependant || false,
    employeeUuid: employee.isDependant ? employee.employeeUuid : employee.insuredUuid,
    dependantUuid: employee.isDependant ? employee.insuredUuid : null
  };
  activeTab.value = 'details';
}

function goToSelect() {
  activeTab.value = 'select';
}

function goToDetails() {
  if (selectedEmployee.value) {
    activeTab.value = 'details';
  }
}

function goToServices() {
  if (selectedEmployee.value) {
    activeTab.value = 'services';
  }
}

async function handleSearchItems({ type, query }) {
  try {
    fetchPending.value = true;

    const isDependant = selectedEmployee.value?.isDependant;
    const uuid = selectedEmployee.value?.insuredUuid;

    const response = await getEligibleServicesAndDrugs(
      selectedContract.value,
      uuid,
      isDependant,
      query
    );

    const items = response.data?.content || response.data || [];

    if (selectServicesRef.value) {
      selectServicesRef.value.setSearchResults(items);
    } else {
      console.error('selectServicesRef is not available');
    }
  } catch (error) {
    console.error('Error searching items:', error);
  } finally {
    fetchPending.value = false;
  }
}

function handleUpdateRemarks(newRemarks) {
  remarks.value = newRemarks;
}

function handleAddItem(item) {
  if (activeTab.value === 'services') {
    addedServices.value.push(item);
  } else {
    addedDrugs.value.push(item);
  }
}

function handleRemoveItem(index) {
  if (activeTab.value === 'services') {
    addedServices.value.splice(index, 1);
  } else {
    addedDrugs.value.splice(index, 1);
  }
}

function handleUpdateQuantity({ index, value }) {
  if (activeTab.value === 'services') {
    addedServices.value[index].quantity = value;
  } else {
    addedDrugs.value[index].quantity = value;
  }
}

function handleUpdateDiagnosis({ index, primaryDiagnosis: primary, secondaryDiagnosis: secondary }) {
  if (primary !== undefined) {
    addedServices.value[index].primaryDiagnosis = primary;
  }
  if (secondary !== undefined) {
    addedServices.value[index].secondaryDiagnosis = secondary;
  }
}

function handleUpdateItem({ index, item }) {
  if (activeTab.value === 'drugs') {
    addedDrugs.value[index] = { ...addedDrugs.value[index], ...item };
  }
}

function handleClearItems(tab) {
  if (tab === 'services') {
    addedDrugs.value = [];
  } else {
    addedServices.value = [];
  }
}

function validateForm() {
  if (!selectedPayer.value || !selectedContract.value || !selectedEmployee.value || !dispensingDate.value) {
    error.value = 'Please fill all required fields';
    return false;
  } 
  
  const hasItems = addedServices.value.length > 0 || addedDrugs.value.length > 0;
  if (!hasItems) {
    error.value = 'Please add at least one service or drug';
    return false;
  }

  const invalidDrug = addedDrugs.value.some(item => 
    (!item.route || !item.frequency || !item.dose || !item.duration)
  );
  
  if (invalidDrug) {
    error.value = 'Please fill all drug administration details';
    return false;
  }
  
  return true;
}

function handleSubmit() {
  if (!selectedEmployee.value) {
    toasted.error('No employee selected');
    return;
  }

  const isDependant = selectedEmployee.value.isDependant;
  const formData = {
    providerUuid: providerUuid.value,
    payerUuid: selectedPayer.value,
    contractHeaderUuid: selectedContract.value,
    insuredUuid: isDependant ? selectedEmployee.value.employeeUuid : selectedEmployee.value.insuredUuid,
    dependantUuid: isDependant ? selectedEmployee.value.insuredUuid : null,
    patientName: selectedEmployee.value.fullName,
    medicationItems: [
      ...addedServices.value.map(item => ({
        contractDetailUuid: item.contractDetailUuid,
        serviceUuid: item.serviceUuid,
        itemType: 'SERVICE',
        remark: item.remark || '',
        quantity: item.quantity || 1,
        price: item.price || 0
      })),
      ...addedDrugs.value.map(item => ({
        contractDetailUuid: item.contractDetailUuid,
        drugUuid: item.drugUuid,
        itemType: 'DRUG',
        quantity: item.quantity || 1,
        price: item.price || 0,
        route: item.route || 'oral',
        frequency: item.frequency || 'daily',
        dose: item.dose || '1',
        duration: item.duration || '7 days'
      }))
    ],
    dispensingDate: dispensingDate.value,
    prescriptionNumber: prescriptionNumber.value,
    pharmacyTransactionId: pharmacyTransactionId.value,
    primaryDiagnosis: primaryDiagnosis.value,
    secondaryDiagnosis: secondaryDiagnosis.value
  };

  console.log('Final submission data:', formData);
  props.onSubmit(formData);
}

onMounted(async () => {
  await fetchPayers();
});

// Watch for changes to selected payer and contract
watch(selectedPayer, async (newPayerId) => {
  selectedContract.value = null;
  if (!newPayerId) return;
  
  const payer = payers.value.find(p => p.payerUuid === newPayerId);
  if (payer?.contracts?.length === 1) {
    selectedContract.value = payer.contracts[0].contractHeaderUuid;
    await fetchEmployees();
  }
});

// Watch for changes to selected contract
watch(selectedContract, async (newContractId) => {
  if (!newContractId) return;
  await fetchEmployees();
});

// Watch for search query changes with debounce
let searchTimeout;
watch(searchEmployeeQuery, (newQuery) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (selectedPayer.value && selectedContract.value) {
      await fetchEmployees();
    }
  }, 500);
});
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
    <!-- Navigation Tabs -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8 px-6">
        <button
          type="button"
          @click="goToSelect"
          :class="{
            'border-primary text-primary': activeTab === 'select',
            'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'select'
          }"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-bold text-xl"
        >
          Eligibility Check
          <span v-if="selectedEmployee" class="ml-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">✓</span>
        </button>

        <button
          type="button"
          @click="goToDetails"
          :disabled="!selectedEmployee"
          :class="{
            'border-primary text-primary': activeTab === 'details',
            'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'details',
            'opacity-50 cursor-not-allowed': !selectedEmployee
          }"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
        >
          Employee Details
        </button>

        <button
          type="button"
          @click="goToServices"
          :disabled="!selectedEmployee"
          :class="{
            'border-primary text-primary': activeTab === 'services',
            'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300': activeTab !== 'services',
            'opacity-50 cursor-not-allowed': !selectedEmployee
          }"
          class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
        >
          Credit Services
          <span v-if="addedServices.length > 0 || addedDrugs.length > 0" class="ml-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
            {{ addedServices.length + addedDrugs.length }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="p-6">
      <!-- Select Employee Tab -->
      <div v-if="activeTab === 'select'" class="space-y-6">
        <div v-if="error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {{ error }}
        </div>

        <div class="flex gap-4">
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
          
          <div class="w-72" v-if="selectedPayer && contractOptions.length > 0">
            <div v-if="contractOptions.length === 1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Contract</label>
              <div class="p-2 bg-gray-100 rounded-md text-sm text-gray-700">
                {{ contractOptions[0].label }}
              </div>
              <input type="hidden" :value="contractOptions[0].value" />
            </div>
            <Select
              v-else
              :obj="true"
              name="contract"
              label="Select Contract"
              validation="required"
              :options="contractOptions"
              :disabled="fetchPending"
              :attributes="{
                placeholder: 'Select a Contract'
              }"
              v-model="selectedContract"
            />
          </div>
          
          <div class="w-full">
            <Input 
              name="searchEmployeeQuery" 
              label="Search Employees" 
              :attributes="{
                placeholder: 'Search employees by name or ID',
              }"
              v-model="searchEmployeeQuery"
            />
          </div>
        </div>

        <div class="mt-4 flex-1 flex flex-col">
          <template v-if="fetchPending">
            <div class="flex justify-center py-8">
              <Spinner class="h-8 w-8 text-teal-600" />
            </div>
          </template>
          <template v-else>
            <div class="border rounded-lg flex-1 flex flex-col overflow-hidden">
              <div class="overflow-auto" style="max-height: calc(100vh - 350px); min-height: 300px;">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership #</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eligibility</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <template v-for="(employee, index) in employees" :key="employee.insuredUuid">
                      <!-- Main employee row -->
                      <tr v-if="!employee.isDependant"
                        :class="{
                          'bg-teal-50': selectedEmployee && selectedEmployee.insuredUuid === employee.insuredUuid,
                          'border-b-2 border-blue-200': employee.dependants && employee.dependants.length > 0
                        }"
                      >
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {{ employee.membershipNumber }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div class="flex items-center">
                            <span class="font-medium">{{ employee.fullName }}</span>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Employee
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Eligible
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            type="button"
                            @click="selectEmployee(employee)"
                            :class="{
                              'text-white bg-primary hover:bg-teal-700 px-4 py-2 rounded-md': 
                                !(selectedEmployee && selectedEmployee.insuredUuid === employee.insuredUuid),
                              'text-white bg-teal-700 px-4 py-2 rounded-md': 
                                selectedEmployee && selectedEmployee.insuredUuid === employee.insuredUuid
                            }"
                          >
                            {{ selectedEmployee && selectedEmployee.insuredUuid === employee.insuredUuid ? 'Selected' : 'Select' }}
                          </button>
                        </td>
                      </tr>
                      
                      <!-- Dependants rows -->
                      <template v-if="!employee.isDependant && employee.dependants && employee.dependants.length > 0">
                        <tr 
                          v-for="(dependant, dIndex) in employee.dependants" 
                          :key="dependant.dependantUuid"
                          class="bg-blue-50"
                          :class="{
                            'bg-teal-100': selectedEmployee && selectedEmployee.insuredUuid === dependant.dependantUuid
                          }"
                        >
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 pl-10">
                            <span class="text-blue-600">↳</span> {{ dIndex + 1 }}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ employee.membershipNumber }} <span class="text-xs text-gray-400">(Employee ID)</span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 pl-2">
                            <div class="flex items-center">
                              <span>{{ dependant.fullName }}</span>
                              <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                {{ dependant.relationshipType }}
                              </span>
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              Dependant
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Eligible
                            </span>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              type="button"
                              @click="selectEmployee({
                                insuredUuid: dependant.dependantUuid,
                                fullName: dependant.fullName,
                                phone: employee.phone,
                                idNumber: employee.membershipNumber,
                                position: `Dependant (${dependant.relationshipType})`,
                                birthDate: '',
                                eligible: true,
                                status: 'ACTIVE',
                                gender: '',
                                email: employee.email,
                                address: employee.address,
                                isDependant: true,
                                dependantUuid: dependant.dependantUuid,
                                employeeUuid: employee.insuredUuid,
                                relationshipType: dependant.relationshipType,
                                membershipNumber: employee.membershipNumber
                              })"
                              :class="{
                                'text-white bg-primary hover:bg-teal-700 px-4 py-2 rounded-md': 
                                  !(selectedEmployee && selectedEmployee.insuredUuid === dependant.dependantUuid),
                                'text-white bg-teal-700 px-4 py-2 rounded-md': 
                                  selectedEmployee && selectedEmployee.insuredUuid === dependant.dependantUuid
                              }"
                            >
                              {{ selectedEmployee && selectedEmployee.insuredUuid === dependant.dependantUuid ? 'Selected' : 'Select' }}
                            </button>
                          </td>
                        </tr>
                      </template>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
          </template>
        </div>

        <div v-if="selectedEmployee" class="pt-4 px-6 border-t border-gray-200 flex justify-end space-x-4">
          <Button
            type="button"
            @click="props.onCancel"
            class="text-gray-600 px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            :disabled="fetchPending"
          >
            Cancel
          </Button>
          <button
            type="button"
            class="px-6 py-2 bg-primary text-white rounded-md hover:bg-teal-700 flex items-center"
            @click="goToDetails"
          >
            View Details
            <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Employee Details Tab -->
      <div v-else-if="activeTab === 'details' && employeeDetails" class="space-y-6">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-medium text-gray-900">Employee Details</h3>
                <p class="mt-1 text-sm text-gray-500">Review the selected employee information</p>
              </div>
              <button 
                @click="goToSelect"
                class="text-gray-500 hover:text-gray-700"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <EmployeeDetails :employee="employeeDetails" class="mt-6" />

            <div class="mt-8 pt-6 border-t border-gray-200 flex justify-between">
              <Button
                type="button"
                @click="goToSelect"
                class="text-gray-600 px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back to Selection
              </Button>
              <button
                type="button"
                class="px-6 py-2 bg-primary text-white rounded-md hover:bg-teal-700 flex items-center"
                @click="goToServices"
              >
                Continue to Credit Services
                <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Services Tab -->
      <div v-else-if="activeTab === 'services' && employeeDetails" class="space-y-6">
        <div v-if="error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {{ error }}
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-medium text-gray-900">Credit Services for {{ employeeDetails.fullName }}</h3>
                <p class="mt-1 text-sm text-gray-500">
                  Employee ID: {{ employeeDetails.employeeId }} | 
                  {{ employeeDetails.isDependant ? 'Dependant' : 'Employee' }}
                  <span v-if="employeeDetails.isDependant"> ({{ employeeDetails.relationshipType }})</span>
                </p>
              </div>
              <button 
                @click="goToDetails"
                class="text-gray-500 hover:text-gray-700"
              >
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <Input
                  v-model="prescriptionNumber"
                  name="prescriptionNumber"
                  label="Prescription Number"
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
          </div>
        </div>

        <selectServices
          ref="selectServicesRef"
          v-model:activeTab="activeTab"
          :added-items="activeTab === 'services' ? addedServices : addedDrugs"
          :remarks="remarks"
          :primary-diagnosis="primaryDiagnosis"
          :secondary-diagnosis="secondaryDiagnosis"
          :insured-uuid="selectedEmployee?.insuredUuid"
          :contract-header-uuid="selectedContract"
          @update:remarks="handleUpdateRemarks"
          @add-item="handleAddItem"
          @remove-item="handleRemoveItem"
          @update-quantity="handleUpdateQuantity"
          @update-diagnosis="handleUpdateDiagnosis"
          @update-item="handleUpdateItem"
          @search-items="handleSearchItems"
          @clear-items="handleClearItems"
          @update:primary-diagnosis="primaryDiagnosis = $event"
          @update:secondary-diagnosis="secondaryDiagnosis = $event"
        />

        <div class="pt-4 px-6 border-t border-gray-200 flex justify-between">
          <Button
            type="button"
            @click="goToDetails"
            class="text-gray-600 px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            :disabled="pending"
          >
            Back to Details
          </Button>
          <div class="flex space-x-4">
            <Button
              type="button"
              @click="onCancel"
              class="text-gray-600 px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              :disabled="pending"
            >
              Cancel
            </Button>
            <ModalFormSubmitButton
              v-if="activeTab === 'services'"
              :pending="pending"
              btn-text="Add Service to Credit"
              class="bg-primary hover:bg-teal-700 text-white px-6 py-2 rounded-md"
              :disabled="pending"
            />
            <ModalFormSubmitButton
              v-else-if="activeTab === 'drugs'"
              :pending="pending"
              btn-text="Add Drug to Credit"
              class="bg-primary hover:bg-teal-700 text-white px-6 py-2 rounded-md"
              :disabled="pending"
            />
          </div>
        </div>
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
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

td {
  @apply px-6 py-4 whitespace-nowrap text-sm;
}

.tab-content {
  transition: all 0.3s ease;
}

.tab-button {
  transition: all 0.2s ease;
}

.tab-button:hover {
  @apply text-teal-700 border-teal-300;
}

.tab-button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.employee-row:hover {
  @apply bg-gray-50;
}

.dependant-row:hover {
  @apply bg-blue-50;
}
</style>