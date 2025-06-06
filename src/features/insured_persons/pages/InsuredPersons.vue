<script setup lang="ts">
import { ref, defineEmits } from "vue";
import { useRouter } from 'vue-router';
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import ActiveInsuredPersonsDataProvider from "../components/InsuredPersonsDataProvider.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface";

import { useInsuredPersonsStore } from "../store/insuredPersonsStore";
import { importInsuredPersons } from "../api/insuredPersonsApi";
import { useApiRequest } from '@/composables/useApiRequest';
import StatusRow from "../components/InsuredPersonStatusRow.vue";
import { useToast } from "@/toast/store/toast";
import { openModal } from "@customizer/modal-x";
import { addToast } from "@/toast";
import { useAuthStore } from "@/stores/auth";

const emit = defineEmits(['navigate']);
const router = useRouter();
const dataProvider = ref();
const insuredPersonsStore = useInsuredPersonsStore();
const importReq = useApiRequest();
const auth = useAuthStore();
const toast = useToast();
const isImporting = ref(false);
const importProgress = ref(0);

const institutionId = ref(
  auth.auth?.payerUuid || 
  '' // fallback if not available
);

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
  router.push(`/insured-persons/${id}`);
}

function openEditModal(insuredPerson: any) {
  if (!insuredPerson || !insuredPerson.insuredPersonUuid) return;

  openModal('EditInsuredPerson', {
    insuredPersonUuid: insuredPerson.insuredPersonUuid,
    insuredPerson: insuredPerson,
    onUpdated: handleInsuredPersonUpdated
  });
}

function handleInsuredPersonUpdated(updated: any) {
  if (updated && updated.insuredPersonUuid) {
    insuredPersonsStore.update(updated.insuredPersonUuid, updated);
    refreshData();
    addToast({
      type: 'success',
      title: 'Insured Person Updated',
      message: `Insured Person "${updated.fullName}" updated successfully`
    });
  }
}

function handleStatusChange(id: string, newStatus: Status) {
  insuredPersonsStore.update(id, { status: newStatus });
  addToast({
    type: 'success',
    title: 'Status Updated',
    message: `Status updated to ${newStatus}`
  });
  refreshData();
}

function handleActivate(id: string) {
  handleStatusChange(id, Status.ACTIVE);
}

function handleDeactivate(id: string) {
  handleStatusChange(id, Status.INACTIVE);
}

function handleAddInsuredPerson() {
  openModal('AddInsuredPerson', {
    onAdded: (newInsured: any) => {
      insuredPersonsStore.add(newInsured);
      refreshData();
      addToast({
        type: 'success',
        title: 'Insured Person Added',
        message: `"${newInsured.fullName}" has been added`
      });
    }
  });
}

async function handleImport(event: Event) {
  const fileInput = event.target as HTMLInputElement;
  const file = fileInput.files?.[0];

  if (!file) {
    toast.error('Please select a file first');
    return;
  }

  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

  if (!validExtensions.includes(fileExtension)) {
    toast.error('Invalid file type. Upload Excel or CSV');
    fileInput.value = '';
    return;
  }

  isImporting.value = true;
  importProgress.value = 0;

  try {
    const response = await importInsuredPersons(file, institutionId.value);

    if (response.success) {
      toast.success(response.message || 'Import successful');
      refreshData();
    } else {
      throw new Error(response.error || 'Import failed');
    }
  } catch (error) {
    toast.error((error as Error).message);
  } finally {
    isImporting.value = false;
    fileInput.value = '';
    importProgress.value = 0;
  }
}
</script>

<template>
  <DefaultPage placeholder="Search Active Insured Persons">
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
      <Button  @click.prevent="openModal('AddInsured')"  class="btn flex justify-center items-center text-center gap-2 rounded-lg  h-14 px-8 bg-primary text-white hover:bg-primary-dark">
       <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 5.8V12.2M12.2 9H5.8M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
 <p class="text-base">Add Insured Person</p>
      </Button>
    </template>
    <!-- Content -->
     <template #default="{ search }">
      <ActiveInsuredPersonsDataProvider
        ref="dataProvider"
        :search="search"
        :institutionId="institutionId"
        v-slot="{ insuredPersons, pending, currentPage, itemsPerPage, totalPages }"
      >
        <Table
          :pending="pending || importReq.pending.value"
          :headers="{
            head: ['Full Name', 'Gender', 'Phone', 'Insurance ID', 'Address', 'Status', 'Actions'],
            row: ['fullName', 'gender', 'phone', 'insuranceId', 'address', 'status']
          }"
          :rows="insuredPersons"
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
              :rowData="insuredPersons"
              :rowKeys="['fullName', 'gender', 'phone', 'insuranceId', 'address', 'status']"
              :headKeys="['Full Name', 'Gender', 'Phone', 'Insurance ID', 'Address', 'Status', 'Actions']"
              :onView="viewDetails"
              :onEdit="openEditModal"
              :onActivate="handleActivate"
              :onDeactivate="handleDeactivate"
              :onRowClick="() => {}"
            />
          </template>
        </Table>
      </ActiveInsuredPersonsDataProvider>
    </template>
  </DefaultPage>
</template>
