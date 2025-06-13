<script setup lang="ts">
import { ref, defineEmits ,computed } from "vue";
import { useRouter } from "vue-router";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import authorizationDataProvider from "../components/authorizationDataProvider.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface";

import { authorizeClaims, changeInsuredStatus, deleteInsured, getPayerbyPayerUuid } from "../api/authorizationApi";
import { addToast } from "@/toast";

import { useApiRequest } from "@/composables/useApiRequest";
import StatusRow from "../components/authorizationStatusRow.vue";
import { openModal } from "@customizer/modal-x";
import { authorizationStore } from "../store/authorizationStore";
import icons from "@/utils/icons";
import { useAuthStore } from "@/stores/auth";

const emit = defineEmits(["navigate"]);
const router = useRouter();
const dataProvider = ref();
const authorization = authorizationStore();
const statusReq = useApiRequest();
const deleteReq = useApiRequest();
const auth = useAuthStore();
const providerUuid = ref(
  auth.auth?.user?.providerUuid || 
  '' // fallback if not available
);
const selectedClaims = ref<Set<string>>(new Set());
const selectAll = ref(false);

// Add these new methods
const toggleSelectAll = () => {
  if (selectAll.value) {
    dataProvider.value?.currentData.forEach((claim: any) => {
      selectedClaims.value.add(claim.claimUuid);
    });
  } else {
    selectedClaims.value.clear();
  }
};

const toggleClaimSelection = (claimUuid: string) => {
  if (selectedClaims.value.has(claimUuid)) {
    selectedClaims.value.delete(claimUuid);
  } else {
    selectedClaims.value.add(claimUuid);
  }
  selectAll.value = selectedClaims.value.size === dataProvider.value?.currentData.length;
};

const authorizeSelected = async () => {
  if (selectedClaims.value.size === 0) {
    addToast({ type: 'warning', title: 'No Selection', message: 'Please select at least one claim to authorize' });
    return;
  }

  try {
    // Replace with your actual authorization API call
    const response = await authorizeClaims(Array.from(selectedClaims.value));
    if (response.success) {
      addToast({ type: 'success', title: 'Authorization Successful', message: `${selectedClaims.value.size} claims authorized` });
      selectedClaims.value.clear();
      selectAll.value = false;
      dataProvider.value?.refresh(); // Refresh the data
    } else {
      throw new Error(response.error || 'Failed to authorize claims');
    }
  } catch (error) {
    addToast({ type: 'error', title: 'Authorization Failed', message: error.message });
  }
};
// ... your existing methods ...

</script>

<template>
  <DefaultPage placeholder="Search Insured Members">
    <template #filter>
      <button
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 text-primary bg-base-clr3"
      >
        <i v-html="icons.filter"></i>
        <p class="text-base">Filters</p>
      </button>
    </template>
      <template #add-action>
      <Button
        v-if="selectedClaims.size > 0"
        @click="authorizeSelected"
        class="ml-2"
        variant="primary"
      >
        Authorize Selected ({{ selectedClaims.size }})
      </Button>
      <Button
       v-else
        
        class="ml-2 "
        variant="primary"
      >
       No Authorizatin 
      </Button>
    </template>
  <template #default="{ search }">
      <authorizationDataProvider
        ref="dataProvider"
        :providerUuid="providerUuid"
        :search="search"
        v-slot="{ authorizationStore, pending, currentPage, itemsPerPage, totalPages }"
      >
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
          'Actions',
        ],
        row: [
       
          'invoiceNumber',
          'payerUuid',  // Changed from 'payerName' to 'payerUuid'
          'patientName',
          'dispensingDate',
          'branchName',
          'totalAmount',
        ],
          }"
          :rows="authorizationStore"
          :rowCom="StatusRow"
          :pagination="{
            currentPage,
            itemsPerPage,
            totalPages,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange,
          }"
        >
         
          
        </Table>
      
  </authorizationDataProvider>
</template>
  </DefaultPage>
</template> 