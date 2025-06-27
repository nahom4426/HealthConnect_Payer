<script setup lang="ts">
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
const payerSearchTerm = ref("");

// Date range setup
const currentDate = new Date();
const previousMonthDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
const fromDate = ref(previousMonthDate.toISOString().split('T')[0]);
const toDate = ref(new Date().toISOString().split('T')[0]);

// Selected claims that can be removed
const selectedClaims = ref<Array<any>>([]);

// Payer selection
const selectedPayerUuid = ref("");
const selectedPayerName = ref("");

// Initialize data
onMounted(async () => {
  await claimServicesStore.fetchActiveInstitutions();
});

const payerOptions = computed(() => claimServicesStore.payerOptions);

// Filtered payer options with search
const filteredPayerOptions = computed(() => {
  if (!payerSearchTerm.value) return claimServicesStore.payerOptions;
  
  return claimServicesStore.payerOptions.filter(option =>
    option.label.toLowerCase().includes(payerSearchTerm.value.toLowerCase())
  );
});

// Watch for payer selection changes
watch(selectedPayerUuid, (newUuid) => {
  const selected = claimServicesStore.institutions.find(i => i.uuid === newUuid);
  selectedPayerName.value = selected ? selected.name : "";
});

// Generate claims with filters
const generateClaims = async () => {
  if (!dataProvider.value) return;

  isGenerating.value = true;
  try {
    dataProvider.value.setFilters({
      startDate: fromDate.value,
      endDate: toDate.value,
      payerUuid: selectedPayerUuid.value
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
const removeClaim = (claimUuid: string) => {
  selectedClaims.value = selectedClaims.value.filter(
    claim => claim.dispensingUuid !== claimUuid
  );
};

// Submit selected claims to API
const submitClaims = async () => {
  if (selectedClaims.value.length === 0 || isSubmitting.value) return;

  isSubmitting.value = true;
  const dispensingUuids = selectedClaims.value.map(claim => claim.dispensingUuid);

  try {
    const response = await submitClaimsStatusUpdate(providerUuid.value, dispensingUuids);
    
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
const refreshDataWithDates = async (startDate: string, endDate: string) => {
  if (!dataProvider.value) return;

  try {
    dataProvider.value.setFilters({
      startDate,
      endDate,
      payerUuid: selectedPayerUuid.value,
    });
    await dataProvider.value.refresh();
  } catch (error) {
    console.error("Error refreshing data:", error);
  }
};

// Watch for date changes
watch([fromDate, toDate], ([newFromDate, newToDate]) => {
  if (newFromDate && newToDate) {
    refreshDataWithDates(newFromDate, newToDate);
  }
}, { immediate: true });

// Watch for payer changes
watch(selectedPayerUuid, (newPayerUuid) => {
  if (newPayerUuid) {
    const selected = claimServicesStore.institutions.find(i => i.uuid === newPayerUuid);
    selectedPayerName.value = selected ? selected.name : "";
    refreshDataWithDates(fromDate.value, toDate.value);
  }
});

// Pagination handlers
function handlePageChange(page: number) {
  if (isClaimCreationMode.value) {
    dataProvider.value?.setPage(page);
  } else {
    batchProvider.value?.setPage(page);
  }
}

function handleLimitChange(limit: number) {
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
  <DefaultPage :placeholder="!isClaimCreationMode ? 'Search Batches' : ''">
    <template #filter v-if="!isClaimCreationMode">
      <button class="flex justify-center items-center gap-2 rounded-md px-6 py-4 text-primary bg-base-clr3">
        <i v-html="icons.filter"></i>
        <span>Filter</span>
      </button>
    </template>

    <template #add-action>
      <button
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 text-white"
        :class="isClaimCreationMode ? 'bg-gray-500' : 'bg-primary'"
        @click="isClaimCreationMode = !isClaimCreationMode"
      >
        <i v-html="icons.add"></i>
        <span>{{ isClaimCreationMode ? 'Back' : 'Add Credit' }}</span>
      </button>
    </template>

    <template #default="{ search }">
      <!-- Batch Data Provider (shown when not in creation mode) -->
      <batchDataProvider
        v-if="!isClaimCreationMode"
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
              'Action'
            ],
            row: [
              'batchCode',
              'payerName',
              'requestedOn',
              'dateRange',
              'numberOfClaims',
              'formattedTotalAmount',
              'status'
            ]
          }"
          :rows="batchStore.batch"
          :rowCom="BatchStatusRow"
          :pagination="{
            currentPage,
            itemsPerPage,
            totalPages,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange
          }"
        />
      </batchDataProvider>

      <!-- Submit Claims Data Provider (shown in creation mode) -->
      <submitClaimsDataProvider
        v-else
        ref="dataProvider"
        :providerUuid="providerUuid"
        :search="search"
        v-slot="{ pending, currentPage, itemsPerPage, totalPages }"
      >
        <div class="space-y-4 mb-4">
          <div class="border rounded-lg p-4 border-[#ECECEE] gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
              <Input
                v-model="fromDate"
                label="Credits From"
                :validation="'required'"
                :validationMessage="'Start date is required'"
                :attributes="{ 
                  placeholder: 'Select start date', 
                  type: 'date',
                  max: toDate
                }"
              />
              <Input
                v-model="toDate"
                label="Credits To"
                :validation="'required'"
                :attributes="{ 
                  placeholder: 'Select end date', 
                  type: 'date',
                  min: fromDate
                }"
              />
            </div>
            <div class="flex w-full gap-4 pt-2">
              <div class="w-full pr-2">
                <Select
                  :obj="true"
                  name="payerUuid"
                  label="Payer Name"
                  validation="required"
                  :options="payerOptions"
                  :attributes="{ 
                    placeholder: 'Select Payer',
                    clearable: true
                  }"
                  v-model="selectedPayerUuid"
                />
              </div>
              <div class="justify-end pt-6 w-28">
                <ModalFormSubmitButton
                  :pending="isGenerating"
                  :btn-text="'Generate'"
                  @click="generateClaims"
                  class="bg-[#02676B] hover:bg-[#014F4F] text-white px-6 py-3 border-[#02676B] hover:border-[#014F4F]"
                />
              </div>
            </div>
          </div>

          <div class="border rounded-lg p-4 border-[#ECECEE]">
            <div v-if="hasGenerated" class="flex justify-between items-center p-3.5 mb-4 rounded-lg bg-[#F6F7FA]">
              <p class="font-medium text-base">
                Result for claims from "{{ fromDate }}" to "{{ toDate }}" for {{ selectedPayerName }}
                ({{ selectedClaims.length }} selected)
              </p>
              <ModalFormSubmitButton
                :pending="isSubmitting"
                :btn-text="`Create ${selectedClaims.length} Claims`"
                :disabled="selectedClaims.length === 0"
                class="bg-primary hover:bg-[#014F4F] text-white px-6 py-3"
                @click="submitClaims"
              />
            </div>
            <div v-else class="flex justify-center items-center p-3.5 mb-4 rounded-lg bg-[#F6F7FA] text-gray-700 italic">
              Please select a payer and date range and click on <strong class="px-1 text-base"> Generate </strong> to submit claims.
            </div>
          </div>
        </div>
<Table
  :pending="pending"
  :headers="{
    head: [
      'Invoice ID',
      'Payer',
      'Patient Name',
      'Encounter Date',
      'Branch',
      'Credit Amount',
      'Status',
      'Actions'
    ],
    row: [
      'invoiceNumber',
      'payerName',
      'patientName',
      'dispensingDate',
      'branchName',
      'totalAmount',
      'status'
    ]
  }"
  :rows="selectedClaims"
  :customActions="true"  
  :pagination="{
    currentPage,
    itemsPerPage,
    totalPages,
    onPageChange: handlePageChange,
    onLimitChange: handleLimitChange
  }"
>
  <template #actions="{ row }">
    <button 
      @click.stop="removeClaim(row.dispensingUuid)"
      class="text-red-500 hover:text-red-700"
      title="Remove claim"
    >
      <i v-html="icons.trash"></i>Remove
    </button>
  </template>
</Table>
      </submitClaimsDataProvider>
    </template>
  
  </DefaultPage>
</template>