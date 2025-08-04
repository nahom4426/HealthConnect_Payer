<script setup>
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
import viewServices from '../components/viewServices.vue';
import EmployeeDetails from '../components/EmployeeDetails.vue';
import { getDispensingDetail, updateDispensingRecord } from '../api/creditServicesApi';

const props = defineProps({
  dispensingUuid: { type: String, required: true },
  onUpdated: { type: Function, default: () => {} },
  onCancel: { type: Function, required: true }
});

const payers = ref([]);
const employees = ref([]);
const selectedPayer = ref(null);
const selectedEmployee = ref(null);
const searchEmployeeQuery = ref('');
const searchServiceQuery = ref('');
const searchDrugQuery = ref('');
const fetchPending = ref(false);
const error = ref(null);
const currentStep = ref('selectEmployee');
const activeTab = ref('services');
const availableServices = ref([]);
const availableDrugs = ref([]);
const addedServices = ref([]);
const addedDrugs = ref([]);
const primaryDiagnosis = ref('');
const secondaryDiagnosis = ref('');
const auth = useAuthStore();
const providerUuid = ref(auth.auth?.user?.providerUuid || '');
const prescriptionNumber = ref('');
const pharmacyTransactionId = ref('');
const dispensingDate = ref(new Date().toISOString().split('T')[0]);
const loading = ref(true);
const claimData = ref({});
const remarks = ref({});
const drugSearchTimeout =ref(null);

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

const payerOptions = computed(() =>
  payers.value.map(p => ({
    label: `${p.payerName} (${p.telephone || p.email || 'N/A'})`,
    value: p.payerUuid,
  }))
);

async function fetchPayers() {
  try {
    fetchPending.value = true;
    const response = await getActiveInstitutions({ page: 1, limit: 100 });
    payers.value = (response?.data?.content || []).map(item => ({
      payerUuid: item.payerUuid,
      payerName: item.payerName || `Unnamed Payer (${item.email})`,
      email: item.email,
      telephone: item.telephone
    }));
    if (payers.value.length === 0) error.value = 'No payers available';
  } catch (err) {
    console.error('Error fetching payers:', err);
    error.value = 'Failed to load payers';
  } finally {
    fetchPending.value = false;
  }
}

async function fetchEmployees() {
  if (!selectedPayer.value) return;
  try {
    fetchPending.value = true;
    const response = await searchInsuredByInstitution(selectedPayer.value, {
      search: searchEmployeeQuery.value ,
  page: 1,
  size: 100000 
    });
    const employeesData = Array.isArray(response) ? response :
      response?.content || response?.data?.content || [];

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

      const dependantRecords = emp.dependants?.map(dep => ({
        insuredUuid: dep.dependantUuid,
        fullName: `${dep.dependantFirstName || ''} ${dep.dependantFatherName || ''} ${dep.dependantGrandFatherName || ''}`.trim(),
        phone: emp.phone,
        email: emp.email || 'N/A',
        gender: dep.dependantGender || 'Unknown',
        address: emp.address || 'Unknown',
        eligible: dep.dependantStatus === 'ACTIVE',
        position: `Dependant (${dep.relationship})`,
        idNumber: 'N/A',
        birthDate: dep.dependantBirthDate || 'Unknown',
        profilePictureBase64: null,
        status: dep.dependantStatus || 'UNKNOWN',
        isDependant: true,
        dependantUuid: dep.dependantUuid,
        employeeUuid: emp.insuredUuid
      })) || [];

      return [employeeRecord, ...dependantRecords];
    });

    if (employees.value.length === 0) {
      error.value = 'No employees found for this payer';
    }
  } catch (err) {
    console.error('Error fetching employees:', err);
    error.value = 'Failed to load employees';
  } finally {
    fetchPending.value = false;
  }
}

function selectEmployee(employee) {
  if (!employee.eligible) return;
  selectedEmployee.value = employee;
}

function continueToServices() {
  if (selectedEmployee.value) currentStep.value = 'viewServices';
}

