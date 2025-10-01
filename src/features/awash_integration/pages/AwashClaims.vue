<script setup lang="ts">
import DefaultPage from "@/components/DefaultPage.vue";
import Table from "@/components/Table.vue";
import icons from "@/utils/icons";
import { onMounted, watch } from "vue";
import { useAwashFailedStore } from "../store/awashFailedStore";
import AwashClaimRow from "../components/AwashClaimRow.vue";

const store = useAwashFailedStore();

onMounted(() => {
  store.fetchClaims();
});

watch(
  () => store.status,
  () => {
    store.fetchClaims();
  }
);
</script>

<template>


    <Table
      :pending="store.loading"
      :rows="store.claims"
      :headers="{
        head: [
     
          'Batch Code',
          'Provider UUID',
          'Claim From Date',
          'Claim To Date',
          'Total Amount',
          'Status',
          'Error Message',
          'Actions',
        ],
        row: [
     
          'batchCode',
          'providerUuid',
          'claimFromDate',
          'claimToDate',
          'totalAmount',
          'status',
          'errorMessage',
        ],
      }"
      :row-com="AwashClaimRow"
    />

</template>

