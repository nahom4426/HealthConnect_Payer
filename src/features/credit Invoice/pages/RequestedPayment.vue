<script setup>
import { ref } from "vue";
import FilterInput from "../components/FilterInput.vue";
import InvoiceTable from "../components/InvoiceTable.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import {
  getCompletedClaim,
  getRequestedPayment,
} from "../api/completedServiceApi";
import { useAuthStore } from "@/stores/auth";
import Button from "@/components/Button.vue";
import { useActivePage } from "../store/activepageStore";
import { removeUndefined } from "@/utils/utils";
const activePageStore = useActivePage();

const userData = ref({});
userData.value.payerUuid = activePageStore.activePayer || "";
const api = useApiRequest();
const authStore = useAuthStore();
const data = ref([]);
function submit() {
  console.log(userData.value);
  api.send(
    () =>
      getRequestedPayment(
        removeUndefined({
          beginDate: userData.value?.from,
          endDate: userData.value?.to,
          providerUuid: authStore.auth?.user?.providerUuid,
          institutionUuid: userData.value?.institutionUuid,
          payerUuid: userData.value?.payerUuid,
          status: "REQUESTED",
        })
      ),
    (res) => {
      if (res.success) {
        activePageStore.setRequested(res.data);
        data.value = res.data;
      }
    }
  );
}
</script>
<template>
  <div class="flex flex-col gap-8 px-4">
    <FilterInput :submit="submit" v-model="userData" />

    <InvoiceTable
      :pending="api.pending.value"
      :rows="activePageStore.requested"
      :headers="{
        head: [
          'Institution',
          'Policy Number',
          'Batch Claim No.',
          'Amount ',
          'Date',
          'Status',
          'actions',
        ],
        row: [
          'institutionName',
          'claimCode',
          'batchCode',
          'totalAmount',
          'requestPaymentDate',
          'payerStatus',
        ],
      }"
    >
      <template #actions="row">
        {{ console.log(row?.row) }}
        <Button
          @click.prevent="
            $router.push(
              `/claim-batch-details/${row.row?.tempClaimNumber}/${userData?.payerUuid}`
            )
          "
          class="bg-primary text-white"
          >Detail</Button
        >
      </template>
    </InvoiceTable>
  </div>
</template>
