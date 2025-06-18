<script setup lang="ts">
import { ref, defineEmits } from "vue";
import { useRouter } from "vue-router";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import creditServicesDataProvider from "../components/creditServicesDataProvider.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface";

import { changeInsuredStatus, deleteInsured, getPayerbyPayerUuid } from "../api/creditServicesApi";
import { addToast } from "@/toast";

import { useApiRequest } from "@/composables/useApiRequest";
import StatusRow from "../components/CreditservicesStatusRow.vue";
import { openModal } from "@customizer/modal-x";
import { claimServices } from "../store/creditClaimsStore";
import icons from "@/utils/icons";
import { useAuthStore } from "@/stores/auth";

const emit = defineEmits(["navigate"]);
const router = useRouter();
const dataProvider = ref();
const claimServicesStore = claimServices();
const statusReq = useApiRequest();
const deleteReq = useApiRequest();
const auth = useAuthStore();
const providerUuid = ref(
  auth.auth?.user?.providerUuid || 
  '' // fallback if not available
);

import { storeToRefs } from "pinia";

const { claimServices: services } = storeToRefs(claimServicesStore); // Destructure with alias

// Fetch initial data


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
         <button
        @click.prevent="openModal('AddCreditServices')"
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 bg-primary text-white"
      >
        <i v-html="icons.plus_circle"></i>
        <p class="text-base">Add Credit</p>
      </button>
    </template>
   <template #default="{ search }">
  <creditServicesDataProvider
    ref="dataProvider"
    :providerUuid="providerUuid"  
    :search="search"
    v-slot="{ claimServices, pending, currentPage, itemsPerPage, totalPages }"
  >
    <Table
      :pending="pending"
      :headers="{
        head: [
          '#',
          'Invoice ID',
          'Payer',
          'Patient Name',
          'Encounter Date',
          'Branch',
          'Credit Amount',
          'Actions',
        ],
        row: [
          'index',
          'invoiceNumber',
          'payerUuid',  // Changed from 'payerName' to 'payerUuid'
          'patientName',
          'dispensingDate',
          'branchName',
          'totalAmount',
        ],
      }"
      :rows="claimServices" 
      :rowCom="StatusRow"
      :pagination="{
        currentPage,
        itemsPerPage,
        totalPages,
        onPageChange: handlePageChange,
        onLimitChange: handleLimitChange,
      }"
    >
      <!-- Remove the custom row template since we're using rowCom -->
    </Table>
  </creditServicesDataProvider>
</template>
  </DefaultPage>
</template> 