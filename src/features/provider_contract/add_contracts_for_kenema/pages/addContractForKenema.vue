<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRouter } from "vue-router";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import Button from "@/components/Button.vue";
import { addToast } from "@/toast";
import { openModal } from "@customizer/modal-x";
import { useApiRequest } from "@/composables/useApiRequest";
import contractRequestStatusRow from "../components/contractRequestStatusRow.vue";
import ActiveInstitutionsDataProvider from "@/features/instution_settings/components/ActiveInstitutionsDataProvider.vue";
import { createKenemaContracts } from "../api/contractRequestApi";

const router = useRouter();
const search = ref("");
const dataProvider = ref(null);
const selectedPayers = ref([]);
const allSelected = ref(false);
const isLoading = ref(false); // Explicit loading state

// Computed property for selected count
const selectedCount = computed(() => selectedPayers.value.length);

// Toggle selection for a single payer
function togglePayerSelection(payerUuid) {
  const index = selectedPayers.value.indexOf(payerUuid);
  if (index === -1) {
    selectedPayers.value.push(payerUuid);
    
    // Check if all items are now selected
    if (dataProvider.value && dataProvider.value.institutions) {
      const allPayerUuids = dataProvider.value.institutions
        .map(inst => inst.payerUuid)
        .filter(Boolean);
      
      if (selectedPayers.value.length === allPayerUuids.length) {
        allSelected.value = true;
      }
    }
  } else {
    selectedPayers.value.splice(index, 1);
    allSelected.value = false;
  }
}

// Toggle select all
function toggleSelectAll() {
  if (!dataProvider.value || !dataProvider.value.institutions) return;
  
  const institutions = dataProvider.value.institutions;
  
  if (allSelected.value) {
    // Deselect all
    selectedPayers.value = [];
  } else {
    // Select all
    selectedPayers.value = institutions.map(inst => inst.payerUuid).filter(Boolean);
  }
  
  allSelected.value = !allSelected.value;
}

// Clear all selections
function clearSelections() {
  // Clear the array by setting it to an empty array
  selectedPayers.value = [];
  // Reset the allSelected flag
  allSelected.value = false;
  
  // Force a UI update
  nextTick(() => {
    console.log("Selections cleared:", selectedPayers.value);
  });
}

// Create contracts for selected payers
async function createContracts() {
  if (selectedPayers.value.length === 0) {
    addToast({
      type: "warning",
      title: "No Selection",
      message: "Please select at least one payer to create contracts",
    });
    return;
  }

  try {
    isLoading.value = true; // Set loading state
    
    // Store the selected payers count for the success message
    const selectedCount = selectedPayers.value.length;
    
    const response = await createKenemaContracts(selectedPayers.value);
    
    if (response.success) {
      // Clear selections BEFORE showing the toast
      clearSelections();
      
      addToast({
        type: "success",
        title: "Contracts Created",
        message: `${selectedCount} contract(s) created successfully`,
      });
      
      // Refresh data after clearing selections
      refreshData();
    } else {
      throw new Error(response.error || "Failed to create contracts");
    }
  } catch (error) {
    console.error("Contract creation error:", error);
    addToast({
      type: "error",
      title: "Creation Failed",
      message: error.message || "An error occurred while creating contracts",
    });
  } finally {
    isLoading.value = false; // Clear loading state
  }
}

function refreshData() {
  if (dataProvider.value) {
    dataProvider.value.refresh();
  }
}

function handlePageChange(page) {
  if (dataProvider.value) {
    dataProvider.value.currentPage = page;
  }
}

function handleLimitChange(limit) {
  if (dataProvider.value) {
    dataProvider.value.itemsPerPage = limit;
  }
}

function handleAddInstitution() {
  router.push("/institutions/add");
}

onMounted(() => {
  refreshData();
});
</script>

<template>
  <DefaultPage placeholder="Search Active Institutions">
    <template #filter>
      <button
        class="btn flex justify-center items-center text-center gap-2 mx-4 btn-outline border-[1px] rounded-lg h-14 px-6 text-primary border-primary hover:bg-primary/10"
      >
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

    <template #add-action>
      <div class="flex gap-4">
        <Button
          @click="createContracts"
          :disabled="selectedCount === 0"
          :pending="isLoading"
          class="btn flex justify-center items-center text-center gap-2 rounded-lg h-14 px-8 bg-green-600 text-white hover:bg-green-700"
        >
          <p class="text-base">Create Contracts{{ selectedCount > 0 ? ` (${selectedCount})` : '' }}</p>
        </Button>
        
        <Button
          @click.prevent="handleAddInstitution"
          class="btn flex justify-center items-center text-center gap-2 rounded-lg h-14 px-8 bg-primary text-white hover:bg-primary-dark"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5.8V12.2M12.2 9H5.8M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" 
                  stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p class="text-base">Add Payer</p>
        </Button>
      </div>
    </template>

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
              '', // For the selection checkbox column
              '#',
              'Payer Name',
              'Contracts',
              'Payer Admin User',
              'Contact',
              'Category',
              'Status',
              'Actions',
            ],
            row: [
              'selection',
              'index',
              'payerName',
              'totalContracts',
              'email',
              'telephone',
              'category',
              'status',
            ],
          }"
          :rows="institutions"
          :rowCom="contractRequestStatusRow"
          :row-props="{
            selectedPayers
          }"
          :cells="{
            selection: (_, row) => row.payerUuid,
            index: (_, idx) => idx + 1
          }"
          :pagination="{
            currentPage,
            itemsPerPage,
            totalPages,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange
          }"
          @select-payer="togglePayerSelection"
        >
          <template #header-selection>
            <input
              type="checkbox"
              :checked="allSelected"
              @change="toggleSelectAll"
              class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              @click.stop
            />
          </template>
        </Table>
      </ActiveInstitutionsDataProvider>
    </template>
  </DefaultPage>
</template>
