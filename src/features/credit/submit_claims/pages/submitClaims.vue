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
const payerSearchTerm = ref("");

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
  if (!payerSearchTerm.value) return claimServicesStore.payerOptions;

  return claimServicesStore.payerOptions.filter((option) =>
    option.label.toLowerCase().includes(payerSearchTerm.value.toLowerCase())
  );
});

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
    <template #filter>
      <button class="flex justify-center items-center gap-2 rounded-md px-6 py-4 text-primary bg-base-clr3">
        <i v-html="icons.filter"></i>
        <span>Filter</span>
      </button>
    </template>

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
        <Select
          :obj="true"
          name="payerUuid"
          label="Payer"
          validation="required"
          :options="payerOptions"
          :attributes="{
            placeholder: 'Select Payer',
            clearable: true,
          }"
          v-model="selectedPayerUuid"
        />
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