<script setup>
import { ref, defineEmits } from "vue";
import { useRouter } from "vue-router";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import PayerContractsDataProvider from "../components/PayerContractsDataProvider.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface";
import { changePayerContractStatus, deletePayerContract } from "../api/payerContractApi";
import { addToast } from "@/toast";
import { useApiRequest } from "@/composables/useApiRequest";
import StatusRow from "../components/contractStatusRow.vue";
import { openModal } from "@customizer/modal-x";
import { payerContracts } from "../store/payerContractStore";
import icons from "@/utils/icons";

const emit = defineEmits(["navigate"]);
const router = useRouter();
const dataProvider = ref();
const payerContractsStore = payerContracts();
const statusReq = useApiRequest();
const deleteReq = useApiRequest();

function refreshData() {
  console.log("Refreshing payer contract data");
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

function viewDetails(contract) {
  if (contract?.contractHeaderUuid) {
    router.push(`/payer-contracts/${contract.contractHeaderUuid}`);
  }
}

function openEditModal(contract) {
  console.log("Opening edit modal for contract:", contract);

  if (!contract || !contract.contractHeaderUuid) {
    console.error("Invalid contract data:", contract);
    return;
  }

  openModal("EditPayerContract", {
    contractHeaderUuid: contract.contractHeaderUuid,
    contract: contract,
    onUpdated: handleContractUpdated,
  });
}

function handleContractUpdated(updatedContract) {
  console.log("Contract updated:", updatedContract);
  if (updatedContract?.contractHeaderUuid) {
    payerContractsStore.update(updatedContract.contractHeaderUuid, updatedContract);
    refreshData();
    addToast({
      type: "success",
      title: "Contract Updated",
      message: `Contract "${updatedContract.contractName}" has been updated successfully`,
    });
  }
}

function handleStatusChange(id, newStatus) {
  statusReq.send(
    () => changePayerContractStatus(id, newStatus),
    (res) => {
      if (res.success) {
        payerContractsStore.update(id, { status: newStatus });
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
  if (confirm("Are you sure you want to delete this contract? This action cannot be undone.")) {
    deleteReq.send(
      () => deletePayerContract(id),
      (res) => {
        if (res.success) {
          payerContractsStore.remove(id);
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

function handleActivate(contract) {
  if (contract?.contractHeaderUuid) {
    handleStatusChange(contract.contractHeaderUuid, Status.ACTIVE);
  }
}

function handleDeactivate(contract) {
  if (contract?.contractHeaderUuid) {
    handleStatusChange(contract.contractHeaderUuid, Status.INACTIVE);
  }
}

function handleAddContract() {
  openModal("AddPayerContract", {
    onAdded: (newContract) => {
      payerContractsStore.add(newContract);
      refreshData();
      addToast({
        type: "success",
        title: "Contract Added",
        message: `Contract "${newContract.contractName}" has been added successfully`,
      });
    },
  });
}
</script>

<template>
  <DefaultPage placeholder="Search Active Contracts">
    <template #filter>
      <button
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 text-primary bg-base-clr3"
      >
        <i v-html="icons.filter"></i>
        <p class="text-base">Filters</p>
      </button>
    </template>

    <!-- <template #add-action>
      <button
        @click.prevent="handleAddContract"
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 bg-primary text-white"
      >
        <i v-html="icons.plus_circle"></i>
        <p class="text-base">Add Contract</p>
      </button>
    </template> -->

    <template #default="{ search }">
      <PayerContractsDataProvider
        ref="dataProvider"
        :search="search"
        v-slot="{ contracts, pending, currentPage, itemsPerPage, totalPages }"
      >
        <Table
          :pending="pending"
          :headers="{
            head: [
              'Contract Name',
              'Contract Number',
              'Payer',
              'Provider',
              'Start Date',
              'End Date',
              'Status',
              'Actions'
            ],
            row: [
              'contractName',
              'contractNumber',
              'payerName',
              'providerName',
              'startDate',
              'endDate',
              'status'
            ]
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
              :rowKeys="[
                'contractName',
                'contractNumber',
                'payerName',
                'providerName',
                'startDate',
                'endDate',
                'status'
              ]"
              :headKeys="[
                'Contract Name',
                'Contract Number',
                'Payer',
                'Provider',
                'Start Date',
                'End Date',
                'Status',
                'Actions'
              ]"
              :onView="viewDetails"
              :onEdit="openEditModal"
              :onActivate="handleActivate"
              :onDeactivate="handleDeactivate"
              :onRowClick="(row) => {}"
            />
          </template>
        </Table>
      </PayerContractsDataProvider>
    </template>
  </DefaultPage>
</template>