<script setup>
import Button from "@/components/Button.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import Table from "@/components/Table.vue";
import BatchDetailDataProvider from "./BatchDetailDataProvider.vue";
import { useRoute } from "vue-router";
const route = useRoute();
const payerUuid = route.params.payerUuid;
const tempClaimNumber = route.params.Uuid;
</script>
<template>
  <DefaultPage v-model="search">
    <!-- <template #more>
      <Button class="bg-primary text-white font-bold">Submit</Button>
    </template> -->
    <BatchDetailDataProvider
      :tempClaimNumber="tempClaimNumber"
      :payerUuid="payerUuid"
      v-slot="{ claims, pending }"
      :search="search"
    >
      <Table
        :pending="pending"
        :headers="{
          head: [
            'Full Name',
            'Insurance ID.',
            'Institution',
            'Claim Amount',
            'Status',
            'actions',
          ],
          row: [
            'insuredPersonName',
            'insuranceId',
            'institutionName',
            'totalAmount',
            'requestPaymentStatus',
          ],
        }"
        :rows="claims"
      >
        <template #actions="{ row }">
          <Button
            @click.prevent="$router.push(`/claim/${row.claimUuid}`)"
            class="bg-secondary text-white"
          >
            View
          </Button>
        </template>
      </Table>
    </BatchDetailDataProvider>
  </DefaultPage>
</template>
