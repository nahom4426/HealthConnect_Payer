<script setup>
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import icons from "@/utils/icons";
import { ref } from "vue";
import { usePagination } from "@/composables/usePagination";
import { getContaractedProviders } from "@/features/providers/api/providerApi";
import { useAuthStore } from "@/stores/auth";
import SubmittedClaimDataProvider from "../submittedClaim/components/SubmittedClaimDataProvider.vue";
import Payment_row from "./components/Payment_row.vue";
const search = ref("");
const selectedOption = ref("");
const authstore = useAuthStore();
const pagination = usePagination({
  cb: () => getContaractedProviders(authstore.auth?.user?.payerUuid),
});
</script>

<template>
  <DefaultPage :first="false" placeholder="Search Insured Members">
    <template #first>
      <div
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 text-base-clr bg-base-clr3"
      >
        <i v-html="icons.filter"></i>
        <select class="bg-transparent appearance-none" v-model="selectedOption">
          <option selected value="">All Claims</option>

          <option
            v-for="option in pagination.data?.value?.content"
            :key="option.providerUuid"
            :value="option.providerUuid"
          >
            {{ option.providerName }}
          </option>
        </select>
      </div>
    </template>

    <template #add-action>
      <div
        tabindex="0"
        class="w-[28rem] bg-base-clr3 h-[3.5rem] focus-within:border-primary flex items-center rounded-lg overflow-hidden"
      >
        <span
          class="w-10 h-full text-base-clr grid place-items-center"
          v-html="icons.search"
        />
        <input
          v-model="search"
          placeholder="Search Claim Batches"
          class="flex-1 bg-transparent px-4 py-2 h-full outline-none"
        />
      </div>
    </template>
    <SubmittedClaimDataProvider
      status="APPROVED"
      :id="$route.params.id"
      :search="search"
      :providerUuid="selectedOption"
      v-slot="{ claims, pending }"
    >
      <Table
        :pending="pending"
        :headers="{
          head: [
            'Batch Code',
            'Provider Name',
            'Requested On',
            'Claim dating from',
            'Claim dating to',
            'Claim Amount',
            'Actions',
          ],
          row: [
            'batchCode',
            'providerName',
            'visitDate',
            'claimDatingFrom',
            'claimDatingTo',
            'totalAmount',
          ],
        }"
        :row-com="Payment_row"
        :rows="claims"
      >
      </Table>
    </SubmittedClaimDataProvider>
  </DefaultPage>
</template>
