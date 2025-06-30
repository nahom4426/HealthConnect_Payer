<script setup>
import DefaultPage from "@/components/DefaultPage.vue";
import { usePagination } from "@/composables/usePagination";
import icons from "@/utils/icons";
import { getClaimByStatus } from "../api/trackClaimApi";
import { formatDateToYYMMDD, removeUndefined } from "@/utils/utils";
import Table from "@/components/Table.vue";
import Price_row from "../../authorization/components/price_row.vue";
import PriceAndStatusRow from "../components/PriceAndStatusRow.vue";

const pagination = usePagination({
  cb: (data) =>
    getClaimByStatus(
      removeUndefined({
        ClaimStatus: "SUBMITTED",
        ...data,
      })
    ),
});
</script>

<template>
  <DefaultPage placeholder="Search Claim Batch">
    <template #add-action
      ><button
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 bg-base-clr3"
      >
        <i v-html="icons.filter"></i>
        <p class="text-base">Filters</p>
      </button>
    </template>
    <Table
      :pending="pagination.pending.value"
      :rows="pagination.data?.value?.content"
      :headers="{
        head: [
          'Batch Code',
          'Payer',
          'Requested On',
          'Claim dating from',
          'Claim dating to',
          'Claim Amount',
          'Status',
        ],
        row: [
          'batchCode',
          'payerName',
          'visitDate',
          'submissionDate',
          'totalAmount',
          'status',
        ],
      }"
      :cells="{
        visitDate: (visitDate) => {
          const date = new Date(visitDate);
          if (!isNaN(date.getTime())) {
            return formatDateToYYMMDD(date);
          }
        },
        submissionDate: (submissionDate) => {
          const date = new Date(submissionDate);
          if (!isNaN(date.getTime())) {
            return formatDateToYYMMDD(date);
          }
        },
      }"
      :row-com="PriceAndStatusRow"
    >
    </Table>
  </DefaultPage>
</template>
