<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import PrivilegesDataProvider from "../components/PrivilegesDataProvider.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface";
import { changePrivilegeStatus, deletePrivilege } from "../Api/PrivilegeApi";
import { addToast } from "@/toast";
import { useApiRequest } from "@/composables/useApiRequest";
import StatusRow from "../components/PrivilegeStatusRow.vue";
import { openModal } from "@customizer/modal-x";
import { usePrivilege } from "../store/privilegeStore";
import icons from "@/utils/icons";

const router = useRouter();
const dataProvider = ref();
const privilegeStore = usePrivilege();
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
  router.push(`/privileges/${id}`);
}

function openEditModal(privilege: any) {
  if (!privilege || !privilege.privilegeUuid) {
    console.error("Invalid privilege data:", privilege);
    return;
  }

  openModal("EditPrivilege", {
    privilegeUuid: privilege.privilegeUuid,
    privilege: privilege,
    onUpdated: handlePrivilegeUpdated,
  });
}

function handlePrivilegeUpdated(updatedPrivilege: any) {
  if (updatedPrivilege && updatedPrivilege.privilegeUuid) {
    privilegeStore.update(updatedPrivilege.privilegeUuid, updatedPrivilege);
    refreshData();
    addToast({
      type: "success",
      title: "Privilege Updated",
      message: `Privilege "${updatedPrivilege.privilegeName}" has been updated successfully`,
    });
  }
}

function handleStatusChange(id: string, newStatus: Status) {
  statusReq.send(
    () => changePrivilegeStatus(id, newStatus),
    (res) => {
      if (res.success) {
        privilegeStore.update(id, { status: newStatus });
        addToast({
          type: "success",
          title: "Status Updated",
          message: `Privilege status has been updated to ${newStatus}`,
        });
        refreshData();
      } else {
        addToast({
          type: "error",
          title: "Update Failed",
          message: res.error || "Failed to update privilege status",
        });
      }
    }
  );
}

function handleDelete(id: string) {
  openModal('Confirmation', {
    title: 'Delete Privilege',
    message: 'Are you sure you want to delete this privilege? This action cannot be undone.'
  }, (confirmed) => {
    if (confirmed) {
      deleteReq.send(
        () => deletePrivilege(id),
        (res) => {
          if (res.success) {
            privilegeStore.remove(id);
            addToast({
              type: "success",
              title: "Privilege Deleted",
              message: "Privilege has been successfully deleted",
            });
            refreshData();
          } else {
            addToast({
              type: "error",
              title: "Delete Failed",
              message: res.error || "Failed to delete privilege",
            });
          }
        }
      );
    }
  });
}

function handleActivate(id: string) {
  handleStatusChange(id, Status.ACTIVE);
}

function handleDeactivate(id: string) {
  handleStatusChange(id, Status.INACTIVE);
}

function handleAddPrivilege() {
 const openAddRoleModal = () => {
  router.push('/create-role');
};
}
</script>

<template>
  <DefaultPage placeholder="Search Privileges">
    <template #filter>
      <button
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 text-primary bg-base-clr3"
      >
        <i v-html="icons.filter"></i>
        <p class="text-base">Filters</p>
      </button>
    </template>

    <template #add-action>
      <button class="flex justify-center items-center gap-2 rounded-md px-6 py-4 bg-primary text-white" @click="$router.push('/add_privilege')">
       <i v-html="icons.plus_circle"></i> <p class="text-base">Add Privilege</p>
      </button>
    
    </template>

    <template #default="{ search }">
      <PrivilegesDataProvider
        ref="dataProvider"
        :search="search"
        v-slot="{ privileges, pending, currentPage, itemsPerPage, totalPages }"
      >
        <Table
          :pending="pending"
          :headers="{
            head: [
              'Privilege Name',
              'Description',
              'Category',
              
              'Actions',
            ],
            row: [
              'privilegeName',
              'privilegeDescription',
              'privilegeCategory',
              
            ],
          }"
          :rows="privileges"
          :rowCom="StatusRow"
          :pagination="{
            currentPage,
            itemsPerPage,
            totalPages,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange,
          }"
        >
          <template #row>
            <StatusRow
              :rowData="privileges"
              :rowKeys="[
                'privilegeName',
                'privilegeDescription',
                'privilegeCategory',
                
              ]"
              :headKeys="[
                'Privilege Name',
                'Description',
                'Category',
              
                'Actions',
              ]"
              :onView="viewDetails"
              :onEdit="openEditModal"
              :onActivate="handleActivate"
              :onDeactivate="handleDeactivate"
              :onDelete="handleDelete"
              :onRowClick="(row) => {}"
            />
          </template>
        </Table>
      </PrivilegesDataProvider>
    </template>
  </DefaultPage>
</template>