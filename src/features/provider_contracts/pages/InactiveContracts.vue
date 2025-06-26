<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import InactiveContractsDataProvider from "../components/InactiveContractsDataProvider.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface";
import { useProviderContracts } from "../store/providerContractStore";
// import { changeProviderContractStatus, deleteProviderContract } from "../api/providerContractApi";
import { addToast } from "@/toast";
import EditContractModal from "../components/EditContractModal.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import StatusRow from "@/components/StatusRow.vue";
import {
  changeProviderContractStatus,
  deleteProviderContract,
} from "../api/providerContractApi";

// Define emits to handle the navigate event
const emit = defineEmits(["navigate"]);

const router = useRouter();
const dataProvider = ref();
const contractsStore = useProviderContracts();
const showEditModal = ref(false);
const selectedContractUuid = ref("");
const selectedContract = ref(null);
const statusReq = useApiRequest();
const deleteReq = useApiRequest();

function refreshData() {
  console.log("Refreshing contract data");
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
  router.push(`/provider-contracts/${id}`);
}

function openEditModal(contract) {
  selectedContract.value = contract;
  selectedContractUuid.value = contract.contractUuid;
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  selectedContractUuid.value = "";
  selectedContract.value = null;
  refreshData();
}

function handleContractUpdated(updatedContract) {
  // Update the contract in the store
  contractsStore.update(updatedContract.contractUuid, updatedContract);
  refreshData();
}

function handleStatusChange(id, newStatus) {
  statusReq.send(
    () => changeProviderContractStatus(id, newStatus),
    (res) => {
      if (res.success) {
        addToast({
          type: "success",
          title: "Status Updated",
          message: `Contract status has been updated to ${newStatus}`,
        });
        refreshData();
      } else {
        addToast({
          type: "error",
          title: "Update Failed",
          message: res.error || "Failed to update contract status",
        });
      }
    }
  );
}

function handleActivate(id) {
  handleStatusChange(id, Status.ACTIVE);
}

function handleDeactivate(id) {
  handleStatusChange(id, Status.SUSPENDED);
}

function handleDelete(id) {
  if (
    confirm(
      "Are you sure you want to delete this contract? This action cannot be undone."
    )
  ) {
    deleteReq.send(
      () => deleteProviderContract(id),
      (res) => {
        if (res.success) {
          addToast({
            type: "success",
            title: "Contract Deleted",
            message: "Contract has been successfully deleted",
          });
          refreshData();
        } else {
          addToast({
            type: "error",
            title: "Delete Failed",
            message: res.error || "Failed to delete contract",
          });
        }
      }
    );
  }
}
</script>

<template>
  <DefaultPage placeholder="Search Inactive Contracts">
    <template #header>
      <div class="flex justify-between items-center">
        <h1>Inactive Provider Contracts</h1>
        <Button @click="refreshData">Refresh</Button>
      </div>
    </template>

    <template #default="{ search }">
      <InactiveContractsDataProvider
        ref="dataProvider"
        :search="search"
        v-slot="{ contracts, pending, currentPage, itemsPerPage, totalPages }"
      >
        <Table
          :pending="pending"
          :headers="{
            head: [
              'Provider Name',
              'Contract Type',
              'Start Date',
              'End Date',
              'Status',
              'Actions',
            ],
            row: [
              'providerName',
              'contractType',
              'startDate',
              'endDate',
              'status',
            ],
          }"
          :rows="contracts"
          :rowCom="StatusRow"
          :pagination="{
            currentPage,
            itemsPerPage,
            totalPages,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange,
          }"
        >
          <!-- Pass the handler functions to the StatusRow component via props -->
          <template #row>
            <StatusRow
              :rowData="contracts"
              :rowKeys="[
                'providerName',
                'contractType',
                'startDate',
                'endDate',
                'status',
              ]"
              :headKeys="[
                'Provider Name',
                'Contract Type',
                'Start Date',
                'End Date',
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
      </InactiveContractsDataProvider>
    </template>
  </DefaultPage>

  <EditContractModal
    v-if="showEditModal"
    :contract="selectedContract"
    :contract-uuid="selectedContractUuid"
    @close="closeEditModal"
    @updated="handleContractUpdated"
  />
</template>
