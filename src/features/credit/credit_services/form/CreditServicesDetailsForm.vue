<script setup>
import { ref, onMounted, computed } from 'vue';
import { getDispensingDetail } from '../api/creditServicesApi';
import { searchInsuredByInstitution } from '@/features/insured_persons/api/insuredPersonsApi';
import EmployeeDetails from '../components/EmployeeDetails.vue';
import Spinner from '@/components/Spinner.vue';

const props = defineProps({
  dispensingUuid: { type: String, required: true }
});

const loading = ref(true);
const claimData = ref({});
const error = ref(null);
const insuredDetails = ref(null);
const fetchPending = ref(false);

// Format employee details to match your edit form's structure
const employeeDetails = computed(() => {
  if (!insuredDetails.value) return null;
  
  return {
    fullName: insuredDetails.value.fullName,
    employeeId: insuredDetails.value.idNumber,
    role: insuredDetails.value.position,
    phone: insuredDetails.value.phone,
    insuredUuid: insuredDetails.value.insuredUuid,
    email: insuredDetails.value.email || 'N/A',
    gender: insuredDetails.value.gender || 'Unknown',
    address: insuredDetails.value.address || 'Unknown',
    idNumber: insuredDetails.value.idNumber,
    birthDate: insuredDetails.value.birthDate || 'Unknown',
    status: insuredDetails.value.status || 'UNKNOWN',
    profilePicture: insuredDetails.value.profilePictureBase64,
    isDependant: insuredDetails.value.isDependant,
    dependantUuid: insuredDetails.value.dependantUuid
  };
});

// Group items by type (DRUG/SERVICE)
const groupedItems = computed(() => {
  const services = [];
  const drugs = [];
  
  claimData.value.items?.forEach(item => {
    if (item.itemType === 'SERVICE') {
      services.push({
        ...item,
        paymentAmount: `ETB ${item.unitPrice?.toFixed(2) || '0.00'}`
      });
    } else if (item.itemType === 'DRUG') {
      drugs.push({
        ...item,
        price: item.unitPrice || 0,
        // Format administration details to match edit form
        route: item.route || 'Oral',
        frequency: item.dosageInstructions?.match(/Every (\d+) hours/)?.[1] ? `${item.dosageInstructions.match(/Every (\d+) hours/)[1]} hours` : 'Daily',
        dose: item.dosageInstructions?.split(' ')[0] || '1',
        duration: item.dosageInstructions?.match(/for (\d+) days/)?.[1] ? `${item.dosageInstructions.match(/for (\d+) days/)[1]} days` : '7 days'
      });
    }
  });
  
  return { services, drugs };
});

// Fetch insured details using the same API as your edit form
async function fetchInsuredDetails() {
  if (!claimData.value.payerUuid || !claimData.value.insuredUuid) return;
  
  try {
    fetchPending.value = true;
    const response = await searchInsuredByInstitution(claimData.value.payerUuid, {
      search: ""
    });
    
    const employeesData = Array.isArray(response) ? response :
      response?.content || response?.data?.content || [];

    // Find the matching insured (employee or dependant)
    const employee = employeesData.find(e => 
      e.insuredUuid === claimData.value.insuredUuid ||
      (e.dependants && e.dependants.some(d => d.dependantUuid === claimData.value.insuredUuid))
    );

    if (employee) {
      // Check if it's a dependant
      const isDependant = employee.dependants?.some(d => d.dependantUuid === claimData.value.insuredUuid);
      
      if (isDependant) {
        const dependant = employee.dependants.find(d => d.dependantUuid === claimData.value.insuredUuid);
        insuredDetails.value = {
          insuredUuid: dependant.dependantUuid,
          fullName: `${dependant.dependantFirstName || ''} ${dependant.dependantFatherName || ''} ${dependant.dependantGrandFatherName || ''}`.trim(),
          phone: employee.phone,
          email: employee.email || 'N/A',
          gender: dependant.dependantGender || 'Unknown',
          address: employee.address || 'Unknown',
          eligible: dependant.dependantStatus === 'ACTIVE',
          position: `Dependant (${dependant.relationship})`,
          idNumber: employee.idNumber,
          birthDate: dependant.dependantBirthDate || 'Unknown',
          profilePictureBase64: null,
          status: dependant.dependantStatus || 'UNKNOWN',
          isDependant: true,
          dependantUuid: dependant.dependantUuid,
          employeeUuid: employee.insuredUuid
        };
      } else {
        // It's an employee
        insuredDetails.value = {
          insuredUuid: employee.insuredUuid,
          fullName: `${employee.firstName || ''} ${employee.fatherName || ''} ${employee.grandFatherName || ''}`.trim(),
          phone: employee.phone,
          email: employee.email || 'N/A',
          gender: employee.gender || 'Unknown',
          address: employee.address || 'Unknown',
          eligible: employee.status === 'ACTIVE',
          position: employee.position || 'Unknown position',
          idNumber: employee.idNumber || 'N/A',
          birthDate: employee.birthDate || 'Unknown',
          profilePictureBase64: employee.profilePictureBase64 || null,
          status: employee.status || 'UNKNOWN',
          isDependant: false
        };
      }
    }
  } catch (err) {
    console.error('Error fetching insured details:', err);
  } finally {
    fetchPending.value = false;
  }
}

