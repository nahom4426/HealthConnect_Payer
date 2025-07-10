<script setup ">
import { ref,  } from "vue";
import Table from "@/components/Table.vue";
import InsuredPersonsDataProvider from "../components/InsuredPersonsDataProvider.vue";

import StatusRow from "../components/InsuredPersonStatusRow.vue";
import { useAuthStore } from "@/stores/auth";
const props = defineProps({
  search: String,
});

const dataProvider = ref();

const auth = useAuthStore();
const institutionId = ref(
  auth.auth?.user?.payerUuid || "" 
);





</script>

<template>
  <InsuredPersonsDataProvider
    ref="dataProvider"
    :institutionId="institutionId"
    :search="props.search"
    v-slot="{ insuredMembers, pending, currentPage, itemsPerPage, totalPages }"
  >
    <Table
      :pending="pending"
      :headers="{
        head: [
          'Full Name',
          'ID Number',
          'Phone',
          
          'Status',
          'Actions',
        ],
        row: ['fullName', 'idNumber', 'phone',  'status'],
      }"
      :rows="insuredMembers"
      :rowCom="StatusRow"
    
    >
      <template #row>
        <StatusRow
          :rowData="insuredMembers"
          :rowKeys="['fullName', 'idNumber', 'phone', 'position', 'status']"
          :headKeys="[
            '',
            'Full Name',
            'ID Number',
            'Phone',
            'Position',
            'Status',
            'Actions',
          ]"
        />
      </template>
    </Table>
  </InsuredPersonsDataProvider>
</template>
