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
import { createKenemaContracts } from "../api/contractRequestApi";
import icons from '@/utils/icons';
import KenemaPayersContractsDataProvider from '../components/kenemaPayersContractsDataProvider.vue';

const router = useRouter();
const search = ref("");
const dataProvider = ref(null);
const selectedPayers = ref([]);
const allSelected = ref(false);
const isLoading = ref(false); // Explicit loading state
const showDropdown = ref(false); // For dropdown menu

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

// Toggle dropdown menu
function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

// Close dropdown when clicking outside
function closeDropdown() {
  showDropdown.value = false;
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
      
     router.push('/provider_contracts'); // Redirect to the contracts page
      // Emit events to parent component if needed
      // emit('clear-selection');
      // emit('refresh-data');
      
      // Optionally, refresh data in the data provider
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
  closeDropdown();
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

function handleImportPayers() {
  closeDropdown();
  openModal("payerListImport");
}

onMounted(() => {
  refreshData();
  // Add click event listener to close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-container')) {
      closeDropdown();
    }
  });
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
        <button
          @click="createContracts"
          :disabled="selectedCount === 0"
          :pending="isLoading"
          class="btn flex justify-center items-center text-center gap-2 rounded-lg h-14 px-8 bg-green-600 text-white hover:bg-green-700"
        >
          <p class="text-base">Create Contracts{{ selectedCount > 0 ? ` (${selectedCount})` : '' }}</p>
        </button>
        
        <!-- Dropdown container -->
        <div class="dropdown-container relative">
          <button
            @click.stop="toggleDropdown"
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
            <p class="text-base">Payer Actions</p>
            <svg 
              class="w-4 h-4 ml-1" 
              :class="{ 'transform rotate-180': showDropdown }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          
          <!-- Dropdown menu -->
          <div 
            v-if="showDropdown" 
            class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
          >
            <div class="py-1" role="menu" aria-orientation="vertical">
              <button
                @click="handleAddInstitution"
                class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                role="menuitem"
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
                    stroke="currentColor"
                    stroke-width="1.3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                Add Payer
              </button>
              <button
                @click="handleImportPayers"
                class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                role="menuitem"
              >
                <i v-html="icons.add_circle" class="text-gray-700"></i>
                Import Payers
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #default="{ search }">
      <KenemaPayersContractsDataProvider
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
      <!-- Inside your parent component's template -->
<Table
  :pending="pending"
  :headers="{ 
    head: [ '', 'Payer Name', 'Contracts', 'Payer Admin User', 'Contact', 'Category', 'Status', 'Actions' ],
    row: [ 'selection', 'payerName', 'totalContracts', 'email', 'telephone', 'category', 'status' ]
  }"
  :rows="institutions"
  :rowCom="contractRequestStatusRow"
  :row-props="{ selectedPayers }"
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
  <!-- Header checkbox for select all -->
  <template #header-selection>
    <input
      type="checkbox"
      :checked="allSelected"
      @change="toggleSelectAll"
      @click.stop
      class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
    />
  </template>

  <!-- Row checkbox -->
  <template #cell-selection="{ row }">
    <input
      type="checkbox"
      :checked="selectedPayers.includes(row.payerUuid)"
      @change="() => togglePayerSelection(row.payerUuid)"
      @click.stop
      class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
    />
  </template>
</Table>

      </kenemaPayersContractsDataProvider>
    </template>
  </DefaultPage>
</template>