onMounted(async () => {
  try {
    loading.value = true;
    const response = await getDispensingDetail(props.dispensingUuid);
    
    if (response?.success) {
      claimData.value = response.data;
      await fetchInsuredDetails();
    } else {
      throw new Error(response?.error || 'Failed to load claim details');
    }
  } catch (err) {
    error.value = err.message || 'Failed to load claim details';
    console.error('Error loading dispensing details:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm">
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center p-8">
      <Spinner class="h-8 w-8 text-teal-600" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      {{ error }}
    </div>

    <!-- Details Display -->
    <template v-else>
      <!-- Header -->
      <div class="p-6 border-b">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">Dispensing Record Details</h2>
            <div class="flex items-center mt-2 space-x-4">
              <span class="text-sm text-gray-500">
                Invoice: {{ claimData.invoiceNumber || 'N/A' }}
              </span>
              <span class="text-sm text-gray-500">
                Status: 
                <span class="font-medium" :class="{
                  'text-green-600': claimData.claimStatus === 'APPROVED',
                  'text-yellow-600': claimData.claimStatus === 'PENDING',
                  'text-blue-600': claimData.claimStatus === 'DRAFT',
                  'text-red-600': claimData.claimStatus === 'REJECTED'
                }">
                  {{ claimData.claimStatus || 'N/A' }}
                </span>
              </span>
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-500">Branch</div>
            <div class="font-medium">{{ claimData.branchName || 'N/A' }}</div>
          </div>
        </div>
      </div>

      <!-- Employee Details (matches your edit form layout) -->
      <div v-if="employeeDetails" class="p-6 border-b">
        <EmployeeDetails :employee="employeeDetails" />
      </div>

      <!-- Claim Metadata (matches your edit form grid layout) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border-b">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Payer</label>
          <div class="p-2 bg-gray-50 rounded border border-gray-200">
            {{ claimData.payerName || 'N/A' }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Prescription Number</label>
          <div class="p-2 bg-gray-50 rounded border border-gray-200">
            {{ claimData.prescriptionNumber || 'N/A' }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Pharmacy Transaction ID</label>
          <div class="p-2 bg-gray-50 rounded border border-gray-200">
            {{ claimData.pharmacyTransactionId || 'N/A' }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Dispensing Date</label>
          <div class="p-2 bg-gray-50 rounded border border-gray-200">
            {{ claimData.dispensingDate || 'N/A' }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Prescribing Physician</label>
          <div class="p-2 bg-gray-50 rounded border border-gray-200">
            {{ claimData.prescribingPhysicianName || 'N/A' }}
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Recorded At</label>
          <div class="p-2 bg-gray-50 rounded border border-gray-200">
            {{ claimData.recordedAt || 'N/A' }}
          </div>
        </div>
      </div>

      <!-- Diagnosis Information -->
      <div class="p-6 border-b" v-if="claimData.primaryDiagnosis || claimData.secondaryDiagnosis">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Diagnosis Information</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Primary Diagnosis</label>
            <div class="p-3 bg-gray-50 rounded border border-gray-200 min-h-20">
              {{ claimData.primaryDiagnosis || 'Not specified' }}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Secondary Diagnosis</label>
            <div class="p-3 bg-gray-50 rounded border border-gray-200 min-h-20">
              {{ claimData.secondaryDiagnosis || 'Not specified' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Medications Section (matches your edit form table layout) -->
      <div v-if="groupedItems.drugs.length > 0" class="p-6 border-b">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Medications</h3>
        <div class="border rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drug Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Administration</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(drug, index) in groupedItems.drugs" :key="drug.itemUuid">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ index + 1 }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ drug.medicationName }}</div>
                  <div class="text-sm text-gray-500">{{ drug.strength || 'N/A' }} {{ drug.formulation || '' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ drug.quantity }} {{ drug.unitOfMeasure || '' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ETB {{ drug.price?.toFixed(2) || '0.00' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <div>
                    <p><span class="font-medium">Route:</span> {{ drug.route }}</p>
                    <p><span class="font-medium">Dose:</span> {{ drug.dose }}</p>
                    <p><span class="font-medium">Frequency:</span> {{ drug.frequency }}</p>
                    <p><span class="font-medium">Duration:</span> {{ drug.duration }}</p>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ drug.remark || 'None' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Summary Section -->
      <div class="p-6">
        <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Financial Summary</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
              <div class="text-xl font-semibold text-gray-900">
                ETB {{ claimData.totalAmount?.toFixed(2) || '0.00' }}
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Patient Responsibility</label>
              <div class="text-xl font-semibold text-gray-900">
                ETB {{ claimData.patientResponsibility?.toFixed(2) || '0.00' }}
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Insurance Coverage</label>
              <div class="text-xl font-semibold text-teal-600">
                ETB {{ claimData.insuranceCoverage?.toFixed(2) || '0.00' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
table {
  @apply min-w-full divide-y divide-gray-200;
}

th {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

td {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-500;
}
</style>

