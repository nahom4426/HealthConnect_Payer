<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAllProviders } from '@/features/providers/api/providerApi';
import { getPayerContractById, updatePayerContract } from '../api/submitContractApi';
import { exportServicesByCategories, getServiceCategories } from '../api/submitContractApi';
import Select from '@/components/new_form_elements/Select.vue';
import Input from '@/components/new_form_elements/Input.vue';
import icons from '@/utils/icons';
import { toasted } from '@/utils/utils';
import { useAuthStore } from '@/stores/auth';
import DatePicker from '@/components/datePicker.vue';
import ButtonSpinner from '@/components/buttonSpinner.vue';
import * as XLSX from 'xlsx';
import Spinner from '@/components/Spinner.vue';
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const contractId = route.params.id;
const selectedProvider = ref(null);
const beginDate = ref('');
const endDate = ref('');
const selectedItems = ref([]);
const loadingContract = ref(true);
const payerUuid = computed(() => auth.auth.user?.payerUuid || '');
const selectedItemsPage = ref(1);
const selectedItemsPerPage = ref(10);
const providers = ref([]);
const submitAttempted = ref(false);
const fetchPending = ref(false);
const error = ref(null);
const pending = ref(false);
const importDialog = ref(false);
const excelFile = ref(null);
const excelData = ref([]);
const exportModal = ref(false);
const categories = ref([]);
const selectedCategories = ref([]);
const providerName = ref('');
const loadingCategories = ref(false);

const formData = ref({
  contractHeaderUuid: '',
  contractName: '',
  contractDescription: '',
  beginDate: '',
  endDate: '',
  status: 'RESUBMIT',
  payerUuid: auth.auth.user?.payerUuid || '',
  providerUuid: '',
  contractDetails: [],
  insuredSummaries: []
});

const providerOptions = computed(() => {
  return providers.value.map(provider => ({
    value: provider.providerUuid,
    label: `${provider.providerName} (${provider.threeDigitAcronym})`,
  }));
});

