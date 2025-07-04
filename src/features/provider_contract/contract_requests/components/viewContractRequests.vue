<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPayerContractById, updatePayerContract } from '../api/contractRequestApi';
import icons from '@/utils/icons';
import { toasted } from '@/utils/utils';
import { useAuthStore } from '@/stores/auth';
import Spinner from '@/components/Spinner.vue';
import Button from '@/components/Button.vue';
import { openModal } from '@customizer/modal-x';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const contractId = route.params.id;
const loadingContract = ref(true);
const activeTab = ref('services');
const showInsured = ref(false);

function handleApprove() {
    openModal('acceptContract');
}

function handleReject() {
    openModal('rejectContract');
}

const formData = ref({
  contractHeaderUuid: '',
  contractName: '',
  contractDescription: '',
  startDate: '',
  endDate: '',
  status: 'ACTIVE',
  contractDetails: [],
  insuredSummaries: [],
  providerLogoBase64: ''
});

// Handle image loading errors
const handleImageError = (event) => {
  event.target.style.display = 'none';
  // Or use a placeholder:
  // event.target.src = '/path/to/placeholder-image.png';
};

// Computed properties to separate services and drugs
const services = computed(() => {
  return formData.value.contractDetails.filter(item => item.itemType === 'SERVICE');
});

const drugs = computed(() => {
  return formData.value.contractDetails.filter(item => item.itemType === 'DRUG');
});

// Calculate percentage difference
const calculateDifference = (negotiatedPrice, originalPrice) => {
  if (!originalPrice || originalPrice === 0) return 0;
  return ((negotiatedPrice - originalPrice) / originalPrice) * 100;
};

async function fetchContract() {
  try {
    loadingContract.value = true;
    const response = await getPayerContractById(contractId);
    
    if (response && response.data) {
      formData.value = response.data;
    } else {
      throw new Error('Contract data not found in response');
    }
  } catch (err) {
    console.error('Error fetching contract:', err);
    toasted(false, 'Failed to load contract data');
    router.push('/contract_requests');
  } finally {
    loadingContract.value = false;
  }
}

onMounted(async () => {
  await fetchContract();
});
</script>
<template>
  <div v-if="loadingContract" class="flex justify-center items-center h-64">
    <Spinner size="lg" />
    <span class="ml-2 text-gray-700 font-medium">Loading contract data...</span>
  </div>

  <div v-else class="space-y-6">
     <div class=" flex gap-6">
        <div>
         <div class="bg-white w-full p-6  flex items-center ">
    <!-- Logo -->
 <div class="w-44 h-44 flex items-center justify-center bg-[#F6F7FA] rounded-lg mr-6 p-4">
  <img 
    v-if="formData.providerLogoBase64" 
    :src="formData.providerLogoBase64" 
    alt="Provider Logo" 
    class="w-full h-full object-contain p-4"
    @error="handleImageError"
  />
  <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
