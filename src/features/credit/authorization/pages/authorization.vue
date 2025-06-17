<script setup>
import { ref, defineEmits, computed, watch } from "vue";
import { useRouter } from "vue-router";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import authorizationDataProvider from "../components/authorizationDataProvider.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface";

import {
  authorizeClaims,
  changeInsuredStatus,
  deleteInsured,
  getPayerbyPayerUuid,
} from "../api/authorizationApi";
import { addToast } from "@/toast";

import { useApiRequest } from "@/composables/useApiRequest";
import StatusRow from "../components/authorizationStatusRow.vue";
import { openModal } from "@customizer/modal-x";
import { authorizationStore } from "../store/authorizationStore";
import icons from "@/utils/icons";
import { useAuthStore } from "@/stores/auth";
import { useSelectedClaimsStore } from "../store/selectedClaimsStore";

const emit = defineEmits(["navigate"]);
const router = useRouter();
const dataProvider = ref();
const authorization = authorizationStore();
const statusReq = useApiRequest();
const deleteReq = useApiRequest();
const auth = useAuthStore();
const providerUuid = ref(
  auth.auth?.user?.providerUuid || "" // fallback if not available
);
const selectedClaims = ref([]);
const selectAll = ref(false);
const api = useApiRequest();
const authorizeSelected = async () => {
  api.send(
    () => authorizeClaims(Array.from(useSelectedClaims.selectedValues)),
    (res) => {
      if (res?.success) {
        addToast({
          type: "success",
          title: "Authorization Successful",
          message: `${selectedClaims.value.size} claims authorized`,
        });
        useSelectedClaims.clearValues();
        dataProvider.value?.refresh(); // Refresh the data
      } else {
        addToast({
          type: "error",
          title: "Authorization Failed",
          message: res.error || "Failed to authorize claims",
        });
      }
    }
  );
};
const selected = ref([]);
const useSelectedClaims = useSelectedClaimsStore();

const isSelected = computed(() => {
  console.log(useSelectedClaims.isAllSelected);

  return useSelectedClaims.isAllSelected;
});

function handleSelectAll(checked, data) {
  console.log(checked);

  useSelectedClaims.SelectAll(checked, data);
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
      <Button
        v-if="useSelectedClaims.selectedValues.length > 0"
        @click="authorizeSelected"
        class="ml-2"
        variant="primary"
      >
        Authorize Selected ({{ useSelectedClaims.selectedValues.length }})
      </Button>
      <Button v-else class="ml-2" variant="primary"> No Authorizatin </Button>
    </template>
    <template #default="{ search }">
      <authorizationDataProvider
        ref="dataProvider"
        :providerUuid="providerUuid"
        :search="search"
        v-slot="{
          authorizationStore,
          pending,
          currentPage,
          itemsPerPage,
          totalPages,
        }"
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
              'payerUuid', // Changed from 'payerName' to 'payerUuid'
              'patientName',
              'dispensingDate',
              'branchName',
              'totalAmount',
            ],
          }"
          :rows="authorizationStore"
          :firstCol="true"
          :rowCom="StatusRow"
          :pagination="{
            currentPage,
            itemsPerPage,
            totalPages,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange,
          }"
        >
          <template #headerFirst="{ row }">
            <div class="flex gap-4 items-center">
              <Button>
                <input
                  :checked="isSelected"
                  v-model="isSelected"
                  @change="
                    handleSelectAll($event.target.checked, authorizationStore)
                  "
                  class="size-4"
                  type="checkbox"
                />
              </Button>
            </div>
          </template>
        </Table>
      </authorizationDataProvider>
    </template>
  </DefaultPage>
</template>
