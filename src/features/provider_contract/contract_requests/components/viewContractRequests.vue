<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getPayerContractById } from "../api/contractRequestApi";
import icons from "@/utils/icons";
import { toasted } from "@/utils/utils";
import { useAuthStore } from "@/stores/auth";
import Spinner from "@/components/Spinner.vue";
import Button from "@/components/Button.vue";
import { openModal } from "@customizer/modal-x";
import * as XLSX from 'xlsx';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const contractId = route.params.id;
const loadingContract = ref(true);
const showInsured = ref(false);
const showContractDetails = ref(false);
const excelFile = ref(null);
const validationResults = ref([]);
const validationPerformed = ref(false);
const importDialog = ref(false);
const excelData = ref([]);
const validationComplete = ref(false);
const status = ref("");
const formData = ref({
  contractHeaderUuid: "",
  contractName: "",
  contractDescription: "",
  startDate: "",
  endDate: "",
  status: "RESUBMITTED",
  contractDetails: [],
  insuredSummaries: [],
  providerLogoBase64: "",
});

// Handle file upload and prepare for validation
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
      
      const headers = sheetData[0].map(h => h.trim());
      
      const getColumnIndex = (patterns) => {
        for (const pattern of patterns) {
          const index = headers.findIndex(h => 
            h.toLowerCase().includes(pattern.toLowerCase())
          );
          if (index !== -1) return index;
        }
        return -1;
      };

      const codeIndex = getColumnIndex(['service code', 'servicecode']);
      const nameIndex = getColumnIndex(['service name', 'servicename']);
      const priceIndex = getColumnIndex(['negotiated price', 'price']);
      
      if (nameIndex === -1 || priceIndex === -1) {
        throw new Error('Missing required columns (name and price) in Excel file');
      }
      
      excelData.value = [];
      for (let i = 1; i < sheetData.length; i++) {
        const row = sheetData[i];
        if (!row[nameIndex]) continue;
        
        excelData.value.push({
          serviceCode: row[codeIndex] || '',
          serviceName: row[nameIndex],
          negotiatedPrice: parseFloat(row[priceIndex]) || 0
        });
      }

      importDialog.value = true;
      excelFile.value = null;
      
    } catch (err) {
      console.error('Error processing Excel file:', err);
      toasted(false, `Error importing file: ${err.message}`);
    }
  };
  reader.readAsArrayBuffer(file);
};

// Perform the actual validation
const performValidation = () => {
  validationResults.value = formData.value.contractDetails.map(contractItem => {
    const importedItem = excelData.value.find(
      item => item.serviceName === contractItem.serviceName || 
             item.serviceCode === contractItem.serviceCode
    );
    
    return {
      ...contractItem,
      importedPrice: importedItem?.negotiatedPrice,
      isValid: importedItem ? 
        Math.abs(importedItem.negotiatedPrice - contractItem.negotiatedPrice) < 0.01 : false,
      notFound: !importedItem
    };
  });

  validationPerformed.value = true;
  validationComplete.value = true;
  importDialog.value = false;
  
  // Animation effect
  setTimeout(() => {
    validationComplete.value = false;
  }, 3000);
  
  const matchCount = validationResults.value.filter(item => item.isValid).length;
  const totalCount = validationResults.value.length;
  
  if (matchCount === totalCount) {
    toasted(true, `Perfect match! All ${totalCount} services validated successfully.`);
  } else {
    toasted(false, "",`Validation complete. ${matchCount}/${totalCount} services matched.`);
  }
};

const services = computed(() => {
  if (validationPerformed.value) {
    return validationResults.value;
  }
  return formData.value.contractDetails;
});

const allServicesValid = computed(() => {
  return validationResults.value.length > 0 && 
         validationResults.value.every(item => item.isValid);
});

async function fetchContract() {
  try {
    loadingContract.value = true;
    const response = await getPayerContractById(contractId);

    if (response && response.data) {
      formData.value = response.data;
    } else {
      throw new Error("Contract data not found in response");
    }
  } catch (err) {
    console.error("Error fetching contract:", err);
    toasted(false, "Failed to load contract data");
    router.push("/contract_requests");
  } finally {
    loadingContract.value = false;
  }
}