</div>
    <!-- Contract Info -->
     <div class="bg-[#F6F7FA] rounded-xl p-4 w-[77rem]">
    <!-- Title -->
    <h2 class="text-lg font-semibold text-[#6B7280] mb-3 w-full flex justify-between"><p>Contract Detail </p><p>{{ formData.contractName }}</p></h2>
    <div class="border-t border-[#E5E7EB] mb-4"></div>

    <!-- Grid layout with vertical divider -->
   <div class="space-y-4 px-4">
  <!-- First Row -->
  <div class="flex justify-between items-center pb-4  border-[#E5E7EB]">
    <div class="flex items-center text-sm border-l border-[#E5E7EB] text-gray-600 w-1/2">
      <span class="font-medium w-40">Contract ID:</span>
      <span class="text-gray-800 font-semibold">{{ formData.contractCode }}</span>
    </div>
    <div class="flex items-center text-sm text-gray-600 w-1/2 pl-8">
      <span class="font-medium w-40">Contract Status:</span>
      <span class="text-[#2C9984] font-semibold">{{ formData.status }}</span>
    </div>
  </div>

  <!-- Second Row -->
  <div class="flex justify-between items-center pb-4 ">
    <div class="flex items-center text-sm border-l border-red text-gray-600 w-1/2">
      <span class="font-medium border-l w-40">Contract From:</span>
      <span class="text-gray-800 font-semibold">{{ formData.startDate }}</span>
    </div>
    <div class="flex items-center text-sm text-gray-600 w-1/2 pl-8">
      <span class="font-medium w-40">Contract To:</span>
      <span class="text-gray-800 font-semibold">{{ formData.endDate }}</span>
    </div>
  </div>

  <!-- Third Row -->
  <div class="flex justify-between items-center">
    <div class="flex items-center text-sm text-gray-600 w-1/2">
      <span class="font-medium w-40">Number of Employees:</span>
      <span class="text-gray-800 font-semibold">{{ formData.contractEmployees }}</span>
    </div>
    <div class="flex items-center text-sm text-gray-600 w-1/2 pl-8">
      <span class="font-medium w-40">Employee Groups:</span>
      <span class="text-gray-800 font-semibold">{{ formData.employeeGroups }}</span>
    </div>
  </div>
</div>
  </div>
  </div>
         
        </div>
      
      </div>
    <div class="bg-white rounded-md p-6 space-y-6 shadow-sm">
      

      <div class="bg-white rounded-md p-6 mt-6 shadow-sm">
        <div class="flex items-center p-4 justify-between border-b border-gray-200">
          <h3 class="text-md text-[#75778B] font-semibold">
            Contract Items
          </h3>
          <div class="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              type="button"
              @click="activeTab = 'services'"
              :class="[
                'px-4 py-2 text-sm font-medium transition-colors duration-200',
                activeTab === 'services' ? 'bg-[#02676B] text-white' : 'text-[#75778B] hover:bg-gray-100'
              ]"
            >
              Services ({{ services.length }})
            </button>
            <button
              type="button"
              @click="activeTab = 'drugs'"
              :class="[
                'px-4 py-2 text-sm font-medium transition-colors duration-200',
                activeTab === 'drugs' ? 'bg-[#02676B] text-white' : 'text-[#75778B] hover:bg-gray-100'
              ]"
            >
              Drugs ({{ drugs.length }})
            </button>
          </div>
        </div>

        <div class="p-3">
          <table class="w-full bg-white table-auto text-sm rounded-lg overflow-hidden shadow-sm">
            <thead>
              <tr class="text-left font-bold text-gray-700 bg-gray-50">
                <th class="p-3 w-12">#</th>
                <th class="p-3">{{ activeTab === 'services' ? 'Service' : 'Drug' }} Name</th>
                <th class="p-3">Original Price</th>
                <th class="p-3">Negotiated Price</th>
                <th class="p-3">Difference</th>
                <th class="p-3">Groups</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in activeTab === 'services' ? services : drugs"
                :key="item.contractDetailUuid"
                class="border-b border-gray-100 hover:bg-gray-50"
              >
                <td class="p-3">{{ index + 1 }}</td>
                <td class="p-3 font-medium text-gray-800">
                  {{ item.serviceName || item.drugName }}
                </td>
                <td class="p-3 text-gray-700">
                  ETB {{ item.price?.toLocaleString('en-US') || '0.00' }}
                </td>
                <td class="p-3 text-gray-700">
                  ETB {{ item.negotiatedPrice?.toLocaleString('en-US') || '0.00' }}
                </td>
                <td class="p-3">
                  <span 
                    :class="{
                      'text-green-600': calculateDifference(item.negotiatedPrice, item.price) >= 0,
                      'text-red-600': calculateDifference(item.negotiatedPrice, item.price) < 0
                    }"
                  >
                    {{ calculateDifference(item.negotiatedPrice, item.price).toFixed(2) }}%
                  </span>
                </td>
                <td class="p-3">
                  <span v-if="item.assignedGroups && item.assignedGroups.length > 0">
                    {{ item.assignedGroups.join(', ') }}
                  </span>
                  <span v-else class="text-gray-400">All groups</span>
                </td>
              </tr>
              <tr v-if="(activeTab === 'services' ? services : drugs).length === 0">
                <td colspan="6" class="p-4 text-center text-gray-500">
                  No {{ activeTab }} found in this contract.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
