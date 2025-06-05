<script setup>
import DefaultPage from "@/components/DefaultPage.vue";
import Table from "@/components/Table.vue";
import { usePagination } from "@/composables/usePagination";
import icons from "@/utils/icons";
import { removeUndefined } from "@/utils/utils";
import { ref, watch } from "vue";
import PayerDataProvider from "@/components/PayerDataProvider.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { getInsuredMembers } from "../api/insuredMember";
import { useinsuredMember } from "../store/creditServiceStore";
import { useAuthStore } from "@/stores/auth";
import {
  getInsuredContractMembers,
  getPayerInstitutionContract,
} from "../api/payerContractApi";
import Button from "@/components/Button.vue";
import router from "@/router";
import { createClaim } from "../api/claimApi";
import Dependant_row from "../components/Dependant_row.vue";
const authStore = useAuthStore();
const insuredMember = useinsuredMember();
const api = useApiRequest();
const payerUuid = ref("");
const institutionUuid = ref("");
function getMembers() {
  api.send(
    () => getPayerInstitutionContract(authStore.auth?.user?.providerUuid),
    (res) => {}
  );
}
const pagination = usePagination({
  store: insuredMember,
  cb: (data) =>
    getInsuredContractMembers({
      ...removeUndefined({
        providerUuid: authStore.auth?.user?.providerUuid,
        payerUuid: payerUuid.value,
        institutionUuid: institutionUuid.value,
        search: search.value,
      }),
    }),
  auto: false,
});
const search = ref("");
watch(search, () => {
  if (payerUuid.value && institutionUuid.value) {
    pagination.send();
  } else return;
});
</script>
<template>
  <DefaultPage v-model="search">
    <template #more>
      <div class="flex gap-4 items-center">
        <i class="*:size-5" v-html="icons.user" />
        <p class="font-bold">Eligibility Check</p>
      </div>
    </template>

    <PayerDataProvider v-slot="{ payers, pending }">
      <div class="flex flex-col gap-4">
        <div class="flex gap-4 p-2">
          <select
            v-if="!pending"
            class="h-10 border-[#C8C8C8] bg-[#F6F6F6] w-40 px-2 border rounded"
            v-model="payerUuid"
            @change="getMembers"
          >
            <option value="" selected>Select Payer</option>
            <option
              v-for="payer in payers"
              :key="payer.payerUuid"
              :value="payer.payerUuid"
            >
              {{ payer.payerName }}
            </option>
          </select>
          <select
            class="h-10 w-40 px-2 bg-transparent border-[#C8C8C8] bg-[#F6F6F6] border rounded"
            v-if="payerUuid"
            v-model="institutionUuid"
          >
            <option value="" selected>select Institution</option>
            <option
              v-for="institution in api.response.value"
              :key="institution.institutionUuid"
              :value="institution.institutionUuid"
            >
              {{ institution.institutionName }}
            </option>
          </select>
        </div>
        <Table
          :pending="pagination.pending.value"
          :headers="{
            head: [
              'Name',
              'Assured Id ',
              'Relationship',
              'Institution Name',
              'Insurance Name',
              'Status ',
              'actions',
            ],
            row: [
              'name',
              'insuranceId',
              'relationship',
              'institutionName',
              'payerName',
              'status',
            ],
          }"
          :row-com="Dependant_row"
          :rows="
            insuredMember.insuredMember.map((el) => {
              return {
                name: `${el.firstName} ${el.fatherName}`,
                ...el,
                relationship: 'Main',
              };
            })
          "
        >
        </Table>
      </div>
    </PayerDataProvider>
  </DefaultPage>
</template>