function handleApprove() {
  openModal("acceptContract");
}

function handleReject() {
  openModal("rejectContract");
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
    <!-- Collapsible Contract Header -->
    <div 
      class="bg-gradient-to-r from-primary to-white rounded-xl p-6 shadow-lg cursor-pointer transition-all duration-300"
      @click="showContractDetails = !showContractDetails"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="w-12 h-12 flex items-center justify-center bg-white/10 rounded-lg mr-4">
            <img
              v-if="formData.providerLogoBase64"
              :src="formData.providerLogoBase64"
              alt="Provider Logo"
              class="w-full h-full object-contain"
              @error="handleImageError"
            />
            <div v-else class="text-white/50">
              <i v-html="icons.building" class="w-8 h-8"></i>
            </div>
          </div>
          <h1 class="text-xl font-bold text-white">{{ formData.contractName }}</h1>
        </div>
        <i 
          v-html="showContractDetails ? icons.chevron : icons.chevron_Down" 
          class="w-6 h-6 text-white/80 transition-transform duration-300"
        ></i>
      </div>

      <!-- Expanded Details -->
      <div 
        v-if="showContractDetails"
        class="mt-6 pt-6 border-t border-white/20 transition-all duration-300 text-white"
      >
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm opacity-90">Contract ID</p>
            <p class="font-mono text-lg">{{ formData.contractCode || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm opacity-90">Status</p>
            <p class="text-lg font-semibold capitalize">{{ formData.status.toLowerCase() }}</p>
          </div>
          <div>
            <p class="text-sm opacity-90">Valid From</p>
            <p class="text-lg">{{ formData.startDate }}</p>
          </div>
          <div>
            <p class="text-sm opacity-90">Valid To</p>
            <p class="text-lg">{{ formData.endDate }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Insured Section (if needed) -->
   

    <!-- Validation Card -->
    <div class="bg-white rounded-xl p-6 shadow-md border border-gray-100">
      <div class="flex justify-between items-center mb-2">
        <div>
          <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i v-html="icons.contracts" class="w-5 h-5 text-primary"></i>
            Contract Validation
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Import the negotiated contract to verify service prices
          </p>
        </div>
        <label class="relative cursor-pointer bg-gradient-to-r from-primary to-primary text-white px-5 py-2.5 rounded-lg hover:shadow-md transition-all">
          <input 
            type="file" 
            accept=".xlsx,.xls" 
            class="hidden" 
            @change="handleFileUpload"
            ref="excelFile"
          />
          <span class="flex items-center gap-2">
            <i v-html="icons.import" class="w-4 h-4"></i>
            Import for Validation
          </span>
        </label>
      </div>

      <div v-if="validationPerformed" class="mb-6">
        <div class="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-white rounded-full shadow-sm">
              <i v-html="icons.checkCircle" class="w-6 h-6 text-green-500"></i>
            </div>
            <div>
              <h3 class="font-medium text-gray-800">Validation Complete</h3>
              <p class="text-sm text-gray-600">
                {{ validationResults.filter(i => i.isValid).length }} of {{ validationResults.length }} services matched
              </p>
            </div>
          </div>
          <div v-if="allServicesValid" class="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-2">
            <i v-html="icons.check" class="w-4 h-4"></i>
            Ready to Accept
          </div>
          <div v-else class="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center gap-2">
            <i v-html="icons.warning" class="w-4 h-4"></i>
            Review Required
          </div>
        </div>
      </div>
    </div>

    <!-- Services Table -->
    <div class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div class="p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i v-html="icons.services" class="w-5 h-5 text-primary"></i>
          Contract Services
          <span v-if="validationPerformed" class="ml-auto text-sm font-normal bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
            {{ validationResults.filter(i => i.isValid).length }}/{{ validationResults.length }} Verified
          </span>
        </h2>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50 text-gray-700">
                <th class="p-4 text-left rounded-tl-lg">#</th>
                <th class="p-4 text-left">Service</th>
                <th class="p-4 text-left">Code</th>
                <th class="p-4 text-left">Contract Price</th>
                <th v-if="validationPerformed" class="p-4 text-left">Your Price</th>
                <th v-if="validationPerformed" class="p-4 text-left rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(item, index) in services"
                :key="item.contractDetailUuid"
                class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td class="p-4 text-gray-600">{{ index + 1 }}</td>
                <td class="p-4 font-medium text-gray-800">
                  {{ item.serviceName }}
                  <p v-if="item.description" class="text-xs text-gray-500 mt-1">{{ item.description }}</p>
                </td>
                <td class="p-4 font-mono text-sm text-gray-600">
                  {{ item.serviceCode || 'N/A' }}
                </td>
                <td class="p-4 font-medium text-gray-800">
                  ETB {{ item.negotiatedPrice?.toLocaleString("en-US") || "0.00" }}
                </td>
                <td v-if="validationPerformed" class="p-4">
                  <span v-if="item.importedPrice !== undefined" class="font-medium text-gray-800">
                    ETB {{ item.importedPrice?.toLocaleString("en-US") }}
                  </span>
                  <span v-else class="text-gray-400 italic">Not imported</span>
                </td>
                <td v-if="validationPerformed" class="p-4">
                  <span 
                    v-if="item.isValid"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                  >
                    <i v-html="icons.check" class="w-4 h-4 mr-1"></i>
                    Match
                  </span>
                  <span 
                    v-else-if="item.notFound"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    <i v-html="icons.warning" class="w-4 h-4 mr-1"></i>
                    Not Found
                  </span>
                  <span 
                    v-else
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                  >
                    <i v-html="icons.close" class="w-4 h-4 mr-1"></i>
                    Mismatch
                  </span>
                </td>
              </tr>
              <tr v-if="services.length === 0">
                <td :colspan="validationPerformed ? 6 : 4" class="p-8 text-center text-gray-400">
                  <div class="flex flex-col items-center justify-center">
                    <i v-html="icons.empty" class="w-12 h-12 mb-2"></i>
                    No services found in this contract
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
 <div class="bg-white rounded-xl p-6 mt-6 shadow-md">
        <!-- Header and Toggle -->
        <div class="flex justify-between items-center mb-4">
          <h3
            class="text-xl font-semibold text-primary flex items-center gap-2"
          >
            <i v-html="icons.people" class="w-5 h-5 text-primary"></i>
            Insured Members
          </h3>
          <button
            @click="showInsured = !showInsured"
            class="text-sm text-primary border border-primary px-3 py-1 rounded-md hover:bg-primary hover:text-white transition-colors duration-200"
          >
            {{ showInsured ? "Hide" : "Show" }}
          </button>
        </div>

        <!-- Transitioned Table -->
        <Transition name="dropdown" appear>
          <div
            v-if="showInsured"
            class="overflow-x-auto rounded-lg border border-gray-200"
          >
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <thead
                class="bg-[#F1F5F9] text-gray-600 uppercase text-xs tracking-wider"
              >
                <tr>
                  <th class="px-6 py-3 text-left font-semibold">Name</th>
                  <th class="px-6 py-3 text-left font-semibold">
                    Employee ID
                  </th>
                  <th class="px-6 py-3 text-left font-semibold">Dependants</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr
                  v-for="insured in formData.insuredSummaries"
                  :key="insured.insuredUuid"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td
                    class="px-6 py-4 text-gray-800 font-medium whitespace-nowrap"
                  >
                    {{ insured.fullName }}
                  </td>
                  <td class="px-6 py-4 text-gray-700 whitespace-nowrap">
                    {{ insured.membershipNumber }}
                  </td>
                  <td class="px-6 py-4 text-gray-700">
                    <div v-if="insured.dependants?.length">
                      <ul class="list-disc pl-4 space-y-1 text-sm">
                        <li
                          v-for="dependant in insured.dependants"
                          :key="dependant.dependantUuid"
                        >
                          {{ dependant.fullName }}
                          <span class="text-gray-500"
                            >({{ dependant.relationshipType }})</span
                          >
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
    <!-- Action Buttons -->
    <div class="flex justify-end gap-4 mt-8">
    <Button 
  v-if="formData.status !== 'REJECTED'"
  @click="handleReject" 
  class="bg-gradient-to-r from-red-600 to-red-700 text-white py-1 px-4 rounded-lg shadow hover:shadow-md transition-all"
>
       <!-- :disabled="!validationPerformed" -->
        <span class="flex items-center gap-2">
          <i v-html="icons.close" class="w-4 h-4"></i>
          Reject Contract
        </span>
      </Button>
      <Button 
        @click="handleApprove" 
         v-if="formData.status !== 'REJECTED'"
        class="bg-gradient-to-r from-primary to-primary text-white py-1 px-4 rounded-lg shadow hover:shadow-md transition-all"
        :class="{'animate-pulse': allServicesValid && validationComplete}"
        
      >
      <!-- :disabled="!validationPerformed || !allServicesValid" -->
        <span class="flex items-center gap-2">
          <i v-html="icons.check" class="w-4 h-4"></i>
          Accept Contract
        </span>
      </Button>
    </div>

    <!-- Import Validation Modal -->
    <div v-if="importDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div class="border-b border-gray-200 p-6 flex justify-between items-center bg-gray-50">
          <h3 class="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i v-html="icons.import" class="w-6 h-6 text-primary"></i>
            Validate Contract Prices
          </h3>
          <button @click="importDialog = false" class="text-gray-500 hover:text-gray-700">
            <i v-html="icons.close" class="w-6 h-6"></i>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[70vh]">
          <div class="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4">
            <div class="flex items-start">
              <i v-html="icons.info" class="w-5 h-5 text-blue-500 mt-0.5 mr-3"></i>
              <div>
                <h4 class="font-medium text-blue-800">Validation Instructions</h4>
                <p class="text-sm text-blue-700 mt-1">
                  Review the imported prices below. The system will compare these with the contract prices.
                  Services not found in the import will be marked accordingly.
                </p>
              </div>
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 text-gray-700">
                  <th class="p-3 text-left">Service Name</th>
                  <th class="p-3 text-left">Code</th>
                  <th class="p-3 text-left">Imported Price</th>
                  <th class="p-3 text-left">Contract Price</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(importedItem, index) in excelData"
                  :key="index"
                  class="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td class="p-3 font-medium text-gray-800">{{ importedItem.serviceName }}</td>
                  <td class="p-3 font-mono text-sm text-gray-600">{{ importedItem.serviceCode || 'N/A' }}</td>
                  <td class="p-3 font-medium text-primary">
                    ETB {{ importedItem.negotiatedPrice?.toLocaleString("en-US") }}
                  </td>
                  <td class="p-3 text-gray-500 italic">
                    Will be compared after validation
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <div class="flex items-start">
              <i v-html="icons.warning" class="w-5 h-5 text-yellow-500 mt-0.5 mr-3"></i>
              <div>
                <h4 class="font-medium text-yellow-800">Important Notice</h4>
                <p class="text-sm text-yellow-700 mt-1">
                  Only services with matching names or codes will be validated. 
                  Make sure your Excel file uses the same naming conventions as the contract.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-3">
          <button
            @click="importDialog = false"
            class="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="performValidation"
            class="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors flex items-center gap-2"
          >
            <i v-html="icons.check" class="w-4 h-4"></i>
            Validate Prices
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Base styles */
.required-field {
  @apply border-l-2 border-primary;
}

.error-field {
  @apply border-red-500;
}

.error-message {
  @apply text-red-500 text-xs mt-1;
}

/* Table styles */
table {
  @apply min-w-full divide-y divide-gray-200;
}

th {
  @apply py-3 text-left text-sm font-semibold text-gray-700;
}

td {
  @apply py-4 whitespace-nowrap;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.9;
  }
}

.animate-pulse {
  animation: pulse 2s infinite;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400;
}
</style>