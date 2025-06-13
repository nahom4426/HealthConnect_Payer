<script setup lang="ts">
import { ref, defineEmits } from "vue";
import { useRouter } from "vue-router";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import submitClaimsDataProvider from "../components/submitClaimsDataProvider.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface";

import { changeInsuredStatus, deleteInsured } from "../api/submitClaimsApi";
import { addToast } from "@/toast";

import { useApiRequest } from "@/composables/useApiRequest";
import StatusRow from "../components/submitClaimsStatusRow.vue";
import { openModal } from "@customizer/modal-x";
import { insuredMembers } from "../store/submitClaimsStore";
import icons from "@/utils/icons";
import { useAuthStore } from "@/stores/auth";

const emit = defineEmits(["navigate"]);
const router = useRouter();
const dataProvider = ref();
const insuredStore = insuredMembers();
const statusReq = useApiRequest();
const deleteReq = useApiRequest();
const auth = useAuthStore();
const institutionId = ref(
  auth.auth?.user?.payerUuid || 
  '' // fallback if not available
);

function handleAddInsured() {
  openModal("AddInsured", {
    onAdded: (newInsured: any) => {
      insuredStore.add(newInsured);
      refreshData();
      addToast({
        type: "success",
        title: "Insured Added",
        message: `Insured "${newInsured.firstName} ${newInsured.fatherName} " has been added successfully`,
      });
    },
  });
}

function handlePageChange(page: number) {
  if (dataProvider.value) {
    dataProvider.value.pagination.setPage(page);
  }
}

function handleLimitChange(limit: number) {
  if (dataProvider.value) {
    dataProvider.value.pagination.setLimit(limit);
  }
}

function refreshData() {
  if (dataProvider.value) {
    dataProvider.value.pagination.send();
  }
}
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
        @click.prevent="handleAddInsured"
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 bg-primary text-white"
      >
        <i v-html="icons.plus_circle"></i>
        <p class="text-base">Add Insured</p>
      </button>
    </template>
    <template #default="{ search }">
      <submitClaimsDataProvider
        ref="dataProvider"
        :institutionId="institutionId"  
        :search="search"
        v-slot="{ insuredMembers, pending, currentPage, itemsPerPage, totalPages }"
      >
        <Table
          :pending="pending"
          :headers="{
            head: [
              'Full Name',
              'ID Number',
              'Phone',
              'Position',
              'Status',
              'Actions',
            ],
            row: [
              'fullName',
              'idNumber',
              'phone',
              'position',
              'status',
            ],
          }"
          :rows="insuredMembers"
          :rowCom="StatusRow"
          :pagination="{
            currentPage,
            itemsPerPage,
            totalPages,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange,
          }"
        >
          <template #row>
            <StatusRow
              :rowData="insuredMembers"
              :rowKeys="[
                'fullName',
                'idNumber',
                'phone',
                'position',
                'status',
              ]"
              :headKeys="[
                '',
                'Full Name',
                'ID Number',
                'Phone',
                'Position',
                'Status',
                'Actions',
              ]"
              :onRowClick="(row) => {}"
            />
          </template>
        </Table>
      </submitClaimsDataProvider>
    </template>
  </DefaultPage>
</template>
