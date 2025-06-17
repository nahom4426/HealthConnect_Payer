<script setup lang="ts">
import { ref, defineEmits } from "vue";
import { useRouter } from "vue-router";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import submitClaimsDataProvider from "../components/submitClaimsDataProvider.vue";
import Button from "@/components/Button.vue";
import StatusRow from "../components/submitClaimsStatusRow.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { claimServices } from "../store/submitClaimsStore";
import icons from "@/utils/icons";
import { useAuthStore } from "@/stores/auth";
import Input from "@/components/new_form_elements/Input.vue";
import ModalFormSubmitButton from "@/components/new_form_builder/ModalFormSubmitButton.vue";

const emit = defineEmits(["navigate"]);
const router = useRouter();
const dataProvider = ref();
const claimServicesStore = claimServices();
const auth = useAuthStore();
const providerUuid = ref(auth.auth?.user?.providerUuid || '');

const isClaimCreationMode = ref(false); // Toggle between views

const fromDate = ref("2017-01-01");
const toDate = ref("2017-12-30");
const selectedPayer = ref("Moha Softdrinks");

// Fake claim data for the claim creation table view
const filteredClaims = ref([]);
const generateClaims = () => {
  // Replace with actual logic if needed
  filteredClaims.value = claimServicesStore.claims.filter(c => c.payerUuid === selectedPayer.value);
};
</script>
 
<template>
  <DefaultPage :placeholder="!isClaimCreationMode ? 'Search Credits' : ''">
    <template #filter v-if="!isClaimCreationMode">
      <button class="flex items-center gap-2 rounded-md px-4 py-2 bg-base-clr3 text-primary">
        <i v-html="icons.filter"></i>
        <span>Filter</span>
      </button>
    </template>

    <template #add-action>
      <button
        class="flex items-center gap-2 rounded-md px-4 py-2 text-white"
        :class="isClaimCreationMode ? 'bg-gray-500' : 'bg-primary'"
        @click="isClaimCreationMode = !isClaimCreationMode"
      >
        <i v-html="icons.add"></i>
        <span>{{ isClaimCreationMode ? 'Back' : 'Add Credit' }}</span>
      </button>
    </template>

    <template #default="{ search }">
      <!-- DEFAULT VIEW (Search + Table) -->
      <submitClaimsDataProvider
        v-if="!isClaimCreationMode"
        ref="dataProvider"
        :providerUuid="providerUuid"
        :search="search"
        v-slot="{ claimServices, pending, currentPage, itemsPerPage, totalPages }"
      >
        <Table
          :pending="pending"
          :headers="{
            head: ['Invoice ID', 'Payer', 'Patient Name', 'Encounter Date', 'Branch', 'Credit Amount', 'Action'],
            row: ['invoiceNumber', 'payerUuid', 'patientName', 'dispensingDate', 'branchName', 'totalAmount'],
          }"
          :rows="claimServices"
          :rowCom="StatusRow"
          :pagination="{
            currentPage,
            itemsPerPage,
            totalPages,
            onPageChange: () => {},
            onLimitChange: () => {},
          }"
        />
      </submitClaimsDataProvider>

      <!-- CLAIM CREATION VIEW -->
     <div v-else class="space-y-4 ">
      <div class="border rounded-lg  p-4 border-[#ECECEE] gap-4 ">
    <div class="grid grid-cols-1 md:grid-cols-2  gap-4 pb-2">
      <div>
     
        <Input
          type="date"
          v-model="fromDate"
          label="Credits From"
          :validation="'required'"
          :validationMessage="'Start date is required'"
          :attributes="{ placeholder: 'Select start date',
             type: 'date',
           }"
        />
      </div>
      <div> 
        <Input
          type="date"
          v-model="toDate"
          label="Credits To"
          :attributes="{ placeholder: 'Select end date' ,
            type: 'date',
          }"
        />
        
      </div>
      
      </div>
      <div class="flex w-full gap-4 pt-2">
        <div class="w-full pr-2">
        <Input
          type="text"
          v-model="selectedPayer"
          label="Payer Name"
          :validation="'required'"
          :attributes="{ placeholder: 'Enter payer name' }"
        />
      </div>
        <div class="justify-end pt-6 w-28">
         <ModalFormSubmitButton
        :pending="pending"
        :btn-text="'Generate '"
        @click="generateClaims"
        class="bg-[#02676B] hover:bg-[#014F4F] text-white px-6 py-3 border-[#02676B] hover:border-[#014F4F]"
        />
        </div>
    </div>
</div>  

<div class="border rounded-lg p-4 border-[#ECECEE]">
    <div class="flex justify-between items-center p-3.5 mb-4 rounded-lg bg-[#F6F7FA]">
      <p class="font-medium text-base">
        Result for claims from “{{ fromDate }}” to “{{ toDate }}” for {{ selectedPayer }}
      </p>
      <button class="bg-primary text-white px-4 py-3 rounded-md">
        Create {{ filteredClaims.length }} Claims
      </button>
     
    </div>

    <Table
      :headers="{
        head: ['Invoice ID', 'Payer', 'Patient Name', 'Encounter Date', 'Branch', 'Credit Amount', 'Action'],
        row: ['invoiceNumber', 'payerUuid', 'patientName', 'dispensingDate', 'branchName', 'totalAmount'],
      }"
      :rows="filteredClaims"
      :rowCom="StatusRow"
      :pending="false"
    />
</div>
  </div>
    </template>
  </DefaultPage>
</template>
