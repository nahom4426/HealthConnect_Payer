<script setup>
import { ref } from "vue";
import Table from "@/components/Table.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface";
import icons from "@/utils/icons";
import DefaultPage from "@/components/DefaultPage.vue";
import AuthorizationBatchDataProvider from "../components/AuthorizationBatchDataProvider.vue";
import Dropdown from "@/components/Dropdown.vue";
</script>

<template>
  <DefaultPage placeholder="Search Claim">
    <template #filter>
      <Dropdown v-slot="{ setRef, toggleDropdown }">
        <button
          @click.prevent="toggleDropdown"
          class="flex justify-center items-center gap-2 rounded-md px-6 py-4 text-primary bg-base-clr3"
        >
          <i v-html="icons.filter"></i>
          <p class="text-base">Filters</p>
        </button>
        <div
          class="flex shadow-lg border p-2 mt-2 rounded flex-col gap-2 w-60 bg-[#F6F7FA]"
          :ref="setRef"
        >
          <button
            class="p-2 flex items-center gap-2 rounded-lg hover:bg-gray-100"
          >
            <span>Status</span>
          </button>
        </div>
      </Dropdown>
    </template>

    <template #default="{ search }">
      <AuthorizationBatchDataProvider
        v-slot="{ pending, data }"
        :search="search"
      >
        <Table
          :pending="pending"
          :rows="data"
          :headers="{
            head: [
              'Batch Code',
              'Payer',
              'Requested On',
              'Claim dating from',
              'Claim dating to',
              'Status',
              'Actions',
            ],
            row: [
              'batchCode',
              'payerName',
              'requestedOn',
              'claimDatingFrom',
              'claimDatingTo',
              'status',
            ],
          }"
        >
          <template #actions="{ row }">
            <div class="flex gap-2">
              <Button type="link" size="xs">
                <RouterLink :to="`/institution/alerts/${row.id}`">
                  View Details
                </RouterLink>
              </Button>
            </div>
          </template>
        </Table>
      </AuthorizationBatchDataProvider>
    </template>
  </DefaultPage>
</template>
