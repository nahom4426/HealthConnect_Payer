<script setup>
import DefaultPage from "@/components/DefaultPage.vue";
import { usePagination } from "@/composables/usePagination";
import icons from "@/utils/icons";
import { getClaimByStatus } from "../api/trackClaimApi";
import { formatDateToYYMMDD, removeUndefined } from "@/utils/utils";
import Table from "@/components/Table.vue";
import Price_row from "../../authorization/components/price_row.vue";
import PriceAndStatusRow from "../components/track_row.vue";
import SubmittedClaimDataProvider from "@/features/claim/pages/submittedClaim/components/SubmittedClaimDataProvider.vue";

const pagination = usePagination({
  cb: (data) =>
    getClaimByStatus(
      removeUndefined({
        ...data,
      })
    ),
});
</script>

<template>
  <DefaultPage placeholder="Search Claim Batch">
    <!-- <template #add-action
      ><button
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 bg-base-clr3"
      >
        <i v-html="icons.filter"></i>
        <p class="text-base">Filters</p>
      </button>
    </template> -->
    <SubmittedClaimDataProvider
      :id="$route.params.id"
      :search="search"
      :providerUuid="selectedOption"
      v-slot="{ claims, pending }"
    >
      <Table
        :pending="pending"
        :rows="claims"
        :headers="{
          head: [
            'Batch Code',
            'Provider Name',
            'Requested On',
            'Claim dating from',
            'Claim dating to',
            'Claim Amount',
            'Status',
            'Actions',
          ],
          row: [
            'batchCode',
            'providerName',
            'visitDate',
            'claimDatingFrom',
            'claimDatingTo',
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
    </SubmittedClaimDataProvider>
  </DefaultPage>
</template>
