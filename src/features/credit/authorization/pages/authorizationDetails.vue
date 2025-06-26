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
import AboutPayerForm from "../form/AboutPayerForm.vue";
import ClaimSummaryForm from "../form/ClaimSummaryForm.vue";
import { getAuthorizationDetail } from "../api/authorizationApi";
import DynamicForm from "../form/DynamicForm.vue";
const route = useRoute();
const id = ref(route.params?.id);
console.log(route.params?.id);

const pagination = usePagination({
  cb: (data) => getAuthorizationDetail(route.params?.id),
});
const aboutPayer = ref([
  { title: "Payer Name", value: "John Doe" },
  { title: "Category", value: "Health Insurance" },
  { title: "Contact", value: "123-456-7890" },
]);
</script>

<template>
  <DefaultPage :first="false">
    <template #first>
      <div class="grid grid-cols-2 gap-4 w-full">
        <div class="flex-1 flex gap-2">
          <div class="p-2 bg-base-clr3 rounded-lg">
            <img
              class="object-cover"
              src="../../../../assets/img/letter-logo.png"
              alt=""
            />
          </div>
          <DynamicForm :aboutPayer="aboutPayer" />
        </div>
        <ClaimSummaryForm />
      </div>
    </template>
    <div class="bg-base-clr3 rounded-md p-4">
      <Table
        :pending="pending"
        :rows="pagination.data?.value"
        :headers="{
          head: [
            'Invoice ID',
            'Patient Name',
            'Encounter Date',
            'Branch',
            'Credit Amount',
            'Status',
            'Actions',
          ],
          row: [
            'batchCode',
            'insuredName',
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
    </div>
  </DefaultPage>
</template>
