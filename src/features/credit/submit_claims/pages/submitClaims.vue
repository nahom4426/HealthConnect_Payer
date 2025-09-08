<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import submitClaimsDataProvider from "../components/submitClaimsDataProvider.vue";
import batchDataProvider from "../components/batchDataProvider.vue";
import { claimServices } from "../store/submitClaimsStore";
import { useBatchAuthorizationStore } from "../store/batchAuthorizationStore";
import StatusRow from "../components/submitClaimsStatusRow.vue";
import BatchStatusRow from "../components/batchStatusRow.vue";
import { useAuthStore } from "@/stores/auth";
import icons from "@/utils/icons";
import Input from "@/components/new_form_elements/Input.vue";
import Select from "@/components/new_form_elements/Select.vue";
import ModalFormSubmitButton from "@/components/new_form_builder/ModalFormSubmitButton.vue";
import { submitClaimsStatusUpdate } from "../api/submitClaimsApi";
import { addToast } from "@/toast";

const emit = defineEmits(["navigate"]);
const router = useRouter();
const dataProvider = ref();
const batchProvider = ref();
const claimServicesStore = claimServices();
const batchStore = useBatchAuthorizationStore();
const auth = useAuthStore();
const providerUuid = ref(auth.auth?.user?.providerUuid || "");

// State management
const isClaimCreationMode = ref(false);
const hasGenerated = ref(false);
const isSubmitting = ref(false);
const isGenerating = ref(false);
const payerSearchTerm = ref('');
const showPayerDropdown = ref(false);

// Date range setup
const currentDate = new Date();
const previousMonthDate = new Date(
  currentDate.setMonth(currentDate.getMonth() - 1)
);
const fromDate = ref(previousMonthDate.toISOString().split("T")[0]);
const toDate = ref(new Date().toISOString().split("T")[0]);

// Selected claims that can be removed
const selectedClaims = ref([]);

// Payer selection
const selectedPayerUuid = ref("");
const selectedPayerName = ref("");
const isPayerSelected = computed(() => !!selectedPayerUuid.value);

// Initialize data
onMounted(async () => {
  await claimServicesStore.fetchActiveInstitutions();
});

const payerOptions = computed(() => claimServicesStore.payerOptions);

// Filtered payer options with search
const filteredPayerOptions = computed(() => {
  if (!payerSearchTerm.value) return payerOptions.value;

  return payerOptions.value.filter((option) =>
    option.label.toLowerCase().includes(payerSearchTerm.value.toLowerCase())
  );
});

function selectPayer(option) {
  selectedPayerUuid.value = option.value;
  payerSearchTerm.value = option.label;
  showPayerDropdown.value = false;
}

function handlePayerInputFocus() {
  showPayerDropdown.value = true;
}

function handlePayerInputBlur() {
  // Delay hiding to allow click events on dropdown items
  setTimeout(() => {
    showPayerDropdown.value = false;
  }, 200);
}

function clearPayerSearch() {
  payerSearchTerm.value = '';
  selectedPayerUuid.value = '';
  showPayerDropdown.value = false;
}

// Watch for payer selection changes
watch(selectedPayerUuid, (newUuid) => {
  const selected = claimServicesStore.institutions.find(
    (i) => i.uuid === newUuid
  );
  selectedPayerName.value = selected ? selected.name : "";
});

// Generate claims with filters
const generateClaims = async () => {
  if (!dataProvider.value || !selectedPayerUuid.value) return;

  isGenerating.value = true;
  try {
    dataProvider.value.setFilters({
      startDate: fromDate.value,
      endDate: toDate.value,
      payerUuid: selectedPayerUuid.value,
    });
    await dataProvider.value.refresh();
    hasGenerated.value = true;
    // Initialize selectedClaims with all claims when first generated
    selectedClaims.value = [...claimServicesStore.claimServices];
  } finally {
    isGenerating.value = false;
  }
};

// Remove a claim from selected claims
const removeClaim = (claimUuid) => {
  selectedClaims.value = selectedClaims.value.filter(
    (claim) => claim.dispensingUuid !== claimUuid
  );
};

