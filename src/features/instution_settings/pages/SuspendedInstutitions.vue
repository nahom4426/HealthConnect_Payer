<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from 'vue-router';
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import InActiveInstitutionsDataProvider from "../components/InActiveInstitutionsDataProvider.vue";
import Button from "@/components/Button.vue";
import { Status } from "@/types/interface";
import { useInstitutions } from "../store/InstitutionsStore";
import { addToast } from "@/toast";
// import EditInstitutionModal from "../components/EditInstitutionModal.vue";
import StatusRow from "../components/StatusRow.vue";

const router = useRouter();
const dataProvider = ref();
const store = useInstitutions();
const showEditModal = ref(false);
const selectedInstitutionUuid = ref('');
const selectedInstitution = ref(null);

function refreshData() {
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

function viewDetails(institution: any) {
  // Navigate to details page
  router.push(`/institution-settings/institutions/${institution.institutionUuid}`);
}

function handleStatusChange(id: string, newStatus: Status) {
  // Example of using the store to update an item
  store.update(id, { status: newStatus });
  
  // Show toast notification
  addToast({
    type: 'success',
    title: 'Status Updated',
    message: `Institution status has been updated to ${newStatus}`
  });
}

function openEditModal(institution: any) {
  selectedInstitutionUuid.value = institution.institutionUuid;
  selectedInstitution.value = { ...institution };
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  selectedInstitutionUuid.value = '';
  selectedInstitution.value = null;
  // Refresh the data after editing
  refreshData();
}

function handleInstitutionUpdated(updatedInstitution: any) {
  // Update the institution in the store
  store.update(updatedInstitution.institutionUuid, updatedInstitution);
  refreshData();
}

function handleActivate(id: string) {
  handleStatusChange(id, 'Active');
}

function handleDeactivate(id: string) {
  handleStatusChange(id, 'Inactive');
}

function handleEdit(institution: any) {
  openEditModal(institution);
}
</script>

<template>
  <DefaultPage placeholder="Search Inactive Institutions">
    <template #header>
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-semibold">Inactive Institutions</h1>
        <Button type="primary" @click="refreshData" class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </Button>
      </div>
    </template>
    
    <template #default="{ search }">
      <InActiveInstitutionsDataProvider 
        ref="dataProvider"
        :search="search" 
        v-slot="{ institutions, pending, currentPage, itemsPerPage, totalPages }"
      >
        <Table
          :pending="pending"
          :headers="{
            head: ['Institution Name', 'Email', 'TIN Number', 'Contact Phone', 'Location', 'Status', 'Actions'],
            row: ['institutionName', 'email', 'tinNumber', 'contactPersonPhone', 'location', 'status']
          }"
          :rows="institutions"
          :rowCom="StatusRow"
          :cells="{
            location: (_: any, row: any) => `${row.city || ''}, ${row.subCity || ''}, ${row.woreda || ''}, ${row.country || ''}`
          }"
          :pagination="{
            currentPage,
            itemsPerPage,
            totalPages,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange
          }"
          @view="viewDetails"
          @edit="handleEdit"
          @activate="handleActivate"
          @deactivate="handleDeactivate"
        >
        </Table>
      </InActiveInstitutionsDataProvider>
    </template>
  </DefaultPage>
  
  <!-- <EditInstitutionModal 
    v-if="showEditModal && selectedInstitution" 
    :institution-uuid="selectedInstitutionUuid" 
    :institution="selectedInstitution"
    @close="closeEditModal" 
    @updated="handleInstitutionUpdated"
  /> -->
</template>