<div class="bg-white rounded-xl p-6 mt-6 shadow-md">
  <!-- Header and Toggle -->
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-xl font-semibold text-[#02676B] flex items-center gap-2">
      <i v-html="icons.people" class="w-5 h-5 text-[#02676B]"></i>
      Insured Members
    </h3>
    <button
      @click="showInsured = !showInsured"
      class="text-sm text-[#02676B] border border-[#02676B] px-3 py-1 rounded-md hover:bg-[#02676B] hover:text-white transition-colors duration-200"
    >
      {{ showInsured ? 'Hide' : 'Show' }}
    </button>
  </div>

  <!-- Transitioned Table -->
  <Transition name="dropdown" appear>
    <div v-if="showInsured" class="overflow-x-auto rounded-lg border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200 text-sm">
        <thead class="bg-[#F1F5F9] text-gray-600 uppercase text-xs tracking-wider">
          <tr>
            <th class="px-6 py-3 text-left font-semibold">Name</th>
            <th class="px-6 py-3 text-left font-semibold">Membership #</th>
            <th class="px-6 py-3 text-left font-semibold">Dependants</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr
            v-for="insured in formData.insuredSummaries"
            :key="insured.insuredUuid"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4 text-gray-800 font-medium whitespace-nowrap">
              {{ insured.fullName }}
            </td>
            <td class="px-6 py-4 text-gray-700 whitespace-nowrap">
              {{ insured.membershipNumber }}
            </td>
            <td class="px-6 py-4 text-gray-700">
              <div v-if="insured.dependants?.length">
                <ul class="list-disc pl-4 space-y-1 text-sm">
                  <li v-for="dependant in insured.dependants" :key="dependant.dependantUuid">
                    {{ dependant.fullName }}
                    <span class="text-gray-500">({{ dependant.relationshipType }})</span>
                  </li>
                </ul>
              </div>
              <div v-else class="text-gray-400 italic">None</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </Transition>
</div>
<div class=" flex justify-end gap-4 text-white">
  <Button @click="handleReject"  class="bg-[#DB2E48] py-2.5 px-6">Reject Contract</Button>
  <Button @click="handleApprove"  class="bg-primary  py-2.5 px-6">Accept Contract</Button>
  </div>


    </div>
  </div>
</template>

<style scoped>
.required-field {
  @apply border-l-2 border-[#02676B];
}

.error-field {
  @apply border-red-500;
}

.error-message {
  @apply text-red-500 text-xs mt-1;
}

input[type="checkbox"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  outline: none;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s, border-color 0.2s;
}

input[type="checkbox"]:checked {
  background-color: #02676B;
  border-color: #02676B;
}

input[type="checkbox"]:checked::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 1px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

input[type="checkbox"]:focus {
  box-shadow: 0 0 0 2px rgba(2, 103, 107, 0.2);
}

input[type="date"]:required {
  border-left: 2px solid #02676B;
}

select:focus {
  @apply border-[#02676B] ring-[#02676B];
}

th {
  @apply font-bold;
}

button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

table {
  @apply min-w-full divide-y divide-gray-200;
}

th {
  @apply py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider;
}

td {
  @apply py-4;
}
/* Slide-fade dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.dropdown-enter-from,
.dropdown-leave-to {
  max-height: 0;
  opacity: 0;
  transform: scaleY(0.95);
}
.dropdown-enter-to,
.dropdown-leave-from {
  max-height: 1000px;
  opacity: 1;
  transform: scaleY(1);
}

</style>