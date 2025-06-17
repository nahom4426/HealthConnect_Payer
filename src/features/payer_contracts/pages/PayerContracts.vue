<script setup lang="ts">
import { ref, defineEmits } from "vue";
import { useRouter } from 'vue-router';
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import payerContractDataProvider from "../components/payerContractDataProvider.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface";
import { changePayerContractStatus } from "../api/payerContractApi";
import { addToast } from "@/toast";
import { useApiRequest } from "@/composables/useApiRequest";
import StatusRow from "../components/StatusRow.vue";
import { openModal } from "@customizer/modal-x";
import { usePayerContracts } from "../store/payerContractStore";

const emit = defineEmits(['navigate']);

const router = useRouter();
const dataProvider = ref();
const payerContractStore = usePayerContracts();
const statusReq = useApiRequest();
const deleteReq = useApiRequest();

function refreshData() {
  if (dataProvider.value) {
    dataProvider.value.refresh();
  }
}

function handlePageChange(page: number) {
  if (dataProvider.value) {
    dataProvider.value.setPage(page);
  }
}

function handleLimitChange(limit: number) {
  if (dataProvider.value) {
    dataProvider.value.setLimit(limit);
  }
}

function viewDetails(id: string) {
  router.push(`/payerContractStore/${id}`);
}

function openEditModal(provider: any) {
  if (!provider || !provider.providerUuid) return;

  openModal('EditProvider', { 
    providerUuid: provider.providerUuid, 
    provider,
    onUpdated: handleProviderUpdated
  });
}

function handleProviderUpdated(updatedProvider: any) {
  if (updatedProvider?.providerUuid) {
    payerContractStore.update(updatedProvider.providerUuid, updatedProvider);
    refreshData();
    addToast({
      type: 'success',
      title: 'Provider Updated',
      message: `Provider "${updatedProvider.providerName}" has been updated successfully`
    });
  }
}

function handleStatusChange(id: string, newStatus: Status) {
  statusReq.send(
    () => changePayerContractStatus(id, newStatus),
    (res) => {
      if (res.success) {
        payerContractStore.update(id, { status: newStatus });
        addToast({
          type: 'success',
          title: 'Status Updated',
          message: `Provider status has been updated to ${newStatus}`
        });
        refreshData();
      } else {
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: res.error || 'Failed to update provider status'
        });
      }
    }
  );
}

function handleActivate(id: string) {
  handleStatusChange(id, Status.ACTIVE);
}

function handleDeactivate(id: string) {
  handleStatusChange(id, Status.INACTIVE);
}

function handleAddProvider() {
  openModal('AddProvider', {
    onAdded: (newProvider: any) => {
      payerContractStore.add(newProvider);
      refreshData();
      addToast({
        type: 'success',
        title: 'Provider Added',
        message: `Provider "${newProvider.providerName}" has been added successfully`
      });
    }
  });
}
</script>

<template>
  <DefaultPage placeholder="Search Active payerContractStore">
    <template #filter>
      <button class="btn flex items-center gap-2 mx-4 btn-outline border rounded-lg h-14 px-6 text-primary border-primary hover:bg-primary/10">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.5 5H8.33333M2.5 10H10M15.8333 10H17.4999M11.6667 5L17.5001 5M10.8333 15L16.6666 15M2.5 15H5" stroke="#02676B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="6.66667" cy="15" r="1.66667" stroke="#02676B" stroke-width="1.5"/>
          <ellipse cx="14.1667" cy="10" rx="1.66667" ry="1.66667" stroke="#02676B" stroke-width="1.5"/>
          <ellipse cx="9.99992" cy="4.99999" rx="1.66667" ry="1.66667" stroke="#02676B" stroke-width="1.5"/>
        </svg>
        <p class="text-base">Filters</p>
      </button>
    </template>

    <template #add-action>
      <Button @click.prevent="handleAddProvider" class="btn flex items-center gap-2 rounded-lg h-14 px-8 bg-primary text-white hover:bg-primary-dark">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 5.8V12.2M12.2 9H5.8M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p class="text-base">Add Provider</p>
      </Button>
    </template>

    <template #default="{ search }">
      <payerContractDataProvider ref="dataProvider" :search="search" v-slot="{ contracts, pending, currentPage, itemsPerPage, totalPages }">
        <Table
          :pending="pending"
          :headers="{
            head: ['', 'Provider Name', 'Email', 'Telephone', 'Category', 'Level', 'Status', 'Actions'],
            row: ['providerName', 'email', 'telephone', 'category', 'level', 'status']
          }"
          :rows="contracts"
          :rowCom="StatusRow"
          :pagination="{
            currentPage,
            itemsPerPage,
            totalPages,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange
          }"
        >
          <template #row>
            <StatusRow 
              :rowData="contracts"
              :rowKeys="['providerName', 'email', 'telephone', 'category', 'level', 'status']"
              :headKeys="['', 'Provider Name', 'Email', 'Telephone', 'Category', 'Level', 'Status', 'Actions']"
              :onView="viewDetails"
              :onEdit="openEditModal"
              :onActivate="handleActivate"
              :onDeactivate="handleDeactivate"
              :onRowClick="(row) => {}"
            />
          </template>
        </Table>
      </payerContractDataProvider>
    </template>
  </DefaultPage>
</template>