async function fetchServices(query) {
  try {
    fetchPending.value = true;
    const response = await getAllServices(providerUuid.value, { search: query, page: 1, limit: 25 });
    availableServices.value = response.data.content.map(service => ({
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

async function fetchDrugs(query) {
  try {
    fetchPending.value = true;
    const response = await getAllDrugs(providerUuid.value, { search: query, page: 1, limit: 25 });
    availableDrugs.value = response.data.content.map(drug => ({
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

function handleSearchItems({ type, query }) {
  type === 'services' ? fetchServices(query) : fetchDrugs(query);
}
function handleUpdateRemarks(newRemarks) {
  remarks.value = newRemarks;
}
function handleAddItem(item) {
  (activeTab.value === 'services' ? addedServices : addedDrugs).value.push(item);
}
function handleRemoveItem(index) {
  (activeTab.value === 'services' ? addedServices : addedDrugs).value.splice(index, 1);
}
function handleUpdateQuantity({ index, value }) {
  (activeTab.value === 'services' ? addedServices : addedDrugs).value[index].quantity = value;
}
function handleUpdateDiagnosis({ index, primaryDiagnosis: primary, secondaryDiagnosis: secondary }) {
  const list = addedServices;
  if (primary !== undefined) list.value[index].primaryDiagnosis = primary;
  if (secondary !== undefined) list.value[index].secondaryDiagnosis = secondary;
}
function handleUpdateItem({ index, item }) {
  addedDrugs.value[index] = { ...addedDrugs.value[index], ...item };
}
function handleClearItems(tab) {
  if (tab === 'services') {
    addedServices.value = [];
  } else {
    addedDrugs.value = [];
  }
}

function validateForm() {
  if (!selectedPayer.value || !selectedEmployee.value || !dispensingDate.value) {
    error.value = 'Please fill all required fields';
    return false;
  }

  const hasItems = addedServices.value.length > 0 || addedDrugs.value.length > 0;
  if (!hasItems) {
    error.value = 'Please add at least one service or drug';
    return false;
  }

  const invalidDrug = addedDrugs.value.some(item =>
    !item.route || !item.frequency || !item.dose || !item.duration
  );
  if (invalidDrug) {
    error.value = 'Please fill all drug administration details';
    return false;
  }

  return true;
}

async function handleSubmit() {
  if (!validateForm()) return;
  try {
    fetchPending.value = true;
    const payload = {
      dispensingUuid: props.dispensingUuid,
      insuredUuid: selectedEmployee.value.isDependant
        ? selectedEmployee.value.employeeUuid
        : selectedEmployee.value.insuredUuid,
      dependantUuid: selectedEmployee.value.isDependant ? selectedEmployee.value.dependantUuid : null,
      primaryDiagnosis: primaryDiagnosis.value,
      secondaryDiagnosis: secondaryDiagnosis.value,
      medicationItems: [
        ...addedServices.value.map(item => ({
          contractDetailUuid: item.serviceUuid,
          itemType: 'SERVICE',
          remark: item.remark || '',
          price: typeof item.paymentAmount === 'string'
            ? parseFloat(item.paymentAmount.replace('ETB ', '')) || 0
            : Number(item.paymentAmount) || 0,
          quantity: Number(item.quantity) || 1,
          primaryDiagnosis: item.primaryDiagnosis || primaryDiagnosis.value,
          secondaryDiagnosis: item.secondaryDiagnosis || secondaryDiagnosis.value
        })),
        ...addedDrugs.value.map(item => ({
          contractDetailUuid: item.drugUuid,
          itemType: 'DRUG',
          remark: item.remark || '',
          price: item.price || 0,
          quantity: Number(item.quantity) || 1,
          route: item.route || 'oral',
          frequency: item.frequency || 'daily',
          dose: item.dose || '1',
          duration: item.duration || '7 days',
          primaryDiagnosis: item.primaryDiagnosis || primaryDiagnosis.value,
          secondaryDiagnosis: item.secondaryDiagnosis || secondaryDiagnosis.value
        }))
      ]
    };

    const response = await updateDispensingRecord(props.dispensingUuid, payload);
    if (response?.success) {
      toasted(true, 'Success', 'Claim updated successfully');
      props.onUpdated(response.data);
      closeModal();
    } else {
      throw new Error(response?.message || response?.error || 'Update failed without error message');
    }
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || 'Failed to update claim';
    error.value = errorMessage;
    toasted(false, 'Error', errorMessage);
  } finally {
    fetchPending.value = false;
  }
}

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
        const employee = employees.value.find(e =>
          e.insuredUuid === claimData.value.insuredUuid ||
          (e.isDependant && e.dependantUuid === claimData.value.dependantUuid)
        );
        if (employee) {
          selectedEmployee.value = employee;
          currentStep.value = 'viewServices';
        }
      }

      if (claimData.value.items) {
        for (const item of claimData.value.items) {
          const baseItem = {
            id: item.itemUuid,
            remark: item.remark || '',
            quantity: item.quantity || 1,
            primaryDiagnosis: item.primaryDiagnosis || claimData.value.primaryDiagnosis || '',
            secondaryDiagnosis: item.secondaryDiagnosis || claimData.value.secondaryDiagnosis || ''
          };

          if (item.itemType === 'SERVICE') {
            addedServices.value.push({
              ...baseItem,
              itemType: 'SERVICE',
              serviceUuid: item.itemUuid,
              serviceCode: item.medicationCode,
              serviceName: item.medicationName,
              paymentAmount: `ETB ${item.unitPrice?.toFixed(2) || '0.00'}`
            });
          } else if (item.itemType === 'DRUG') {
            addedDrugs.value.push({
              ...baseItem,
              itemType: 'DRUG',
              drugUuid: item.itemUuid,
              drugCode: item.medicationCode,
              drugName: item.medicationName,
              price: item.unitPrice || 0,
              route: item.route,
              frequency: item.frequency,
              dose: item.dose,
              duration: item.duration
            });
          }
        }
        if (addedServices.value.length > 0) {
          activeTab.value = 'services';
        } else if (addedDrugs.value.length > 0) {
          activeTab.value = 'drugs';
        }
      }
    } else {
      throw new Error(response.error || 'Failed to load claim details');
    }
  } catch (err) {
    error.value = err.message || 'Failed to load claim details';
    toasted(false, 'Error', error.value);
  } finally {
    loading.value = false;
  }
});

watch(searchEmployeeQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (selectedPayer.value) fetchEmployees();
  }, 300);
});

watch(selectedPayer, () => {
  if (selectedPayer.value) fetchEmployees();
});

watch(searchDrugQuery, () => {
  clearTimeout(drugSearchTimeout);
  drugSearchTimeout = setTimeout(() => {
    if (searchDrugQuery.value.trim().length > 0) {
      fetchDrugs(searchDrugQuery.value);
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
         {{ error }}
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
        <!-- Employee Details -->
          {{ error }} 
        <EmployeeDetails :employee="employeeDetails" />

        <!-- Credit Service Details -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <Input
              v-model="prescriptionNumber"
              name="prescriptionNumber"
              label="Prescription Number"
              validation="required"
              disabled
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
              disabled
              :attributes="{
                placeholder: 'Enter pharmacy transaction ID',
                disabled
              }"
            />
          </div> 
          <div>
            <Input
              v-model="dispensingDate"
              name="dispensingDate"
              label="Dispensing Date"
              validation="required"
              disabled
              :attributes="{
                type: 'date',
                placeholder: 'Select dispensing date',
                required: true
              }"
            />
          </div>
        </div>

        <!-- Services/Drugs Section -->
        <viewServices
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
          <!-- <ModalFormSubmitButton
            :pending="fetchPending"
            btn-text="Update Claim"
            class="bg-primary hover:bg-teal-700 text-white px-6 py-2"
            :disabled="fetchPending"
          /> -->
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