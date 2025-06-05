<script setup lang="ts">
import { ref, defineEmits } from "vue";
import { useRouter, useRoute } from 'vue-router';
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import ActiveInsuredPersonsDataProvider from "../components/ActiveInsuredPersonsDataProvider.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface";
import { useInsuredPersonsStore } from "../store/insuredPersonsStore";
import { addToast } from "@/toast";
import EditInsuredPersonModal from "../components/EditInsuredPersonModal.vue";
import StatusRow from "../components/InsuredPersonStatusRow.vue";
import { useApiRequest } from '@/composables/useApiRequest';
import { useToast } from "@/toast/store/toast";
import { importInsuredPersons } from "../api/insuredPersonsApi";
import { useAuthStore } from "@/stores/auth";
import { log } from "console";

const emit = defineEmits(['navigate']);
const router = useRouter();
const route = useRoute();
const dataProvider = ref();
const store = useInsuredPersonsStore();
const showEditModal = ref(false);
const selectedInsuredPersonUuid = ref('');
const selectedInsuredPerson = ref(null);
const importReq = useApiRequest();
const auth = useAuthStore();

// Get institution ID from route params or query
const institutionId = ref(
  auth.auth?.payerUuid || 
  route.query.institutionId  // Default value for testing
);

const toast = useToast();
const importProgress = ref(0);
const isImporting = ref(false);

async function handleImport(event: Event) {
  const fileInput = event.target as HTMLInputElement;
  const file = fileInput.files?.[0];
  
  if (!file) {
    toast.error('Please select a file first');
    return;
  }

  // Validate file type
  const validExtensions = ['.xlsx', '.xls', '.csv'];
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!validExtensions.includes(fileExtension)) {
    toast.error('Invalid file type. Please upload an Excel file (.xlsx, .xls) or CSV');
    fileInput.value = '';
    return;
  }

  isImporting.value = true;
  importProgress.value = 0;

  try {
    const response = await importInsuredPersons(file, institutionId.value);

    if (response.success) {
      toast.success(response.message || 'Import completed successfully');
      refreshData();
    } else {
      throw new Error(response.error || 'Import failed');
    }
  } catch (error) {
    let errorMessage = 'Failed to import file';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
    console.error('Import error:', error);
  } finally {
    isImporting.value = false;
    fileInput.value = '';
    importProgress.value = 0;
  }
}

function refreshData() {
  console.log('Refreshing insured persons data');
  if (dataProvider.value) {
    dataProvider.value.refresh();
  }
}

function handlePageChange(page: number) {
  if (dataProvider.value) {
    dataProvider.value.setPage(page);
    refreshData();
  }
}

function handleLimitChange(limit: number) {
  if (dataProvider.value) {
    dataProvider.value.setLimit(limit);
    refreshData();
  }
}


function viewDetails(insuredPersonId: string) {
  console.log('Insured Person ID:', insuredPersonId); // For debugging

  if (insuredPersonId) {
    console.log('Navigating to:', `/insured-persons/${insuredPersonId}`);
    router.push(`/insured-persons/${insuredPersonId}`);
  } else {
    console.error('Unable to find insured person ID', insuredPersonId);
    toast.error('Unable to view details. Invalid insured person ID.');
  }
}
function handleStatusChange(id: string, newStatus: Status) {
  store.update(id, { status: newStatus });
  addToast({
    type: 'success',
    message: `Insured person status has been updated to ${newStatus}`
  });
}

function openEditModal(insuredPerson: any) {
  if (!insuredPerson || !insuredPerson.insuredPersonUuid) {
    console.error('Invalid insured person data:', insuredPerson);
    return;
  }
  
  selectedInsuredPersonUuid.value = insuredPerson.insuredPersonUuid;
  selectedInsuredPerson.value = { ...insuredPerson };
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  selectedInsuredPersonUuid.value = '';
  selectedInsuredPerson.value = null;
  refreshData();
}

function handleInsuredPersonUpdated(updatedInsuredPerson: any) {
  store.update(updatedInsuredPerson.insuredPersonUuid, updatedInsuredPerson);
  refreshData();
}

function handleActivate(id: string) {
  handleStatusChange(id, 'Active');
}

function handleDeactivate(id: string) {
  handleStatusChange(id, 'Inactive');
}

function handleEdit(insuredPerson: any) {
  openEditModal(insuredPerson);
}

function handleAddNew() {
  router.push({
    path: '/insured-persons/create',
    query: { institutionId: institutionId.value }
  });
}
</script>

<template>
  <DefaultPage placeholder="Search Active Insured Persons">
    <template #header>
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">Active Insured Persons</h1>
        <div class="flex gap-2">
          <Button 
            type="secondary" 
            @click="refreshData" 
            class="flex items-center gap-2"
            :disabled="importReq.pending.value"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </Button>
          <Button 
            type="primary" 
            @click="handleAddNew"
            :disabled="importReq.pending.value"
          >
            Add New Insured Person
          </Button>
            
        <label class="relative">
          <Button
            type="primary"
            :disabled="isImporting"
            class="flex items-center gap-2 relative"
          >
            <template v-if="isImporting">
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Importing ({{ importProgress }}%)
            </template>
            <template v-else>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import Excel
            </template>
          </Button>
          <input
            type="file"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".xlsx,.xls,.csv"
            @change="handleImport"
            :disabled="isImporting"
          />
        </label>

        <!-- Progress bar (optional) -->
        <div v-if="isImporting" class="w-32 bg-gray-200 rounded-full h-2.5 ml-2">
          <div
            class="bg-blue-600 h-2.5 rounded-full"
            :style="{ width: `${importProgress}%` }"
          ></div>
        </div>
      </div>
        </div>
  
    </template>
    
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
              :onRowClick="(row) => {}"
            />
          </template>
        </Table>
      </ActiveInsuredPersonsDataProvider>
    </template>
  </DefaultPage>
  
  <EditInsuredPersonModal 
    v-if="showEditModal && selectedInsuredPerson" 
    :insured-person-uuid="selectedInsuredPersonUuid" 
    :insured-person="selectedInsuredPerson"
    @close="closeEditModal" 
    @updated="handleInsuredPersonUpdated"
  />
</template>