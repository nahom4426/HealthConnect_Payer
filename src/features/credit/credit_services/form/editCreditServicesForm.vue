<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useForm } from '@/components/new_form_builder/useForm';
import Form from '@/components/new_form_builder/Form.vue';
import Button from '@/components/Button.vue';
import ModalFormSubmitButton from '@/components/new_form_builder/ModalFormSubmitButton.vue';
import { getActiveInstitutions } from '@/features/instution_settings/api/institutionSettingsApi';
import { searchInsuredByInstitution } from '@/features/insured_persons/api/insuredPersonsApi';
import { useAuthStore } from '@/stores/auth';
import { openModal, closeModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import Spinner from '@/components/Spinner.vue';
import Select from '@/components/new_form_elements/Select.vue';
import Input from '@/components/new_form_elements/Input.vue';
import { getAllServices } from '@/features/service/api/serviceApi';
import { getAllDrugs } from '@/features/service/api/drugApi';
import selectServices from '../components/selectServices.vue';
import EmployeeDetails from '../components/EmployeeDetails.vue';
import { getDispensingDetail, updateDispensingRecord, updateDrugDispensingRecord } from '../api/creditServicesApi';

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
  isDependant?: boolean;
  dependantUuid?: string;
  employeeUuid?: string;
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
  remark?: string;
  quantity?: number;
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

const props = defineProps({
  dispensingUuid: {
    type: String,
    required: true
  },
  onUpdated: {
    type: Function,
    default: () => {}
  },
  onCancel: {
    type: Function,
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
const searchDrugQuery = ref('');
const fetchPending = ref(false);
const error = ref<string | null>(null);
const currentStep = ref<'selectEmployee' | 'selectServices'>('selectEmployee');
const activeTab = ref<'services' | 'drugs'>('services');
const availableServices = ref<Service[]>([]);
const availableDrugs = ref<Drug[]>([]);
const addedServices = ref<Service[]>([]);
const addedDrugs = ref<Drug[]>([]);
const primaryDiagnosis = ref('');
const secondaryDiagnosis = ref('');
const auth = useAuthStore();
const providerUuid = ref(auth.auth?.user?.providerUuid || '');
const prescriptionNumber = ref('');
const pharmacyTransactionId = ref('');
const dispensingDate = ref(new Date().toISOString().split('T')[0]);
const loading = ref(true);
const claimData = ref<any>({});
const remarks = ref<Record<string, string>>({});

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
    isDependant: selectedEmployee.value.isDependant,
    dependantUuid: selectedEmployee.value.dependantUuid
  };
});

const payerOptions = computed(() => {
  return payers.value.map(payer => ({
    label: `${payer.payerName} (${payer.telephone || payer.email || 'N/A'})`,
    value: payer.payerUuid,
  }));
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

    employees.value = employeesData.flatMap(emp => {
      const employeeRecord = {
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
        status: emp.status || 'UNKNOWN',
        dependants: emp.dependants || []
      };
      
      const dependantRecords = emp.dependants?.map(dependant => ({
        insuredUuid: dependant.dependantUuid,
        fullName: `${dependant.dependantFirstName || ''} ${dependant.dependantFatherName || ''} ${dependant.dependantGrandFatherName || ''}`.trim(),
        phone: emp.phone,
        email: emp.email || 'N/A',
        gender: dependant.dependantGender || 'Unknown',
        address: emp.address || 'Unknown',
        eligible: dependant.dependantStatus === 'ACTIVE',
        position: `Dependant (${dependant.relationship})`,
        idNumber: 'N/A',
        birthDate: dependant.dependantBirthDate || 'Unknown',
        profilePictureBase64: null,
        status: dependant.dependantStatus || 'UNKNOWN',
        isDependant: true,
        dependantUuid: dependant.dependantUuid,
        employeeUuid: emp.insuredUuid
      })) || [];
      
      return [employeeRecord, ...dependantRecords];
    });

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

function continueToServices() {
  if (selectedEmployee.value) {
    currentStep.value = 'selectServices';
  }
}

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

async function fetchDrugs(query: string) {
  try {
    fetchPending.value = true;
    const response = await getAllDrugs(providerUuid.value, {
      search: query,
      page: 1,
      limit: 25
    });
    
    availableDrugs.value = response.data.content.map((drug: any) => ({
      id: drug.drugUuid || `temp-${Math.random().toString(36).substr(2, 9)}`,
      drugUuid: drug.drugUuid,
      drugCode: drug.drugCode,
      drugName: drug.drugName,
      price: drug.price || 0,
      status: drug.status || 'UNKNOWN',
      quantity: 1,
      route: 'oral',
      frequency: 'daily',
      dose: drug.dosage || '1',
      duration: '7 days'
    }));
  } catch (error) {
    console.error('Error fetching drugs:', error);
    availableDrugs.value = [];
  } finally {
    fetchPending.value = false;
  }
}

function handleSearchItems({ type, query }: { type: string, query: string }) {
  if (type === 'services') {
    fetchServices(query);
  } else if (type === 'drugs') {
    fetchDrugs(query);
  }
}

function handleUpdateRemarks(newRemarks: Record<string, string>) {
  remarks.value = newRemarks;
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

function handleUpdateDiagnosis({ index, primaryDiagnosis: primary, secondaryDiagnosis: secondary }: 
  { index: number, primaryDiagnosis?: string, secondaryDiagnosis?: string }) {
  if (primary !== undefined) {
    addedServices.value[index].primaryDiagnosis = primary;
  }
  if (secondary !== undefined) {
    addedServices.value[index].secondaryDiagnosis = secondary;
  }
}

function handleUpdateItem({ index, item }: { index: number, item: any }) {
  if (activeTab.value === 'drugs') {
    addedDrugs.value[index] = { ...addedDrugs.value[index], ...item };
  }
}

function handleClearItems(tab: 'services' | 'drugs') {
  if (tab === 'services') {
    addedDrugs.value = [];
  } else {
    addedServices.value = [];
  }
}

function validateForm(): boolean {
  if (!selectedPayer.value || !selectedEmployee.value || !dispensingDate.value) {
    error.value = 'Please fill all required fields';
    return false;
  } 

  if (activeTab.value === 'services') {
    if (addedServices.value.length === 0) {
      error.value = 'Please add at least one service';
      return false;
    }
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

async function handleSubmit() {
  if (!validateForm()) return;

  try {
    fetchPending.value = true;
    error.value = null;

    const payload = {
      dispensingUuid: props.dispensingUuid,
      payerUuid: selectedPayer.value!,
      payerName: payers.value.find(p => p.payerUuid === selectedPayer.value!)?.payerName || '',
      phone: selectedEmployee.value!.phone,
      employeeId: selectedEmployee.value!.idNumber,
      insuredUuid: selectedEmployee.value!.isDependant ? selectedEmployee.value!.employeeUuid : selectedEmployee.value!.insuredUuid,
      dependantUuid: selectedEmployee.value!.isDependant ? selectedEmployee.value!.dependantUuid : null,
      patientName: selectedEmployee.value!.fullName,
      dispensingDate: dispensingDate.value,
      prescriptionNumber: prescriptionNumber.value,
      pharmacyTransactionId: pharmacyTransactionId.value,
      primaryDiagnosis: primaryDiagnosis.value,
      secondaryDiagnosis: secondaryDiagnosis.value,
      providerUuid: providerUuid.value
    };

    try {
      let response;
      if (activeTab.value === 'services') {
        response = await updateDispensingRecord(props.dispensingUuid, {
          ...payload,
          medicationItems: addedServices.value.map(item => ({
            serviceUuid: item.serviceUuid,
            remark: item.remark || '',
            quantity: item.quantity || 1,
            paymentAmount: parseFloat(item.paymentAmount.replace('ETB ', '')) || 0,
            primaryDiagnosis: item.primaryDiagnosis || primaryDiagnosis.value,
            secondaryDiagnosis: item.secondaryDiagnosis || secondaryDiagnosis.value
          }))
        });
      } else {
        response = await updateDrugDispensingRecord(props.dispensingUuid, {
          ...payload,
          drugItems: addedDrugs.value.map(item => ({
            drugUuid: item.drugUuid,
            quantity: Number(item.quantity),
            totalPrice: item.price * item.quantity,
            route: item.route,
            frequency: item.frequency,
            dose: item.dose,
            duration: item.duration,
            remark: item.remark || ''
          }))
        });
      }

      // Check if response exists and has success property
      if (response && response.success) {
        toasted(true, 'Success', 'Claim updated successfully');
        props.onUpdated(response.data);
        closeModal(); // Only close on success
      } else {
        // Handle case where response exists but success is false
        const errorMessage = response?.message || response?.error || 'Update failed without error message';
        throw new Error(errorMessage);
      }
    } catch (apiError: any) {
      if (apiError.response?.status === 401) {
        // Special handling for 401 - show toast but keep modal open
        toasted(false, 'Error', 'Full authentication is required to access this resource');
        return; // Exit early to prevent modal from closing
      }
      // For other API errors
      throw apiError;
    }
  } catch (err: any) {
    console.error('Update error:', err);
    const errorMessage = err.response?.data?.message || 
                       err.message || 
                       'Failed to update claim';
    error.value = errorMessage;
    toasted(false, 'Error', errorMessage);
  } finally {
    fetchPending.value = false;
  }
}

// Lifecycle hooks
onMounted(async () => {
  try {
    loading.value = true;
    await fetchPayers();
    
    const response = await getDispensingDetail(props.dispensingUuid);
    
    if (response.success) {
      claimData.value = response.data;
      
      selectedPayer.value = claimData.value.payerUuid;
      dispensingDate.value = claimData.value.dispensingDate;
      prescriptionNumber.value = claimData.value.prescriptionNumber || '';
      pharmacyTransactionId.value = claimData.value.pharmacyTransactionId || '';
      primaryDiagnosis.value = claimData.value.primaryDiagnosis || '';
      secondaryDiagnosis.value = claimData.value.secondaryDiagnosis || '';
      
      if (claimData.value.insuredUuid) {
        await fetchEmployees();
        const employee = employees.value.find(e => e.insuredUuid === claimData.value.insuredUuid);
        if (employee) {
          selectedEmployee.value = employee;
          currentStep.value = 'selectServices';
        }
      }
      
      if (claimData.value.items) {
        const services = claimData.value.items.filter((item: any) => item.itemType === 'SERVICE');
        const drugs = claimData.value.items.filter((item: any) => item.itemType === 'DRUG');
        
        if (services.length > 0) {
          activeTab.value = 'services';
          addedServices.value = services.map((item: any) => ({
            id: item.itemUuid,
            serviceUuid: item.itemUuid,
            serviceCode: item.medicationCode,
            serviceName: item.medicationName,
            paymentAmount: `ETB ${item.unitPrice?.toFixed(2) || '0.00'}`,
            quantity: item.quantity || 1,
            remark: item.remark || '',
            primaryDiagnosis: item.primaryDiagnosis || claimData.value.primaryDiagnosis || '',
            secondaryDiagnosis: item.secondaryDiagnosis || claimData.value.secondaryDiagnosis || ''
          }));
        } else if (drugs.length > 0) {
          activeTab.value = 'drugs';
          addedDrugs.value = drugs.map((item: any) => ({
            id: item.itemUuid,
            drugUuid: item.itemUuid,
            drugCode: item.medicationCode,
            drugName: item.medicationName,
            price: item.unitPrice || 0,
            quantity: item.quantity || 1,
            route: item.route || 'oral',
            frequency: item.frequency || 'daily',
            dose: item.dose || '1',
            duration: item.duration || '7 days',
            remark: item.remark || ''
          }));
        }
      }
    } else {
      throw new Error(response.error || 'Failed to load claim details');
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load claim details';
    toasted(false, 'Error', error.value);
  } finally {
    loading.value = false;
  }
});

// Watchers
let searchTimeout: number;
watch(searchEmployeeQuery, async (newQuery) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    if (selectedPayer.value) {
      await fetchEmployees();
    }
  }, 300);
});

watch(selectedPayer, async (newPayerId) => {
  if (!newPayerId) return;
  await fetchEmployees();
});

let drugSearchTimeout: number;
watch(searchDrugQuery, async (newQuery) => {
  clearTimeout(drugSearchTimeout);
  drugSearchTimeout = setTimeout(async () => {
    if (newQuery.trim().length > 0) {
      await fetchDrugs(newQuery);
    }
  }, 500);
});
</script>

<template>
  <Form
    ref="formEl"
    :inner="false"
    v-slot="{}"
    id="edit-credit-service-form"
    class="bg-white rounded-lg shadow-sm"
    @submit.prevent="handleSubmit"
  >
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center p-8">
      <Spinner class="h-8 w-8 text-teal-600" />
    </div>

    <!-- Error state -->
    <!-- <div v-else-if="error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      {{ error }}
    </div> -->

    <!-- Edit form -->
    <template v-else>
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
                  <template v-for="(employee, index) in employees" :key="employee.insuredUuid">
                    <!-- Only show employees that are not dependants -->
                    <tr v-if="!employee.isDependant"
                      :class="{
                        'bg-[#DFF1F1]': selectedEmployee && selectedEmployee.insuredUuid === employee.insuredUuid,
                        'border-b-2 border-blue-200': employee.dependants && employee.dependants.length > 0
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
                    
                    <!-- Show dependants only for the current employee -->
                    <template v-if="!employee.isDependant && employee.dependants && employee.dependants.length > 0">
                      <tr 
                        v-for="(dependant, dIndex) in employee.dependants" 
                        :key="dependant.dependantUuid"
                        class="bg-blue-50"
                        :class="{
                          'bg-blue-100': selectedEmployee && selectedEmployee.insuredUuid === dependant.dependantUuid
                        }"
                      >
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 pl-10">
                          <span class="text-blue-600">↳</span> {{ dIndex + 1 }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ employee.idNumber }} <span class="text-xs text-gray-400">(Employee ID)</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 pl-2">
                          {{ `${dependant.dependantFirstName} ${dependant.dependantFatherName} ${dependant.dependantGrandFatherName}`.trim() }}
                          <span class="text-xs text-blue-600 ml-1">(Dependant - {{ dependant.relationship }})</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ employee.phone }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Dependant ({{ dependant.relationship }})
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-bold">
                          <span :class="dependant.dependantStatus === 'ACTIVE' ? 'bg-[#DFF1F1] text-[#02676B] p-1' : 'text-[#DB2E48] bg-[#DB2E481A] p-1'">
                            {{ dependant.dependantStatus === 'ACTIVE' ? 'Eligible' : 'Not Eligible' }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            type="button"
                            @click="selectEmployee({
                              insuredUuid: dependant.dependantUuid,
                              fullName: `${dependant.dependantFirstName} ${dependant.dependantFatherName} ${dependant.dependantGrandFatherName}`.trim(),
                              phone: employee.phone,
                              idNumber: employee.idNumber,
                              position: `Dependant (${dependant.relationship})`,
                              birthDate: dependant.dependantBirthDate,
                              eligible: dependant.dependantStatus === 'ACTIVE',
                              status: dependant.dependantStatus,
                              gender: dependant.dependantGender,
                              email: employee.email,
                              address: employee.address,
                              isDependant: true,
                              dependantUuid: dependant.dependantUuid,
                              employeeUuid: employee.insuredUuid
                            })"
                            :class="{
                              'text-white bg-[#02676B] px-4 py-2 hover:bg-teal-900': 
                                !(selectedEmployee && selectedEmployee.insuredUuid === dependant.dependantUuid) && dependant.dependantStatus === 'ACTIVE',
                              'text-white bg-[#02676B] px-4 py-2 rounded': 
                                selectedEmployee && selectedEmployee.insuredUuid === dependant.dependantUuid && dependant.dependantStatus === 'ACTIVE',
                              'bg-[#02676B1A] text-white px-4 py-2 cursor-not-allowed': 
                                dependant.dependantStatus !== 'ACTIVE'
                            }"
                            :disabled="dependant.dependantStatus !== 'ACTIVE'"
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

        <!-- Services/Drugs Section -->
        <selectServices
          v-model:activeTab="activeTab"
          :search-query="activeTab === 'services' ? searchServiceQuery : searchDrugQuery"
          :pending="fetchPending"
          :available-items="activeTab === 'services' ? availableServices : availableDrugs"
          :added-items="activeTab === 'services' ? addedServices : addedDrugs"
          :remarks="remarks"
          @update:remarks="handleUpdateRemarks"
          :primary-diagnosis="primaryDiagnosis"
          :secondary-diagnosis="secondaryDiagnosis"
          @update:search-query="activeTab === 'services' ? searchServiceQuery = $event : searchDrugQuery = $event"
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

        <!-- Form Actions -->
        <div class="pt-4 px-6 border-t border-[#DFDEF2] flex justify-end space-x-4">
          <Button
            type="button"
            @click="props.onCancel"
            class="text-[#75778B] px-6 py-4 border-[1px] border-[#75778B] rounded-lg hover:bg-gray-50"
            :disabled="fetchPending"
          >
            Cancel
          </Button>
          <ModalFormSubmitButton
            v-if="activeTab === 'services'"
            :pending="fetchPending"
            btn-text="Update Service Claim"
            class="bg-primary hover:bg-teal-700 text-white px-6 py-2"
            :disabled="fetchPending"
          />
          <ModalFormSubmitButton
            v-else-if="activeTab === 'drugs'"
            :pending="fetchPending"
            btn-text="Update Drug Claim"
            class="bg-primary hover:bg-teal-700 text-white px-6 py-2"
            :disabled="fetchPending"
          />
        </div>
      </div>
    </template>
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