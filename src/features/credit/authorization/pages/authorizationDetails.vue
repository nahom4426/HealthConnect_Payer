<script setup>
import { computed, ref } from "vue";
import Table from "@/components/Table.vue";
import Button from "@/components/Button.vue";
import icons from "@/utils/icons";
import DefaultPage from "@/components/DefaultPage.vue";
import AuthorizationBatchDataProvider from "../components/AuthorizationBatchDataProvider.vue";
import Dropdown from "@/components/Dropdown.vue";
import { formatCurrency, formatDateToYYMMDD } from "@/utils/utils";
import { useRoute } from "vue-router";
import { usePagination } from "@/composables/usePagination";
import AboutPayerForm from "../form/AboutPayerForm.vue";
import { getAuthorizationDetail } from "../api/authorizationApi";
import DynamicForm from "../form/DynamicForm.vue";
import { openModal } from "@customizer/modal-x";
const route = useRoute();
const id = ref(route.params?.id);

const pagination = usePagination({
  cb: (data) => getAuthorizationDetail(route.params?.id),
});
const aboutPayer = computed(() => [
  { title: "Payer Name", value: pagination.data?.value?.payerName || "N/A" },
  { title: "Category", value: pagination.data?.value?.providerName || "N/A" },
  { title: "Contact", value: "123-456-7890" },
]);
</script>

<template>
  <DefaultPage :first="false">
    <template #first>
      <div class="grid grid-cols-2 gap-4 w-full">
        <div class="flex-1 flex gap-2">
          <div class="p-2 bg-base-clr3 rounded-lg">
            <img
              class="object-cover"
              src="../../../../assets/img/letter-logo.png"
              alt=""
            />
          </div>
          <DynamicForm :aboutPayer="aboutPayer" />
        </div>
        <!-- <ClaimSummaryForm /> -->
      </div>
    </template>
    <div class="bg-base-clr3 rounded-md p-4">
      <Table
        :pending="pagination.pending.value"
        :rows="pagination.data?.value"
        :headers="{
          head: [
            'Invoice ID',
            'Patient Name',
            'Encounter Date',
            'Branch',
            'Credit Amount',
            'Status',
            'Actions',
          ],
          row: [
            'batchCode',
            'insuredName',
            'recordedAt',
            'branchName',
            'totalAmount',
            'status',
          ],
        }"
        ,
        :cells="{
          requestedOn: (requestedOn) => {
            const date = new Date(requestedOn);
            if (!isNaN(date.getTime())) {
              return formatDateToYYMMDD(date);
            }
          },
          totalAmount: (totalAmount) => {
            return formatCurrency(totalAmount);
          },
        }"
      >
        <template #actions="{ row }">
          <div class="flex gap-2">
            <Button
              @click.prevent="openModal('BatchDetail', row)"
              class="!text-white"
              type="primary"
              size="xs"
            >
              View
            </Button>
          </div>
        </template>
      </Table>
    </div>
  </DefaultPage>
</template>
