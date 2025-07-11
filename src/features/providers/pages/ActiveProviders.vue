<script setup>
import { ref, defineEmits } from "vue";
import { useRouter } from "vue-router";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import ActiveProvidersDataProvider from "../components/ActiveProvidersDataProvider.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface";

import { changeProviderStatus, deleteProvider } from "../api/providerApi";
import { addToast } from "@/toast";

import { useApiRequest } from "@/composables/useApiRequest";
import providerStatusRow from "../components/providerStatusRow.vue";
import { openModal } from "@customizer/modal-x";
import { useProviders } from "../store/providersStore";
import icons from "@/utils/icons";
// Define emits to handle the navigate event
const emit = defineEmits(["navigate"]);

const router = useRouter();
const dataProvider = ref();
const providersStore = useProviders();
const statusReq = useApiRequest();
const deleteReq = useApiRequest();

function refreshData() {
  console.log("Refreshing provider data");
  if (dataProvider.value) {
    dataProvider.value.refresh();
  }
}

function handlePageChange(page) {
  if (dataProvider.value) {
    dataProvider.value.setPage(page);
  }
}

function handleLimitChange(limit) {
  if (dataProvider.value) {
    dataProvider.value.setLimit(limit);
  }
}

function viewDetails(id) {
  router.push(`/providers/${id}`);
}

function openEditModal(provider) {
  console.log("Opening edit modal for provider:", provider);

  // Make sure we have a valid provider object
  if (!provider || !provider.providerUuid) {
    console.error("Invalid provider data:", provider);
    return;
  }

  // Open the modal with the provider data
  openModal("EditProvider", {
    providerUuid: provider.providerUuid,
    provider: provider,
    onUpdated: handleProviderUpdated,
  });
}

function handleProviderUpdated(updatedProvider) {
  console.log("Provider updated:", updatedProvider);
  // Update the provider in the store
  if (updatedProvider && updatedProvider.providerUuid) {
    providersStore.update(updatedProvider.providerUuid, updatedProvider);
    // Refresh the data
    refreshData();
    // Show success toast
    addToast({
      type: "success",
      title: "Provider Updated",
      message: `Provider "${updatedProvider.providerName}" has been updated successfully`,
    });
  }
}

function handleStatusChange(id, newStatus) {
  statusReq.send(
    () => changeProviderStatus(id, newStatus),
    (res) => {
      if (res.success) {
        // Update the provider in the store
        providersStore.update(id, { status: newStatus });

        addToast({
          type: "success",
          title: "Status Updated",
          message: `Provider status has been updated to ${newStatus}`,
        });
        refreshData();
      } else {
        addToast({
          type: "error",
          title: "Update Failed",
          message: res.error || "Failed to update provider status",
        });
      }
    }
  );
}

function handleDelete(id) {
  if (
    confirm(
      "Are you sure you want to delete this provider? This action cannot be undone."
    )
  ) {
    deleteReq.send(
      () => deleteProvider(id),
      (res) => {
        if (res.success) {
          // Remove the provider from the store
          providersStore.remove(id);

          addToast({
            type: "success",
            title: "Provider Deleted",
            message: "Provider has been successfully deleted",
          });
          refreshData();
        } else {
          addToast({
            type: "error",
            title: "Delete Failed",
            message: res.error || "Failed to delete provider",
          });
        }
      }
    );
  }
}

function handleActivate(id) {
  handleStatusChange(id, Status.ACTIVE);
}

function handleDeactivate(id) {
  handleStatusChange(id, Status.INACTIVE);
}

function handleAddProvider() {
  // Open the add provider modal
  openModal("AddProvider", {
    onAdded: (newProvider) => {
      // Add the new provider to the store
      providersStore.add(newProvider);
      // Refresh the data
      refreshData();
      // Show success toast
      addToast({
        type: "success",
        title: "Provider Added",
        message: `Provider "${newProvider.providerName}" has been added successfully`,
      });
    },
  });
}
</script>

<template>
  <DefaultPage placeholder="Search Active Providers">
    <template #filter>
      <button
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 text-primary bg-base-clr3"
      >
        <i v-html="icons.filter"></i>
        <p class="text-base">Filters</p>
      </button>
    </template>

    <template #add-action>
      <button
        @click.prevent="openModal('AddProvider')"
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 bg-primary text-white"
      >
        <i v-html="icons.plus_circle"></i>
        <p class="text-base">Add Provider</p>
      </button>
    </template>
    <template #default="{ search }">
      <ActiveProvidersDataProvider
        ref="dataProvider"
        :search="search"
        v-slot="{ providers, pending }"
      >
        <Table
          :pending="pending"
          :headers="{
            head: [
              'Provider Name',
              'Contact Person',
              'Contact',
              'Category',
              'Level',
              'Status',
              'Actions',
            ],
            row: [
              'providerName',
              'email',
              'telephone',
              'category',
              'level',
              'status',
            ],
          }"
          :rows="providers"
          :rowCom="providerStatusRow"
          :pagination="{
            currentPage,
            itemsPerPage,
            totalPages,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange,
          }"
        >
          <template #row>
            <providerStatusRow
              :rowData="providers"
              :rowKeys="[
                'providerName',
                'email',
                'telephone',
                'category',
                'level',
                'status',
              ]"
              :headKeys="[
                '',
                'Provider Name',
                'Email',
                'Telephone',
                'Category',
                'Level',
                'Status',
                'Actions',
              ]"
              :onView="viewDetails"
              :onEdit="openEditModal"
              :onActivate="handleActivate"
              :onDeactivate="handleDeactivate"
              :onRowClick="(row) => {}"
            />
          </template>
        </Table>
      </ActiveProvidersDataProvider>
    </template>
  </DefaultPage>
</template>
