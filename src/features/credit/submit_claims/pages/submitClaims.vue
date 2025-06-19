<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import submitClaimsDataProvider from "../components/submitClaimsDataProvider.vue";
import { claimServices } from "../store/submitClaimsStore";
import StatusRow from "../components/submitClaimsStatusRow.vue";
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
const claimServicesStore = claimServices();
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


// Method to refresh data with date filters

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
    option.name.toLowerCase().includes(payerSearchTerm.value.toLowerCase())
  );
});

// Vue Select compatible options
const payerSelectOptions = computed(() => {
  return filteredPayerOptions.value.map(payer => ({
    label: payer.name,
    value: payer.uuid
  }));
});

// Watch for payer selection changes
watch(selectedPayerUuid, (newUuid) => {
  const selected = claimServicesStore.institutions.find(i => i.uuid === newUuid);
  selectedPayerName.value = selected ? selected.name : "";
});

// Filter displayed claims based on selected payer
const displayedClaims = computed(() => {
  if (!isClaimCreationMode.value) return claimServicesStore.claimServices;
  return claimServicesStore.claimServices.filter(
    c => c.payerUuid === selectedPayerUuid.value
  );
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
  } finally {
    isGenerating.value = false;
  }
};

// Submit claims to API
const submitClaims = async () => {
  if (displayedClaims.value.length === 0 || isSubmitting.value) return;

  isSubmitting.value = true;
  const dispensingUuids = displayedClaims.value.map(claim => claim.dispensingUuid);

  try {
    const response = await submitClaimsStatusUpdate(providerUuid.value, dispensingUuids);
    
    if (response?.status === 200) {
      addToast({
        type: "success",
        title: "Claims Submitted",
        message: "Selected claims have been successfully submitted.",
      });
      dataProvider.value?.refresh();
      router.push("/authorization");
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


// Consolidated method to refresh data with all current filters
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

// Watch for changes in fromDate and toDate
watch([fromDate, toDate], ([newFromDate, newToDate]) => {
  if (newFromDate && newToDate) {
    refreshDataWithDates(newFromDate, newToDate);
  }
}, { immediate: true });

// Watch for changes in selectedPayerUuid
watch(selectedPayerUuid, (newPayerUuid) => {
  if (newPayerUuid) {
    const selected = claimServicesStore.institutions.find(i => i.uuid === newPayerUuid);
    selectedPayerName.value = selected ? selected.name : "";
    refreshDataWithDates(fromDate.value, toDate.value); // Call with current date range
  }
});
// Pagination handlers
function handlePageChange(page: number) {
  dataProvider.value?.setPage(page);
}

function handleLimitChange(limit: number) {
  dataProvider.value?.setLimit(limit);
}

function refreshData() {
  dataProvider.value?.refresh();
}
</script>

<template>
  <DefaultPage :placeholder="!isClaimCreationMode ? 'Search Credits' : ''">
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
      <submitClaimsDataProvider
        ref="dataProvider"
        :providerUuid="providerUuid"
        :search="search"
        v-slot="{ pending, currentPage, itemsPerPage, totalPages }"
      >
        <div v-if="isClaimCreationMode" class="space-y-4 mb-4">
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
        max: toDate // Prevent selecting dates after toDate
      }"
      @change="handleDateChange"
    />
    <Input
      v-model="toDate"
      label="Credits To"
      :validation="'required'"
      :attributes="{ 
        placeholder: 'Select end date', 
        type: 'date',
        min: fromDate // Prevent selecting dates before fromDate
      }"
      @change="handleDateChange"
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
        clearable: true // Allow clearing the selection
      }"
      v-model="selectedPayerUuid"
      @change="refreshDataWithFilters"
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
              </p>
              <ModalFormSubmitButton
                :pending="isSubmitting"
                :btn-text="`Create ${displayedClaims.length} Claims`"
                :disabled="displayedClaims.length === 0"
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
              'status',
              'Action'
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
          :rows="displayedClaims"
          :rowCom="StatusRow"
          :pagination="{
            currentPage,
            itemsPerPage,
            totalPages,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange
          }"
        />
      </submitClaimsDataProvider>
    </template>
  </DefaultPage>
</template>