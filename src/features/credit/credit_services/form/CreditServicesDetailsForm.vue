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
const displayMode = ref(true); // view-only mode: show details fetched via getDispensingDetail
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

// Helpers for display-only view
function claimStatusClasses(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'APPROVED') return 'bg-green-100 text-green-700 border border-green-200';
  if (s === 'REJECTED') return 'bg-red-100 text-red-700 border border-red-200';
  if (s === 'SUBMITTED') return 'bg-blue-100 text-blue-700 border border-blue-200';
  return 'bg-amber-100 text-amber-700 border border-amber-200'; // DRAFT or unknown
}

function downloadAttachment(name, contentType, base64) {
  try {
    const link = document.createElement('a');
    link.href = `data:${contentType};base64,${base64}`;
    link.download = name || 'attachment';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    toasted(false, 'Error', 'Failed to download attachment');
  }
}

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
  size: 10000000 
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
      paymentAmount: `ETB ${service.totalPrice?.toFixed(2) || '0.00'}`,
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
      dosageInstructions: drug.dosageInstructions || '1',
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
          dose: item.dosageInstructions || '1',
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
    const response = await getDispensingDetail(props.dispensingUuid);
    if (response.success) {
      claimData.value = response.data;
      dispensingDate.value = claimData.value.dispensingDate;
      prescriptionNumber.value = claimData.value.prescriptionNumber || '';
      pharmacyTransactionId.value = claimData.value.pharmacyTransactionId || '';
      primaryDiagnosis.value = claimData.value.primaryDiagnosis || '';
      secondaryDiagnosis.value = claimData.value.secondaryDiagnosis || '';

      // Build items from API
      addedServices.value = [];
      addedDrugs.value = [];
      if (Array.isArray(claimData.value.items)) {
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
              paymentAmount: `ETB ${Number(item.totalPrice || 0).toFixed(2)}`
            });
          } else if (item.itemType === 'DRUG') {
            addedDrugs.value.push({
              ...baseItem,
              itemType: 'DRUG',
              drugUuid: item.itemUuid,
              drugCode: item.medicationCode,
              drugName: item.medicationName,
              price: Number(item.unitPrice || 0),
              route: item.route,
              frequency: item.frequency,
              dosageInstructions: item.dosageInstructions,
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

// Disabled in display-only mode

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
  <!-- Display-only mode -->
  <div v-if="displayMode" class="dispensing-details-container">
    <div v-if="loading" class="loading-container">
      <Spinner class="h-8 w-8 text-teal-600" />
    </div>
    
    <div v-else class="details-content">
      <!-- Header Section -->
      <div class="header-section">
        <div class="invoice-info">
          <div class="section-label">Invoice</div>
          <div class="invoice-number">{{ claimData.invoiceNumber }}</div>
          <div class="dispensing-date">
            Dispensing Date: <span class="date-value">{{ claimData.dispensingDate }}</span>
          </div>
        </div>
        <div class="status-badge-container">
          <span :class="`status-badge ${claimStatusClasses(claimData.claimStatus)}`">
            {{ claimData.claimStatus || 'DRAFT' }}
          </span>
        </div>
      </div>
          <div class="items-section">
        <div class="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
          </svg>
          Dispensed Items
        </div>
        
        <div class="items-table-container">
          <table class="items-table">
            <thead>
              <tr>
                <th class="index-col">#</th>
                <th class="code-col">Code</th>
                <th class="name-col">Name</th>
                <th class="type-col">Type</th>
                <th class="qty-col">Qty</th>
                <th class="price-col">Unit Price</th>
                <th class="total-col">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(it, idx) in claimData.items || []" :key="it.itemUuid || idx" class="item-row">
                <td class="index-col">{{ idx + 1 }}</td>
                <td class="code-col">
                  <span class="item-code">{{ it.medicationCode }}</span>
                </td>
                <td class="name-col">
                  <div class="item-name">{{ it.medicationName }}</div>
                </td>
                <td class="type-col">
                  <span :class="`item-type ${it.itemType?.toLowerCase()}`">
                    {{ it.itemType }}
                  </span>
                </td>
                <td class="qty-col">{{ it.quantity }}</td>
                <td class="price-col">ETB {{ Number(it.unitPrice || 0).toFixed(2) }}</td>
                <td class="total-col">
                  <span class="total-amount">ETB {{ Number(it.totalPrice || 0).toFixed(2) }}</span>
                </td>
              </tr>
              <tr v-if="!claimData.items || claimData.items.length === 0">
                <td colspan="7" class="no-items">No items found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card total-amount">
          <div class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="card-content">
            <div class="card-label">Total Amount</div>
            <div class="card-value">ETB {{ Number(claimData.totalAmount || 0).toFixed(2) }}</div>
          </div>
        </div>
        
        <div class="summary-card insurance-coverage">
          <div class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="card-content">
            <div class="card-label">Insurance Coverage</div>
            <div class="card-value">ETB {{ Number(claimData.insuranceCoverage || 0).toFixed(2) }}</div>
          </div>
        </div>
        
        <div class="summary-card patient-responsibility">
          <div class="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="card-content">
            <div class="card-label">Patient Responsibility</div>
            <div class="card-value">ETB {{ Number(claimData.patientResponsibility || 0).toFixed(2) }}</div>
          </div>
        </div>
      </div>
      
      <!-- Diagnosis Section -->
      <div class="diagnosis-section">
        <div class="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clip-rule="evenodd" />
          </svg>
          Diagnosis Information
        </div>
        <div class="diagnosis-grid">
          <div class="diagnosis-card">
            <div class="diagnosis-label">Primary Diagnosis</div>
            <div class="diagnosis-value">{{ claimData.primaryDiagnosis || '—' }}</div>
          </div>
          <div class="diagnosis-card">
            <div class="diagnosis-label">Secondary Diagnosis</div>
            <div class="diagnosis-value">{{ claimData.secondaryDiagnosis || '—' }}</div>
          </div>
        </div>
      </div>
      
      <!-- Items Section -->
  
      <!-- Attachment Section -->
      <div v-if="claimData.attachmentBase64" class="attachment-section">
        <div class="section-title">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
          </svg>
          Attachment
        </div>
        <div class="attachment-card">
          <div class="attachment-info">
            <div class="attachment-icon">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="attachment-details">
              <div class="attachment-name">{{ claimData.attachmentFileName || 'File' }}</div>
              <div class="attachment-type">{{ claimData.attachmentContentType }}</div>
            </div>
          </div>
          <div class="attachment-actions">
            <a :href="`data:${claimData.attachmentContentType};base64,${claimData.attachmentBase64}`" 
               target="_blank" 
               rel="noopener" 
               class="action-btn view-btn">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
              View
            </a>
            <button type="button" 
                    @click="downloadAttachment(claimData.attachmentFileName, claimData.attachmentContentType, claimData.attachmentBase64)" 
                    class="action-btn download-btn">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              Download
            </button>
          </div>
        </div>
        <div class="attachment-preview">
          <img :src="`data:${claimData.attachmentContentType};base64,${claimData.attachmentBase64}`" 
               alt="Attachment" 
               class="preview-image" />
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="action-section">
        <button type="button" 
                @click="onCancel()" 
                class="close-btn">
          Close
        </button>
      </div>
    </div>
  </div>
  
  <!-- Edit flow (kept for future) -->
  <Form v-else
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
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <!-- <div>
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
          </div>  -->
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
.dispensing-details-container {
  @apply bg-white rounded-xl shadow-sm overflow-hidden;
}

.loading-container {
  @apply flex justify-center p-8;
}

.details-content {
  @apply p-3 md:p-4 space-y-4;
}

/* Header Section */
.header-section {
  @apply flex flex-col md:flex-row md:items-start justify-between gap-3 p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-100;
}

.invoice-info {
  @apply flex-1;
}

.section-label {
  @apply text-xs font-medium text-teal-700 uppercase tracking-wide;
}

.invoice-number {
  @apply text-lg font-bold text-gray-800 mt-1;
}

.dispensing-date {
  @apply text-sm text-gray-600 mt-1;
}

.date-value {
  @apply font-medium text-gray-700;
}

.status-badge-container {
  @apply flex-shrink-0;
}

.status-badge {
  @apply px-2 py-1 rounded-full text-xs font-semibold;
}

/* Summary Grid */
.summary-grid {
  @apply grid grid-cols-1 md:grid-cols-3 gap-3;
}

.summary-card {
  @apply flex items-start p-3 rounded-lg border shadow-sm;
}

.total-amount {
  @apply bg-white border-gray-200;
}

.insurance-coverage {
  @apply bg-emerald-50 border-emerald-200;
}

.patient-responsibility {
  @apply bg-amber-50 border-amber-200;
}

.card-icon {
  @apply flex-shrink-0 p-2 rounded-md mr-3 mt-1;
}

.total-amount .card-icon {
  @apply bg-blue-100 text-blue-600;
}

.insurance-coverage .card-icon {
  @apply bg-emerald-100 text-emerald-600;
}

.patient-responsibility .card-icon {
  @apply bg-amber-100 text-amber-600;
}

.card-content {
  @apply flex-1;
}

.card-label {
  @apply text-xs font-medium text-gray-500 mb-1;
}

.card-value {
  @apply text-base font-bold;
}

.total-amount .card-value {
  @apply text-gray-800;
}

.insurance-coverage .card-value {
  @apply text-emerald-700;
}

.patient-responsibility .card-value {
  @apply text-amber-700;
}

/* Section Titles */
.section-title {
  @apply flex items-center text-xs font-semibold text-gray-700 mb-2;
}

.section-title svg {
  @apply mr-2 text-teal-500;
}

/* Diagnosis Section */
.diagnosis-section {
  @apply p-3 bg-white rounded-lg border border-gray-200;
}

.diagnosis-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-3;
}

.diagnosis-card {
  @apply p-2 bg-gray-50 rounded-md border border-gray-100;
}

.diagnosis-label {
  @apply text-xs font-medium text-gray-500 mb-1;
}

.diagnosis-value {
  @apply text-xs text-gray-800 font-medium;
}

/* Items Section */
.items-section {
  @apply p-3 bg-white rounded-lg border border-gray-200;
}

.items-table-container {
  @apply overflow-x-auto rounded-lg border border-gray-200;
}

.items-table {
  @apply min-w-full text-sm;
}

.items-table thead {
  @apply bg-teal-50;
}

.items-table th {
  @apply px-3 py-2 text-left text-xs font-semibold text-teal-700 uppercase tracking-wider border-b border-teal-100;
}

.items-table tbody {
  @apply bg-white divide-y divide-gray-100;
}

.item-row {
  @apply transition-colors hover:bg-teal-50;
}

.items-table td {
  @apply px-3 py-2 text-gray-700;
}

.index-col {
  @apply w-12 text-center;
}

.code-col {
  @apply w-20;
}

.name-col {
  @apply min-w-[200px];
}

.type-col {
  @apply w-24;
}

.qty-col, .price-col, .total-col {
  @apply text-right w-20;
}

.item-code {
  @apply bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded;
}

.item-name {
  @apply font-medium text-gray-900;
}

.item-type {
  @apply inline-block px-2 py-1 text-xs font-medium rounded-full;
}

.item-type.service {
  @apply bg-blue-100 text-blue-800;
}

.item-type.drug {
  @apply bg-purple-100 text-purple-800;
}

.total-amount {
  @apply font-semibold text-gray-900;
}

.no-items {
  @apply px-4 py-8 text-center text-sm text-gray-500 italic;
}

/* Attachment Section */
.attachment-section {
  @apply p-3 bg-white rounded-lg border border-gray-200;
}

.attachment-card {
  @apply flex flex-col md:flex-row md:items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4;
}

.attachment-info {
  @apply flex items-center mb-4 md:mb-0;
}

.attachment-icon {
  @apply mr-3;
}

.attachment-details {
  @apply flex-1;
}

.attachment-name {
  @apply text-xs font-medium text-gray-800;
}

.attachment-type {
  @apply text-xs text-gray-500 mt-1;
}

.attachment-actions {
  @apply flex gap-2;
}

.action-btn {
  @apply flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-md transition-colors;
}

.view-btn {
  @apply bg-white text-gray-700 border border-gray-300 hover:bg-gray-50;
}

.download-btn {
  @apply bg-teal-600 text-white hover:bg-teal-700;
}

.attachment-preview {
  @apply flex justify-center;
}

.preview-image {
  @apply max-h-56 rounded-lg border border-gray-200 shadow-sm;
}

/* Action Section */
.action-section {
  @apply flex justify-end pt-3 border-t border-gray-200;
}

.close-btn {
  @apply px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .header-section {
    @apply p-3;
  }
  
  .summary-grid {
    @apply grid-cols-1 gap-3;
  }
  
  .summary-card {
    @apply p-3;
  }
  
  .items-table th,
  .items-table td {
    @apply px-3 py-2;
  }
  
  .attachment-card {
    @apply p-3;
  }
}
</style>