// Submit selected claims to API
const submitClaims = async () => {
  if (selectedClaims.value.length === 0 || isSubmitting.value) return;

  isSubmitting.value = true;
  const dispensingUuids = selectedClaims.value.map(
    (claim) => claim.dispensingUuid
  );

  try {
    const response = await submitClaimsStatusUpdate(
      providerUuid.value,
      dispensingUuids
    );

    if (response?.status === 200) {
      addToast({
        type: "success",
        title: "Claims Submitted",
        message: "Selected claims have been successfully submitted.",
      });
      dataProvider.value?.refresh();
      batchProvider.value?.refresh();
      isClaimCreationMode.value = false;
      selectedClaims.value = [];
      router.push("/claim-approval");
    }
  } catch (error) {
    addToast({
      type: "error",
      title: "Submission Failed",
      message: error?.response?.data?.message || "Failed to submit claims.",
    });
  } finally {
    isSubmitting.value = false;
  }
};

// Refresh data with current filters
const refreshDataWithDates = async (startDate, endDate) => {
  if (!dataProvider.value || !hasGenerated.value) return;

  try {
    dataProvider.value.setFilters({
      startDate,
      endDate,
      payerUuid: selectedPayerUuid.value,
    });
    await dataProvider.value.refresh();
  } catch (error) {}
};

// Watch for date changes - only refresh if we've already generated results
watch([fromDate, toDate], ([newFromDate, newToDate]) => {
  if (newFromDate && newToDate && hasGenerated.value) {
    refreshDataWithDates(newFromDate, newToDate);
  }
});

// Watch for payer changes - only refresh if we've already generated results
watch(selectedPayerUuid, (newPayerUuid) => {
  if (newPayerUuid && hasGenerated.value) {
    const selected = claimServicesStore.institutions.find(
      (i) => i.uuid === newPayerUuid
    );
    selectedPayerName.value = selected ? selected.name : "";
    refreshDataWithDates(fromDate.value, toDate.value);
  }
});

// Pagination handlers
function handlePageChange(page) {
  if (isClaimCreationMode.value) {
    dataProvider.value?.setPage(page);
  } else {
    batchProvider.value?.setPage(page);
  }
}

function handleLimitChange(limit) {
  if (isClaimCreationMode.value) {
    dataProvider.value?.setLimit(limit);
  } else {
    batchProvider.value?.setLimit(limit);
  }
}

function refreshData() {
  if (isClaimCreationMode.value) {
    dataProvider.value?.refresh();
  } else {
    batchProvider.value?.refresh();
  }
}
</script>

