<script setup>
import { ref } from "vue";
import Table from "@/components/Table.vue";
import Button from "@/components/Button.vue";
import icons from "@/utils/icons";
import DefaultPage from "@/components/DefaultPage.vue";
import AuthorizationBatchDataProvider from "../components/AuthorizationBatchDataProvider.vue";
import Dropdown from "@/components/Dropdown.vue";
import { formatDateToYYMMDD } from "@/utils/utils";
import { useRoute } from "vue-router";
import { usePagination } from "@/composables/usePagination";
import { getAuthorizationDetail } from "../api/authorizationApi";
const route = useRoute();
const id = ref(route.params?.id);
console.log(route.params?.id);

const pagination = usePagination({
  cb: (data) => getAuthorizationDetail(route.params?.id),
});
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
      <Table
        :pending="pending"
        :rows="pagination.data?.value"
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
        ,
        :cells="{
          requestedOn: (requestedOn) => {
            const date = new Date(requestedOn);
            if (!isNaN(date.getTime())) {
              return formatDateToYYMMDD(date);
            }
          },
        }"
      >
        <template #actions="{ row }">
          <div class="flex gap-2">
            <Button type="link" size="xs">
              <RouterLink :to="`authorization/detail/${row.batchCode}`">
                View
              </RouterLink>
            </Button>
          </div>
        </template>
      </Table>
    </template>
  </DefaultPage>
</template>
