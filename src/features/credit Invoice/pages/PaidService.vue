<script setup>
import { ref } from "vue";
import FilterInput from "../components/FilterInput.vue";
import InvoiceTable from "../components/InvoiceTable.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import {
  getCompletedClaim,
  getPaidClaims,
  getRequestedPayment,
} from "../api/completedServiceApi";
import { useAuthStore } from "@/stores/auth";
const userData = ref({});
const api = useApiRequest();
const authStore = useAuthStore();
function submit() {
  api.send(() =>
    getPaidClaims({
      beginDate: userData.value?.from,
      endDate: userData.value?.to,
      providerUuid: authStore.auth?.user?.providerUuid,
      institutionUuid: userData.value?.institutionUuid,
      payerUuid: userData.value?.payerUuid,
    })
  );
}
</script>
<template>
  <div class="flex flex-col gap-8 px-4">
    <FilterInput :submit="submit" v-model="userData" />

    <InvoiceTable
      :pending="api.pending.value"
      :rows="api.response.value"
      :headers="{
        head: ['Amount', ' Paid Date', 'Status'],
        row: [
          'fullName',
          'relationShip',
          'institution',
          'serviceDate',
          'claimAmount',
        ],
      }"
    />
  </div>
</template>
