<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from 'vue-router';
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import InactiveProvidersDataProvider from "../components/InactiveProvidersDataProvider.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface";
import { useProviders } from "../store/payerContractStore";
import { changeProviderStatus, deleteProvider } from "../api/payerContractApi";
import { addToast } from "@/toast";
import EditProviderModal from "../components/EditProviderModal.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import StatusRow from "@/components/StatusRow.vue";

// Define emits to handle the navigate event
const emit = defineEmits(['navigate']);

const router = useRouter();
const dataProvider = ref();
const store = useProviders();
const showEditModal = ref(false);
const selectedProviderUuid = ref('');
const selectedProvider = ref(null);
const statusReq = useApiRequest();
const deleteReq = useApiRequest();

function refreshData() {
  console.log('Refreshing provider data');
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
  router.push(`/providers/${id}`);
}

function openEditModal(provider: any) {
  selectedProvider.value = provider;
  selectedProviderUuid.value = provider.providerUuid;
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  selectedProviderUuid.value = '';
  selectedProvider.value = null;
}

function handleProviderUpdated(updatedProvider: any) {
  // Update the provider in the store
  store.update(updatedProvider.providerUuid, updatedProvider);
  refreshData();
}

function handleStatusChange(id: string, newStatus: Status) {
  statusReq.send(
    () => changeProviderStatus(id, newStatus),
    (res) => {
      if (res.success) {
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
  handleStatusChange(id, 'ACTIVE');
}

function handleDeactivate(id: string) {
  handleStatusChange(id, 'INACTIVE');
}

function handleDelete(id: string) {
  if (confirm('Are you sure you want to delete this provider? This action cannot be undone.')) {
    deleteReq.send(
      () => deleteProvider(id),
      (res) => {
        if (res.success) {
          addToast({
            type: 'success',
            title: 'Provider Deleted',
            message: 'Provider has been successfully deleted'
          });
          refreshData();
        } else {
          addToast({
            type: 'error',
            title: 'Delete Failed',
            message: res.error || 'Failed to delete provider'
          });
        }
      }
    );
  }
}
</script>

<template>
  <DefaultPage placeholder="Search Inactive Providers">
    <template #header>
      <div class="flex justify-between items-center">
        <h1>Inactive Providers</h1>
        <Button @click="refreshData">Refresh</Button>
      </div>
    </template>
    
    <template #default="{ search }">
      <InactiveProvidersDataProvider 
        ref="dataProvider"
        :search="search" 
        v-slot="{ providers, pending, currentPage, itemsPerPage, totalPages }"
      >
        <Table
          :pending="pending"
          :headers="{
            head: ['Provider Name', 'Email', 'Telephone', 'Category', 'Level', 'Status', 'Actions'],
            row: ['providerName', 'email', 'telephone', 'category', 'level', 'status']
          }"
          :rows="providers"
          :rowCom="StatusRow"
          :pagination="{
            currentPage,
            itemsPerPage,
            totalPages,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange
          }"
        >
          <!-- Pass the handler functions to the StatusRow component via props -->
          <template #row>
            <StatusRow 
              :rowData="providers" 
              :rowKeys="['providerName', 'email', 'telephone', 'category', 'level', 'status']" 
              :headKeys="['Provider Name', 'Email', 'Telephone', 'Category', 'Level', 'Status', 'Actions']"
              :onView="viewDetails"
              :onEdit="openEditModal"
              :onActivate="handleActivate"
              :onDeactivate="handleDeactivate"
              :onRowClick="(row) => {}"
            />
          </template>
        </Table>
      </InactiveProvidersDataProvider>
    </template>
  </DefaultPage>
  
  <EditProviderModal 
    v-if="showEditModal" 
    :provider="selectedProvider" 
    :provider-uuid="selectedProviderUuid" 
    @close="closeEditModal" 
    @updated="handleProviderUpdated"
  />
</template>
