<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import ActiveContractsDataProvider from "../components/ActiveContractsDataProvider.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface";
import { useProviderContracts } from "../store/providerContractStore";
import { addToast } from "@/toast";
import EditContract from "../components/EditContract.mdl.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import StatusRow from "@/components/StatusRow.vue";
import {
  deleteProviderContract,
  changeProviderContractStatus,
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
  console.log("Opening edit modal for contract:", contract);

  // Make sure we have a valid contract object
  if (!contract || !contract.contractUuid) {
    console.error("Invalid contract data:", contract);
    return;
  }

  // Set the selected contract data
  selectedContractUuid.value = contract.contractUuid;
  selectedContract.value = { ...contract };

  // Show the modal
  showEditModal.value = true;
}

function closeEditModal() {
  console.log("Closing edit modal");
  showEditModal.value = false;
  selectedContractUuid.value = "";
  selectedContract.value = null;
  // Refresh the data after editing
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

function handleActivate(id) {
  handleStatusChange(id, Status.ACTIVE);
}

function handleDeactivate(id) {
  handleStatusChange(id, Status.SUSPENDED);
}
</script>

<template>
  <DefaultPage placeholder="Search Active Contracts">
    <template #header>
      <div class="flex justify-between items-center">
        <h1>Active Provider Contracts</h1>
        <div class="flex space-x-2">
          <Button @click="refreshData">Refresh</Button>
          <Button to="/provider-contracts/new">Add New Contract</Button>
        </div>
      </div>
    </template>

    <template #default="{ search }">
      <ActiveContractsDataProvider
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
        >
        </Table>
      </ActiveContractsDataProvider>
    </template>
  </DefaultPage>

  <EditContract
    v-if="showEditModal && selectedContract"
    :contract-uuid="selectedContractUuid"
    :contract="selectedContract"
    @close="closeEditModal"
    @updated="handleContractUpdated"
  />
</template>
