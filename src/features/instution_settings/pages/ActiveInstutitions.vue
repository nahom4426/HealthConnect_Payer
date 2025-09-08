<script setup>
import { ref, defineEmits } from "vue";
import { useRouter } from "vue-router";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import ActiveInstitutionsDataProvider from "../components/ActiveInstitutionsDataProvider.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface"; // If this is TypeScript enum, you'll need to replace it or convert to a JS object.
import { addToast } from "@/toast";
import { openModal } from "@customizer/modal-x";
import { useApiRequest } from "@/composables/useApiRequest";
import {
  changeInstitutionStatus,
  deleteInstitutionStatus,
} from "../api/institutionSettingsApi";
import StatusRow from "../components/StatusRow.vue";
import { institutions } from "../store/InstitutionsStore";
import icons from "@/utils/icons";

const emit = defineEmits(["navigate"]);
const router = useRouter();
const dataProvider = ref();
const store = institutions();
const statusReq = useApiRequest();
const deleteReq = useApiRequest();

function refreshData() {
  console.log("Refreshing institution data");
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

function viewDetails(institution) {
  router.push(`/institution-settings/payers/${institution.payerUuid}`);
}

function openEditModal(institution) {
  console.log("Opening edit modal for institution:", institution);

  if (!institution || !institution.institutionUuid) {
    console.error("Invalid institution data:", institution);
    return;
  }

  openModal("EditPayer", {
    payerUuid: institution.payerUuid,
    payer: institution,
    onUpdated: handleInstitutionUpdated,
  });
}

function handleInstitutionUpdated(updatedInstitution) {
  console.log("Institution updated:", updatedInstitution);
  store.update(updatedInstitution.institutionUuid, updatedInstitution);
  refreshData();
  addToast({
    type: "success",
    title: "Institution Updated",
    message: `Institution "${updatedInstitution.institutionName}" has been updated successfully`,
  });
}

function handleStatusChange(id, newStatus) {
  statusReq.send(
    () => changeInstitutionStatus(id, newStatus),
    (res) => {
      if (res.success) {
        store.update(id, { status: newStatus });
        addToast({
          type: "success",
          title: "Status Updated",
          message: `Institution status has been updated to ${newStatus}`,
        });
        refreshData();
      } else {
        addToast({
          type: "error",
          title: "Update Failed",
          message: res.error || "Failed to update institution status",
        });
      }
    }
  );
}

function handleDelete(id) {
  if (
    confirm(
      "Are you sure you want to delete this institution? This action cannot be undone."
    )
  ) {
    deleteReq.send(
      () => deleteInstitutionStatus(id),
      (res) => {
        if (res.success) {
          store.remove(id);
          addToast({
            type: "success",
            title: "Institution Deleted",
            message: "Institution has been successfully deleted",
          });
          refreshData();
        } else {
          addToast({
            type: "error",
            title: "Delete Failed",
            message: res.error || "Failed to delete institution",
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

function handleAddInstitution() {
  openModal("AddPayer", {
    onAdded: (newInstitution) => {
      store.add(newInstitution);
      refreshData();
      addToast({
        type: "success",
        title: "Institution Added",
        message: `Institution "${newInstitution.institutionName}" has been added successfully`,
      });
    },
  });
}

function getBaseUrl() {
  return import.meta.env.VITE_API_URL || "http://localhost:8080/api";
}

function handleImageError(event) {
  event.target.src = "/assets/placeholder-logo.png";
}
</script>

<template>
  <DefaultPage placeholder="Search Active Institutions">
    
    <!-- Filter Button -->
       <!-- <template #filter>
      <button
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 text-primary bg-base-clr3"
      >
        <i v-html="icons.filter"></i>
        <p class="text-base">Filters</p>
      </button>
    </template> -->
    <!-- Add Button -->
    <template #add-action>
       <button
        class="btn flex justify-center items-center text-center gap-2 mx-4 btn-outline border-[1px] rounded-lg h-14 px-6 text-primary border-primary hover:bg-primary/10"
            @click="openModal('payerListImport')"
          >
            <i v-html="icons.add_circle" class=""></i>
            Import Payers
          </button>
      <button
        @click.prevent="handleAddInstitution"
        class="btn flex justify-center items-center text-center gap-2 rounded-lg h-14 px-8 bg-primary text-white hover:bg-primary-dark"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 5.8V12.2M12.2 9H5.8M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
            stroke="white"
            stroke-width="1.3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <p class="text-base">Add Payer</p>
      </button>
     
    </template>

    <!-- Content -->
    <template #default="{ search }">
      <ActiveInstitutionsDataProvider
        ref="dataProvider"
        :search="search"
        v-slot="{
          institutions,
          pending,
          currentPage,
          itemsPerPage,
          totalPages,
        }"
      >
        <Table
          :pending="pending"
          :headers="{
            head: [
              'Payer Name',
              'Contracts',
              'Payer Admin User',
              'Contact',
              'Number of Insured',
              'Status',
              'Actions',
            ],
            row: [
              'payerName',
              'totalContracts',
              'email',
              'telephone',
              'numberOfInsured',
              'status',
            ],
          }"
          :rows="institutions"
          :rowCom="StatusRow"
          :cells="{
            location: (_, row) => `${row.city || ''}, ${row.subCity || ''}, ${row.address1 || ''}, ${row.country || ''}`
          }"
          :pagination="{
            currentPage,
            itemsPerPage,
            totalPages,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange
          }"
        >
          <!-- :pagination="{
            currentPage,
            itemsPerPage,
            totalPages,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange
          }" -->
          <template #row>
            <StatusRow
              :rowData="institutions"
              :rowKeys="[
                'payerName',
                'email',
                'tinNumber',
                'totalContracts',
                'telephone',
                'category',
                'numberOfInsured',
                'status',
              ]"
              :headKeys="[
                '',
                'Institution Name',
                'Email',
                'TIN Number',
                'Contact Phone',
                'Category',
                'Number of Insured',
                'Status',
                'Actions',
              ]"
              :onRowClick="(row) => {}"
            />
          </template>
        </Table>
      </ActiveInstitutionsDataProvider>
    </template>
  </DefaultPage>
</template>
