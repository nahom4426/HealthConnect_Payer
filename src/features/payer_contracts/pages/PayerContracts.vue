<script setup lang="ts">
import { ref, defineEmits } from "vue";
import { useRouter } from 'vue-router';
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import payerContractDataProvider from "../components/payerContractDataProvider.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface";
import { changeProviderStatus, deleteProvider } from "../api/payerContractApi";
import { addToast } from "@/toast";
import { useApiRequest } from "@/composables/useApiRequest";
import StatusRow from "../components/StatusRow.vue";
import { openModal } from "@customizer/modal-x";
import { useProviders } from "../store/payerContractStore";
// Define emits to handle the navigate event
const emit = defineEmits(['navigate']);

const router = useRouter();
const dataProvider = ref();
const providersStore = useProviders();
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
  console.log('Opening edit modal for provider:', provider);
  
  // Make sure we have a valid provider object
  if (!provider || !provider.providerUuid) {
    console.error('Invalid provider data:', provider);
    return;
  }
  
  // Open the modal with the provider data
  openModal('EditProvider', { 
    providerUuid: provider.providerUuid, 
    provider: provider,
    onUpdated: handleProviderUpdated
  });
}

function handleProviderUpdated(updatedProvider: any) {
  console.log('Provider updated:', updatedProvider);
  // Update the provider in the store
  if (updatedProvider && updatedProvider.providerUuid) {
    providersStore.update(updatedProvider.providerUuid, updatedProvider);
    // Refresh the data
    refreshData();
    // Show success toast
    addToast({
      type: 'success',
      title: 'Provider Updated',
      message: `Provider "${updatedProvider.providerName}" has been updated successfully`
    });
  }
}

function handleStatusChange(id: string, newStatus: Status) {
  statusReq.send(
    () => changeProviderStatus(id, newStatus),
    (res) => {
      if (res.success) {
        // Update the provider in the store
        providersStore.update(id, { status: newStatus });
        
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

function handleDelete(id: string) {
  if (confirm('Are you sure you want to delete this provider? This action cannot be undone.')) {
    deleteReq.send(
      () => deleteProvider(id),
      (res) => {
        if (res.success) {
          // Remove the provider from the store
          providersStore.remove(id);
          
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

function handleActivate(id: string) {
  handleStatusChange(id, Status.ACTIVE);
}

function handleDeactivate(id: string) {
  handleStatusChange(id, Status.INACTIVE);
}

function handleAddProvider() {
  // Open the add provider modal
  openModal('AddProvider', {
    onAdded: (newProvider: any) => {
      // Add the new provider to the store
      providersStore.add(newProvider);
      // Refresh the data
      refreshData();
      // Show success toast
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
  <DefaultPage placeholder="Search Active Providers">
    <!-- Header Actions -->
  <template #filter>
      <button class="btn flex justify-center items-center text-center gap-2 mx-4 btn-outline border-[1px] rounded-lg h-14 px-6 text-primary border-primary hover:bg-primary/10">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.5 5H8.33333" stroke="#02676B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2.5 10H10" stroke="#02676B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15.8333 10H17.4999" stroke="#02676B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.6667 5L17.5001 5" stroke="#02676B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M10.8333 15L16.6666 15" stroke="#02676B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2.5 15H5" stroke="#02676B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="6.66667" cy="15" r="1.66667" stroke="#02676B" stroke-width="1.5"/>
<ellipse cx="14.1667" cy="10" rx="1.66667" ry="1.66667" stroke="#02676B" stroke-width="1.5"/>
<ellipse cx="9.99992" cy="4.99999" rx="1.66667" ry="1.66667" stroke="#02676B" stroke-width="1.5"/>
</svg>
 <p class="text-base">Filters</p>
        
      </button>
    </template>

    <!-- Add Button -->
    <template #add-action>
      <Button  @click.prevent="openModal('AddProvider')"  class="btn flex justify-center items-center text-center gap-2 rounded-lg  h-14 px-8 bg-primary text-white hover:bg-primary-dark">
       <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 5.8V12.2M12.2 9H5.8M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
 <p class="text-base">Add Provider</p>
      </Button>
    </template>
    <!-- Content -->
    <template #default="{ search }">
      <payerContractDataProvider 
        ref="dataProvider"
        :search="search" 
        v-slot="{ providers, pending, currentPage, itemsPerPage, totalPages }"
      >
        <Table
          :pending="pending"
          :headers="{
            head: ['', 'Provider Name', 'Email', 'Telephone', 'Category', 'Level', 'Status', 'Actions'],
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