async function fetchContract() {
  try {
    loadingContract.value = true;
    const response = await getPayerContractById(contractId);

    if (response && response.data) {
      const contract = response.data;
      
      Object.assign(formData.value, {
        ...contract,
        contractDetails: contract.contractDetails || [],
        insuredSummaries: contract.insuredSummaries || [],
      });

      selectedProvider.value = contract.providerUuid;
      beginDate.value = contract.beginDate || contract.startDate;
      endDate.value = contract.endDate;
      providerName.value = contract.providerName;

      if (contract.contractDetails) {
        selectedItems.value = contract.contractDetails.map(item => ({
          id: item.serviceUuid || `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          serviceUuid: item.serviceUuid,
          name: item.serviceName,
          description: item.description || 'No description',
          providerPrice: item.negotiatedPrice,
          userPrice: item.negotiatedPrice,
          type: 'service',
          originalData: item
        }));
      }
    } else {
      throw new Error('Contract data not found in response');
    }
  } catch (err) {
    console.error('Error fetching contract:', err);
    error.value = 'Failed to load contract data';
    toasted(false, 'Failed to load contract data');
    router.push('/payer_contracts');
  } finally {
    loadingContract.value = false;
  }
}

async function fetchProviders() {
  try {
    fetchPending.value = true;
    error.value = null;
    const response = await getAllProviders({ page: 1, limit: 100 });

    providers.value = response.data.content.map(item => ({
      providerUuid: item.providerUuid,
      providerName: item.providerName,
      threeDigitAcronym: item.threeDigitAcronym,
      email: item.email,
      telephone: item.telephone
    }));

    if (providers.value.length === 0) {
      error.value = 'No providers available';
    }
  } catch (err) {
    console.error('Error fetching providers:', err);
    error.value = 'Failed to load providers. Please try again.';
  } finally {
    fetchPending.value = false;
  }
}

const openExportModal = async () => {
  if (!selectedProvider.value) {
    toasted(false, "", "Please select a provider first");
    return;
  }

  try {
    loadingCategories.value = true;
    const response = await getServiceCategories(selectedProvider.value);
    
    if (Array.isArray(response)) {
      categories.value = response.map((category, index) => ({
        id: category.toLowerCase().replace(/\s+/g, '-') || `category-${index}`,
        name: category,
        original: category
      }));
      
      selectedCategories.value = categories.value.map(c => c.id);
      exportModal.value = true;
    } else {
      throw new Error('Invalid categories response format');
    }
  } catch (err) {
    console.error('Error loading categories:', err);
    toasted(false, "", "Failed to load service categories");
  } finally {
    loadingCategories.value = false;
  }
};

const toggleAllCategories = () => {
  if (selectedCategories.value.length === categories.value.length) {
    selectedCategories.value = [];
  } else {
    selectedCategories.value = categories.value.map(c => c.id);
  }
};

const exportServices = async () => {
  if (selectedCategories.value.length === 0) {
    toasted(false, "", "Please select at least one category");
    return;
  }

  try {
    loadingCategories.value = true;
    const success = await exportServicesByCategories(
      selectedProvider.value,
      selectedCategories.value,
      providerName.value
    );
    
    if (success) {
      exportModal.value = false;
      const exportBtn = document.querySelector('.export-btn');
      if (exportBtn) {
        exportBtn.classList.add('animate-ping');
        setTimeout(() => exportBtn.classList.remove('animate-ping'), 500);
      }
    }
  } catch (err) {
    console.error('Export failed:', err);
  } finally {
    loadingCategories.value = false;
  }
};

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

      const codeIndex = getColumnIndex(['service code', 'servicecode', 'itemUuid']);
      const nameIndex = getColumnIndex(['service name', 'servicename', 'serviceName']);
      const categoryIndex = getColumnIndex(['category', 'description']);
      const priceIndex = getColumnIndex(['negotiated price', 'price', 'negotied price', 'negotiatedPrice']);
      
      if (nameIndex === -1 || priceIndex === -1) {
        throw new Error('Missing required columns (name and price) in Excel file');
      }
      
      let currentCategory = '';
      const services = [];
      
      for (let i = 1; i < sheetData.length; i++) {
        const row = sheetData[i];
        
        if (row[codeIndex] && !row[nameIndex] && !row[priceIndex]) {
          currentCategory = row[codeIndex];
          continue;
        }
        
        if (!row[codeIndex] && !row[nameIndex]) continue;
        
        services.push({
          serviceCode: row[codeIndex] || '',
          serviceName: row[nameIndex] || '',
          category: currentCategory || row[categoryIndex] || '',
          price: parseFloat(row[priceIndex]) || 0
        });
      }
      
      excelData.value = services.map((item, index) => ({
        id: item.serviceCode || `imported-${index}`,
        serviceUuid: item.serviceCode,
        name: item.serviceName,
        description: item.category,
        providerPrice: item.price,
        userPrice: item.price,
        originalData: item,
        type: 'service'
      }));
      
      importDialog.value = true;
      
    } catch (err) {
      console.error('Error processing Excel file:', err);
      toasted(false, "", `Error importing Excel: ${err.message}`);
    }
  };
  reader.readAsArrayBuffer(file);
};

const confirmImport = () => {
  const importBtn = document.querySelector('.import-btn');
  if (importBtn) {
    importBtn.classList.add('animate-bounce');
    setTimeout(() => importBtn.classList.remove('animate-bounce'), 1000);
  }

  // Update existing items or add new ones
  excelData.value.forEach(newItem => {
    const existingIndex = selectedItems.value.findIndex(item => item.serviceUuid === newItem.serviceUuid);
    if (existingIndex >= 0) {
      selectedItems.value[existingIndex] = { ...selectedItems.value[existingIndex], ...newItem };
    } else {
      selectedItems.value.push(newItem);
    }
  });
  
  excelData.value = [];
  importDialog.value = false;
  excelFile.value = null;
};

const removeItem = (itemId) => {
  selectedItems.value = selectedItems.value.filter(item => item.id !== itemId);
  const row = document.querySelector(`[data-item-id="${itemId}"]`);
  if (row) {
    row.classList.add('fade-out');
    setTimeout(() => row.remove(), 300);
  }
};

const updateItemPrice = (item, newPrice) => {
  const selectedItem = selectedItems.value.find(si => si.id === item.id);
  if (selectedItem) {
    selectedItem.userPrice = newPrice;
    const priceCell = document.querySelector(`[data-item-id="${item.id}"] .price-cell`);
    if (priceCell) {
      priceCell.classList.add('highlight-change');
      setTimeout(() => priceCell.classList.remove('highlight-change'), 1000);
    }
  }
};

const paginatedSelectedItems = computed(() => {
  const start = (selectedItemsPage.value - 1) * selectedItemsPerPage.value;
  return selectedItems.value.slice(start, start + selectedItemsPerPage.value);
});

const selectedItemsTotalPages = computed(() => 
  Math.ceil(selectedItems.value.length / selectedItemsPerPage.value)
);

async function submit() {
  submitAttempted.value = true;
  pending.value = true;

  // Validation checks
  if (!selectedProvider.value) {
    toasted(false, "", "Please select a provider first");
    pending.value = false;
    return;
  }

  if (!beginDate.value) {
    toasted(false, "", "Start date is required");
    pending.value = false;
    return;
  }

  if (!endDate.value) {
    toasted(false, "", "End date is required");
    pending.value = false;
    return;
  }

  if (new Date(endDate.value) <= new Date(beginDate.value)) {
    toasted(false, "", "End date must be after start date");
    pending.value = false;
    return;
  }

  if (!payerUuid.value) {
    toasted(false, "", "No payer information found. Please login again.");
    pending.value = false;
    return;
  }

  if (selectedItems.value.length === 0) {
    toasted(false, "", "Please import at least one service");
    pending.value = false;
    return;
  }

  try {
    const payload = {
      providerUuid: selectedProvider.value,
      description: formData.value.contractDescription || `Contract updated on ${new Date().toLocaleDateString()}`,
      payerUuid: payerUuid.value,
      status: "RESUBMITTED",
      beginDate: new Date(beginDate.value).toISOString(),
      endDate: new Date(endDate.value).toISOString(),
      contractItems: selectedItems.value.map(item => ({
        itemUuid: item.serviceUuid || null, // Use serviceUuid if available, otherwise null
        serviceName: item.name,
        itemType: 'SERVICE', // Hardcoded as 'SERVICE' since we removed drugs
        negotiatedPrice: item.userPrice
      }))
    };

    const response = await updatePayerContract(formData.value.contractHeaderUuid, payload);
    
    if (response.success) {
      // Success animation
      const successIcon = document.createElement('div');
      successIcon.innerHTML = `
        <div class="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div class="bg-green-500 text-white p-6 rounded-full shadow-lg text-4xl animate-bounce">
            ✓
          </div>
        </div>
      `;
      document.body.appendChild(successIcon);
      setTimeout(() => successIcon.remove(), 2000);

      toasted(true, 'Contract updated successfully!');
      router.push("/pending_contracts");
    } else {
      throw new Error(response.message || 'Failed to update contract');
    }
  } catch (error) {
    console.error('Submission failed:', error);
    toasted(false, "", error.message || 'Failed to update contract');
  } finally {
    pending.value = false;
  }
}

onMounted(async () => {
  await fetchProviders();
  await fetchContract();
});
</script>

<template>
  <div v-if="loadingContract" class="flex justify-center items-center h-64">
    <Spinner size="lg" />
  </div>

  <div v-else class="bg-white rounded-md p-6 space-y-6">
    <!-- Provider and Date Inputs -->
    <div class="grid md:grid-cols-3 gap-6">
      <div class="md:col-span-2">
        <Select     
          :obj="true"
          name="provider"
          label="Select Provider"
          validation="required"
          :options="providerOptions"
          :disabled="true"
          :attributes="{
            placeholder: 'Provider'
          }"
          v-model="selectedProvider"
        />
      </div>

      <div class="flex gap-4">
        <div class="w-1/2">
          <DatePicker
            v-model="beginDate"
            label="Start date"
            required
            :error="!beginDate && submitAttempted"
            :error-message="!beginDate && submitAttempted ? 'Start date is required' : ''"
          />
        </div>
        <div class="w-1/2">
          <DatePicker
            v-model="endDate"
            label="End date"
            required
            :error="(!endDate || new Date(endDate) <= new Date(beginDate)) && submitAttempted"
            :error-message="
              !endDate && submitAttempted ? 'End date is required' : 
              (endDate && new Date(endDate) <= new Date(beginDate) && submitAttempted ? 'End date must be after start date' : '')
            "
          />
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="mt-2 flex items-center">
      <span class="text-red-500 text-sm">{{ error }}</span>
    </div>

    <!-- Import Section -->
    <div class="bg-[#F6F7FA] rounded p-4 transition-all duration-300 hover:shadow-md">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-md text-[#75778B]">Edit Services</h3>
        <div class="flex gap-2">
          <button
            @click="openExportModal"
            class="export-btn bg-[#02676B] text-white px-4 py-2 rounded hover:bg-[#02494D] text-sm flex gap-2 transition-all hover:scale-105"
            :disabled="!selectedProvider"
          >
            <span v-html="icons.download" class="w-4 h-4"></span>
            Export Services
          </button>
          <label class="import-btn cursor-pointer bg-white border border-[#02676B] text-[#02676B] px-4 py-2 rounded hover:bg-gray-50 text-sm flex gap-2 transition-all hover:scale-105">
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              class="hidden" 
              @change="handleFileUpload"
              ref="excelFile"
            />
            <span v-html="icons.import" class="w-4 h-4"></span>
            Import Excel
          </label>
        </div>
      </div>
      
      <div class="bg-white p-4 rounded shadow-inner">
        <p class="text-sm text-gray-600 mb-2">
          <span class="text-[#02676B] font-medium">Workflow:</span> 
          <span class="ml-2">1. Export Current Services → 2. Edit prices → 3. Import back</span>
        </p>
        <p class="text-xs text-gray-500 italic">
          Tip: Importing will update existing services with matching codes and add new ones
        </p>
      </div>
    </div>

    <!-- Selected Services Preview -->
    <div class="bg-[#DFF1F1] h-auto p-4 rounded-md transition-all duration-300 hover:shadow-md">
      <div class="flex justify-between items-center mb-3">
        <h3 class="text-[#02676B] text-base font-medium">Current Services</h3>
        <span class="text-sm bg-[#02676B] text-white px-3 py-1 rounded-full">
          {{ selectedItems.length }} services
        </span>
      </div>
      
   <table class="text-sm w-full bg-white rounded-md overflow-hidden">
  <thead>
    <tr class="text-white bg-[#02676B]">
      <th class="text-left p-3">#</th>
      <th class="text-left p-3">Service Code</th>
      <th class="text-left p-3">Service Name</th>
      <th class="text-left p-3">Description</th>
      <th class="text-left p-3">Negotiated Price</th>
      <th class="text-left p-3">Action</th>
    </tr>
  </thead>
  <tbody>
    <tr
      v-for="(item, idx) in paginatedSelectedItems"
      :key="item.id"
      class="border-b hover:bg-gray-50 transition-colors"
      :data-item-id="item.id"
    >
      <td class="p-3">{{ idx + 1 + (selectedItemsPage - 1) * selectedItemsPerPage }}</td>
      <td class="p-3 font-mono text-xs">{{ item.serviceUuid || 'N/A' }}</td>
      <td class="p-3">{{ item.name }}</td>
      <td class="p-3">{{ item.description }}</td>
      <td class="p-3 price-cell">
        <input
          type="number"
          v-model.number="item.userPrice"
          @change="updateItemPrice(item, item.userPrice)"
          class="w-24 p-2 border rounded focus:ring-2 focus:ring-[#02676B] transition-all"
          min="0"
          step="0.01"
        />
      </td>
      <td class="p-3">
        <button 
          @click="removeItem(item.id)"
          class="remove-btn p-1 rounded-full hover:bg-red-100 transition-colors"
          title="Remove service"
        >
          <i v-html="icons.trash" class="text-red-500 text-center items-center w-5 h-5"></i> 
        </button>
      </td>
    </tr>
  </tbody>
</table>

      <!-- Selected Items Pagination -->
      <div class="flex justify-between items-center mt-4 text-sm">
        <div class="text-gray-600">
          Showing {{ (selectedItemsPage - 1) * selectedItemsPerPage + 1 }} to 
          {{ Math.min(selectedItemsPage * selectedItemsPerPage, selectedItems.length) }} 
          of {{ selectedItems.length }} services
        </div>
        <div class="flex items-center gap-1">
          <button
            @click="selectedItemsPage = Math.max(1, selectedItemsPage - 1)"
            :disabled="selectedItemsPage === 1"
            class="px-3 py-1 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            &lt;
          </button>
          <span v-for="n in selectedItemsTotalPages" :key="n">
            <button
              :class="[
                'px-3 py-1 border rounded transition-colors',
                selectedItemsPage === n ? 'bg-[#02676B] text-white' : 'hover:bg-gray-50'
              ]"
              @click="selectedItemsPage = n"
            >
              {{ n }}
            </button>
          </span>
          <button
            @click="selectedItemsPage = Math.min(selectedItemsTotalPages, selectedItemsPage + 1)"
            :disabled="selectedItemsPage === selectedItemsTotalPages"
            class="px-3 py-1 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="flex items-center justify-end pt-2 gap-2">
      <button
        @click="submit"
        :disabled="pending"
        class="bg-primary flex gap-2 text-white px-6 py-3 rounded hover:bg-[#146C5C] transition"
        :class="{ 'opacity-75 cursor-not-allowed': pending, 'hover:scale-105': !pending }"
      >
        <ButtonSpinner v-if="pending" class="flex h-5 w-5 text-white" />
        <span v-html="icons.contracts" class="w-5 h-5" v-if="!pending"></span>
        {{ pending ? 'Updating...' : 'Update Contract' }}
      </button>
    </div>

    <!-- Export Modal -->
    <div v-if="exportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-auto shadow-xl transform transition-all">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-[#02676B]">Export Services Template</h3>
          <button @click="exportModal = false" class="text-gray-500 hover:text-gray-700">
            <span v-html="icons.close" class="w-6 h-6"></span>
          </button>
        </div>
        
        <div class="mb-6">
          <p class="text-sm text-gray-600 mb-3">Select service categories to include in the export:</p>
          
          <div v-if="loadingCategories" class="flex justify-center items-center py-8">
            <Spinner class="h-8 w-8 text-[#02676B]" />
          </div>
          
          <div v-else>
            <div class="flex items-center mb-3 p-2 bg-gray-100 rounded">
              <input
                type="checkbox"
                id="selectAllCategories"
                :checked="selectedCategories.length === categories.length"
                @change="toggleAllCategories"
                class="h-4 w-4 text-[#02676B] focus:ring-[#02676B] border-gray-300 rounded"
              />
              <label for="selectAllCategories" class="ml-2 text-sm font-medium text-gray-700">
                {{ selectedCategories.length === categories.length ? 'Deselect All' : 'Select All' }}
              </label>
            </div>
            
            <div class="space-y-2 max-h-60 overflow-y-auto p-1">
              <div v-for="category in categories" :key="category.id" class="flex items-center p-2 hover:bg-gray-50 rounded transition-colors">
                <input
                  type="checkbox"
                  :id="`category-${category.id}`"
                  v-model="selectedCategories"
                  :value="category.id"
                  class="h-4 w-4 text-[#02676B] focus:ring-[#02676B] border-gray-300 rounded"
                />
                <label :for="`category-${category.id}`" class="ml-2 text-sm text-gray-700">
                  {{ category.name }}
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex justify-end gap-3 pt-4 border-t">
          <button
            @click="exportModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="exportServices"
            class="px-4 py-2 bg-[#02676B] text-white rounded-md text-sm font-medium hover:bg-[#02494D] transition-colors flex items-center gap-2"
            :disabled="loadingCategories"
          >
            <ButtonSpinner v-if="loadingCategories" class="h-4 w-4 text-white" />
            <span v-else v-html="icons.download" class="w-4 h-4"></span>
            {{ loadingCategories ? 'Exporting...' : 'Export Selected' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Import Confirmation Dialog -->
    <div v-if="importDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto shadow-xl transform transition-all">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-[#02676B]">Confirm Import</h3>
          <button @click="importDialog = false" class="text-gray-500 hover:text-gray-700">
            <span v-html="icons.close" class="w-6 h-6"></span>
          </button>
        </div>
        
        <p class="mb-4 text-gray-600">You are about to import {{ excelData.length }} services. Please review:</p>
        
        <div class="border rounded-lg overflow-hidden shadow-sm">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Code</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="(item, index) in excelData" 
                :key="index"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-500">{{ item.serviceUuid }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ item.name }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{{ item.description }}</td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-medium">
                  ETB {{ item.userPrice.toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-6 flex justify-end space-x-3 pt-4 border-t">
          <button
            @click="importDialog = false; excelData = [];"
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="confirmImport"
            class="px-4 py-2 bg-[#02676B] text-white rounded-md text-sm font-medium hover:bg-[#02494D] transition-colors flex items-center gap-2"
          >
            <span v-html="icons.check" class="w-4 h-4"></span>
            Confirm Import
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Your existing styles remain the same */
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
  @apply border-l-2 border-[#02676B];
}

select:focus {
  @apply border-[#02676B] ring-[#02676B];
}

.discount-input {
  @apply w-12 p-1 border border-gray-300 rounded text-sm;
}

.price-input {
  @apply w-24 p-1 border border-gray-300 rounded text-sm;
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
  @apply py-4 whitespace-nowrap;
}

.remove-btn {
  @apply text-[#02676B] hover:text-[#02494D] hover:underline;
}

.fade-out {
  animation: fadeOut 0.3s ease-out;
}

@keyframes fadeOut {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(100%); }
}

.highlight-change {
  animation: highlight 1s ease;
}

@keyframes highlight {
  0% { background-color: transparent; }
  50% { background-color: rgba(251, 191, 36, 0.3); }
  100% { background-color: transparent; }
}

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
</style>