<script setup>
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import { openModal } from "@customizer/modal-x";
import icons from "@/utils/icons";
import SubmittedClaimDataProvider from "../submittedClaim/components/SubmittedClaimDataProvider.vue";
import Financial_row from "./components/Financial_row.vue";
</script>

<template>
  <DefaultPage :first="false" placeholder="Search Insured Members">
    <template #first>
      <button
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 text-base-clr bg-base-clr3"
      >
        <i v-html="icons.filter"></i>
        <p class="text-base">All Claims</p>
      </button>
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
      status="SUBMITTED"
      :id="$route.params.id"
      :search="search"
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
        :row-com="Financial_row"
        :rows="claims"
      >
      </Table>
    </SubmittedClaimDataProvider>
  </DefaultPage>
</template>
