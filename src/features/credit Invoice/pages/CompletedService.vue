<script setup>
import { ref } from "vue";
import FilterInput from "../components/FilterInput.vue";
import InvoiceTable from "../components/InvoiceTable.vue";
import { usePagination } from "@/composables/usePagination";
import { removeUndefined, toasted } from "@/utils/utils";
import { useApiRequest } from "@/composables/useApiRequest";
import { getCompletedClaim, requestPayment } from "../api/completedServiceApi";
import { useAuthStore } from "@/stores/auth";
import Button from "@/components/Button.vue";
import { useCompletedService } from "../store/completedServiceStore";
import Amount_row from "../components/Amount_row.vue";
const userData = ref({});
const api = useApiRequest();
const authStore = useAuthStore();
const data = ref([]);
const completedStore = useCompletedService();
function submit() {
  api.send(
    () =>
      getCompletedClaim(
        removeUndefined({
          beginDate: userData.value?.from,
          endDate: userData.value?.to,
          providerUuid: authStore.auth?.user?.providerUuid,
          institutionUuid: userData.value?.institutionUuid,
          payerUuid: userData.value?.payerUuid,
        })
      ),
    (res) => {
      if (res.success) {
        completedStore.completedService = res.data;
      }
    }
  );
}
const requestedData = ref([]);
const selected = ref([]);
function payment() {
  console.log(selected.value);
  selected.value.forEach((el) => {
    api.response.value?.forEach((responseItem) => {
      if (el === responseItem?.claimUuid) {
        requestedData.value.unshift({
          claimUuid: responseItem?.claimUuid,
          requestPaymentByUuid: responseItem?.payerProviderContractUuid,
          requestPaymentByFullName: responseItem?.insuredFullName,
        });
      }
    });
  });

  api.send(
    () =>
      requestPayment(
        {
          providerUuid: authStore.auth?.user?.providerUuid,
          payerUuid: userData.value?.payerUuid,
        },
        requestedData.value
      ),
    (res) => {
      if (res) {
        toasted(res.success, "Payment Requested successfully!", res.error);
        requestedData.value.forEach((el) => {
          completedStore.remove(el.claimUuid);
        });
      }
    }
  );
}

function select(id) {
  const idx = selected.value.findIndex((el) => el == id);
  if (idx > -1) {
    selected.value.splice(idx, 1);
  } else {
    selected.value.unshift(id);
  }
}
function selectAll(checked, data) {
  console.log(data);
  if (checked) {
    selected.value = data.map((el) => el.claimUuid);
  } else {
    selected.value = [];
  }
}
</script>
<template>
  <div class="flex flex-col gap-8 px-4">
    <div class="flex gap-2">
      <FilterInput :submit="submit" v-model="userData" />
      <div v-if="userData?.institutionUuid" class="flex items-end">
        <Button
          :pending="api.pending.value"
          class="h-10 bg-primary w-full text-white font-bold"
          @click="payment"
          >Submit ({{ selected.length }})</Button
        >
      </div>
    </div>
    <InvoiceTable
      :lastCol="true"
      :pending="api.pending.value"
      :rows="
        completedStore.completedService.map((el) => {
          return {
            amount: `${el.totalAmount} Birr `,
            ...el,
          };
        }) || []
      "
      :headers="{
        head: [
          'Full Name',
          'Relationship',
          'Institution',
          'Service Date',
          'Claim Amount',
        ],
        row: [
          'insuredFullName',
          'relationShip',
          'institutionName',
          'claimDate',
          'amount',
        ],
      }"
    >
      <template #lastColHeader="{}">
        <div class="flex gap-4 items-center">
          <Button>
            <input
              type="checkbox"
              @change="
                selectAll(
                  $event.target.checked,
                  completedStore.completedService
                )
              "
            />
          </Button>
        </div>
      </template>

      <template #lastCol="{ row }">
        <div class="flex gap-4 items-center">
          <Button>
            <input
              :checked="selected.includes(row?.claimUuid)"
              type="checkbox"
              @click="select(row?.claimUuid)"
            />
          </Button>
        </div>
      </template>
    </InvoiceTable>
  </div>
</template>
