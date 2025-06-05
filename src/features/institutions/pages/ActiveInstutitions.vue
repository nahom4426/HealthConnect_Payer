<script setup lang="ts">
import { ref } from "vue";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import InstitutionAlertsDataProvider from "../components/InstitutionAlertsDataProvider.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface";

const dataProvider = ref();

function refreshData() {
  if (dataProvider.value) {
    dataProvider.value.refresh();
  }
}

function handlePageChange(page: number) {
  if (dataProvider.value) {
    dataProvider.value.currentPage = page;
  }
}

function handleLimitChange(limit: number) {
  if (dataProvider.value) {
    dataProvider.value.itemsPerPage = limit;
  }
}
</script>

<template>
  <DefaultPage v-slot="{ search }">
    <template #header>
      <h1>Institution Alerts</h1>
    </template>
    
    <InstitutionAlertsDataProvider 
      ref="dataProvider"
      :search="search" 
      v-slot="{ alerts, pending, currentPage, itemsPerPage }"
    >
      <Table
        :pending="pending"
        :headers="{
          head: ['Institution Name', 'Alert Type', 'Message', 'Created Date', 'Status', 'Actions'],
          row: ['institutionName', 'alertType', 'message', 'createdDate', 'status']
        }"
        :rows="alerts"
        :cells="{
          createdDate: (val) => new Date(val).toLocaleDateString(),
          status: (val) => val
        }"
        :pagination="{
          currentPage,
          itemsPerPage,
          onPageChange: handlePageChange,
          onLimitChange: handleLimitChange
        }"
      >
        <template #status="{ row }">
          <div 
            :class="{
              'px-2 py-1 rounded-full text-xs font-medium': true,
              'bg-green-100 text-green-800': row.status === Status.ACTIVE,
              'bg-red-100 text-red-800': row.status === Status.INACTIVE,
              'bg-yellow-100 text-yellow-800': row.status === Status.PENDING,
            }"
          >
            {{ row.status }}
          </div>
        </template>
        
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
    </InstitutionAlertsDataProvider>
  </DefaultPage>
</template>