<template>
  <!-- Show DefaultPage wrapper only when NOT in claim creation mode -->
  <DefaultPage 
    v-if="!isClaimCreationMode" 
    :placeholder="'Search Batches'"
  >
    <!-- <template #filter>
      <button class="flex justify-center items-center gap-2 rounded-md px-6 py-4 text-primary bg-base-clr3">
        <i v-html="icons.filter"></i>
        <span>Filter</span>
      </button>
    </template> -->

    <template #add-action>
      <button
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 text-white bg-primary"
        @click="isClaimCreationMode = true"
      >
        <i v-html="icons.add"></i>
        <span>Create Claims</span>
      </button>
    </template>

    <template #default="{ search }">
      <batchDataProvider
        ref="batchProvider"
        :providerUuid="providerUuid"
        :search="search"
        v-slot="{ pending, currentPage, itemsPerPage, totalPages }"
      >
        <Table
          :pending="pending"
          :headers="{
            head: [
              'Batch Code',
              'Payer',
              'Requested On',
              'Date Range',
              'Number of Claims',
              'Total Amount',
              'Status',
              'Action',
            ],
            row: [
              'batchCode',
              'payerName',
              'requestedOn',
              'dateRange',
              'numberOfClaims',
              'formattedTotalAmount',
              'status',
            ],
          }"
          :rows="batchStore.batch"
          :rowCom="BatchStatusRow"
          :placeholder="'No Batches Found'"
          :pagination="{
            currentPage,
            itemsPerPage,
            totalPages,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange,
          }"
        />
      </batchDataProvider>
    </template>
  </DefaultPage>

  <!-- Compact claim creation mode without back button -->
  <div v-else class="p-4 bg-white rounded-lg shadow-md">
    <submitClaimsDataProvider
      ref="dataProvider"
      :providerUuid="providerUuid"
      :search="''"
      v-slot="{ pending, currentPage, itemsPerPage, totalPages }"
    >
      <!-- Compact filter form -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2 ml-4 justify-end items-end pl-[55rem]">
        <Input
          v-model="fromDate"
          label="From"
          :validation="'required'"
          :attributes="{
            placeholder: 'Start date',
            type: 'date',
            max: toDate,
          }"
        />
        <Input
          v-model="toDate"
          label="To"
          :validation="'required'"
          :attributes="{
            placeholder: 'End date',
            type: 'date',
            min: fromDate,
          }"
        />
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 mb-2">Payer</label>
          <div class="relative">
            <Input
              v-model="payerSearchTerm"
              type="text"
              @focus="handlePayerInputFocus"
              @blur="handlePayerInputBlur"
              :attributes="{
                placeholder: 'Search payers...'
              }"
            />
            <button
              v-if="payerSearchTerm"
              @click="clearPayerSearch"
              class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div 
            v-if="showPayerDropdown && filteredPayerOptions.length > 0"
            class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            <div
              v-for="option in filteredPayerOptions"
              :key="option.value"
              @mousedown.prevent="selectPayer(option)"
              class="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 transition-colors"
              :class="{ 'bg-blue-100': selectedPayerUuid === option.value }"
            >
              <div class="font-medium text-gray-900">{{ option.label }}</div>
            </div>
          </div>
          
          <div 
            v-else-if="showPayerDropdown && payerSearchTerm && filteredPayerOptions.length === 0"
            class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3"
          >
            <div class="text-sm text-gray-500 text-center">
              <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              No payers found matching "{{ payerSearchTerm }}"
            </div>
          </div>
        </div>
        <div class="flex items-end">
          <ModalFormSubmitButton
            :pending="isGenerating"
            :btn-text="'Generate'"
            :disabled="!isPayerSelected"
            :title="!isPayerSelected ? 'Please select a payer first' : ''"
            @click="generateClaims"
            class="bg-[#02676B] hover:bg-[#014F4F] text-white px-4 py-2 h-[42px]"
          />
        </div>
      </div>

      <!-- Results summary (only shown after generation) -->
      <div  class="mb-4 p-3 bg-[#F6F7FA] rounded-lg">
        <div class="flex justify-between items-center">
          <p class="text-sm">
            Showing claims from {{ fromDate }} to {{ toDate }} for
            {{ selectedPayerName }} ({{ selectedClaims.length }} selected)
          </p>
          <ModalFormSubmitButton
            :pending="isSubmitting"
            :btn-text="`Submit ${selectedClaims.length} Claims`"
            :disabled="selectedClaims.length === 0"
            class="bg-primary hover:bg-[#014F4F] text-white px-4 py-2 text-sm"
            @click="submitClaims"
          />
        </div>
      </div>
      <!-- <div v-else class="mb-4 p-3 bg-[#F6F7FA] rounded-lg text-sm italic text-gray-600 text-center">
        Select filters and click Generate to view claims
      </div> -->

      <!-- Main table -->
      <Table
       
        :pending="pending"
        :headers="{
          head: [
            'Invoice ID',
            'Payer',
            'Patient',
            'Date',
            'Branch',
            'Amount',
            'Status',
            'Actions',
          ],
          row: [
            'invoiceNumber',
            'payerName',
            'patientName',
            'dispensingDate',
            'branchName',
            'totalAmount',
            'status',
          ],
        }"
        :rows="selectedClaims"
        :customActions="true"
        :pagination="{
          currentPage,
          itemsPerPage,
          totalPages,
          onPageChange: handlePageChange,
          onLimitChange: handleLimitChange,
        }"
      >
        <template #actions="{ row }">
          <button
            @click.stop="removeClaim(row.dispensingUuid)"
            class="text-red-500 hover:text-red-700 text-sm"
            title="Remove claim"
          >
            <i v-html="icons.trash"></i> Remove
          </button>
        </template>
      </Table>
    </submitClaimsDataProvider>
  </div>
</template>

<style scoped>
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #cccccc !important;
  border-color: #cccccc !important;
}
</style>
