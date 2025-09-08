<script setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRouter } from "vue-router";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import Button from "@/components/Button.vue";
import { addToast } from "@/toast";
import { openModal } from "@customizer/modal-x";
import { useApiRequest } from "@/composables/useApiRequest";
import { createKenemaContracts } from "../api/contractRequestApi";
import icons from '@/utils/icons';
import KenemaPayersContractsDataProvider from '../components/kenemaPayersContractsDataProvider.vue';

const router = useRouter();
const search = ref("");
const dataProvider = ref(null);
const selectedPayers = ref([]);
const isSelected = ref(false);
const isLoading = ref(false);
const showDropdown = ref(false);

// Computed property for selected count
const selectedCount = computed(() => selectedPayers.value.length);

function handleSelectAll(checked, data = []) {
  if (checked) {
    selectedPayers.value = [];
    data.forEach((el) => {
      if (el?.payerUuid) {
        selectedPayers.value.push(el.payerUuid);
      }
    });
    isSelected.value = true;
  } else {
    isSelected.value = false;
    selectedPayers.value = [];
  }
}

function selectPayer(id, data = []) {
  const idx = selectedPayers.value.findIndex((el) => el == id);
  if (idx > -1) {
    selectedPayers.value = selectedPayers.value.filter((el) => el != id);
    isSelected.value = false;
  } else {
    selectedPayers.value.push(id);
    if (selectedPayers.value.length === data.length) {
      isSelected.value = true;
    }
  }
}

// Toggle dropdown menu
// function toggleDropdown() {
//   showDropdown.value = !showDropdown.value;
// }

// Close dropdown when clicking outside
function closeDropdown() {
  showDropdown.value = false;
}

// Clear all selections
function clearSelections() {
  selectedPayers.value = [];
  isSelected.value = false;
  
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
    isLoading.value = true;
    
    const selectedCount = selectedPayers.value.length;
    
    const response = await createKenemaContracts(selectedPayers.value);
    
    if (response.success) {
      clearSelections();
      
      addToast({
        type: "success",
        title: "Contracts Created",
        message: `${selectedCount} contract(s) created successfully`,
      });
      
      router.push('/provider_contracts');
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
    isLoading.value = false;
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
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-container')) {
      closeAllDropdowns();
    }
  });
});
function toggleDropdown(event, rowId) {
  event.stopPropagation();
  closeAllDropdowns();
  const dropdown = document.getElementById(`dropdown-${rowId}`);
  if (dropdown) dropdown.classList.toggle('hidden');
}
function handleEdit(row) {
  openModal('EditPayer', {
    payerUuid: row.payerUuid,
    payer: row,
    onUpdated: (updatedPayer) => {
      payersStore.update(updatedPayer.payerUuid, updatedPayer);
    }
  });
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(el => el.classList.add('hidden'));
}
async function handleCreateContracts(payerUuids) {
  closeAllDropdowns();
  const uuids = Array.isArray(payerUuids) ? payerUuids : [payerUuids];
  if (uuids.length === 0) {
    addToast({ type: "warning", title: "No Selection", message: "Please select at least one payer to create contracts" });
    return;
  }
  try {
    const response = await createKenemaContracts(uuids);
    if (response.success) {
      addToast({ type: "success", title: "Contracts Created", message: `${uuids.length} contract(s) created successfully` });
      router.push('/provider_contracts');
      emit('clear-selection');
      emit('refresh-data');
    } else throw new Error(response.error || "Failed to create contracts");
  } catch (error) {
    addToast({ type: "error", title: "Creation Failed", message: error.message });
  }
}
</script>

<template>
  <DefaultPage placeholder="Search Active Institutions">
    <!-- <template #filter>
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
    </template> -->

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
        <div class="flex flex-col gap-4 bg-white p-3">
          <div class="flex w-full justify-between items-center">
            <h1 class="text-base-clr">
              Selected Payers ({{ selectedPayers.length }})
            </h1>
          </div>
          
          <Table
            :firstCol="true"
            :pending="pending"
            :rows="institutions"
            :headers="{
              head: [
                'Payer Name',
                'Contracts',
                'Payer Admin User',
                'Contact',
                'Category',
                'Status',
                'actions',
              ],
              row: ['payerName', 'totalContracts', 'email', 'telephone', 'category', 'status'],
            }"
          >
            <template #headerFirst="{ row }">
              <Button>
                <input
                  :checked="isSelected"
                  @change="
                    handleSelectAll($event.target.checked, institutions)
                  "
                  class="size-4 "
                  type="checkbox"
                />
              </Button>
            </template>
            <template #select="{ row }">
              <Button>
                <input
                  type="checkbox"
                  :checked="selectedPayers.includes(row?.payerUuid)"
                  @change="selectPayer(row?.payerUuid, institutions)"
                  class="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </Button>
            </template>
            <template #actions="{ row }">
               <div class="dropdown-container relative">
          <button 
            @click.stop="toggleDropdown($event, row.payerUuid || row.id)"
            class="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          <div 
            :id="`dropdown-${row.payerUuid || row.id}`"
            class="dropdown-menu hidden absolute right-0 z-10 w-44 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
          >
            <div class="py-1" role="none">
              <button 
                @click.stop="handleEdit(row)"
                class="block w-full text-left py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div class="flex items-center justify-start pl-4 gap-4">
                  <i v-html="icons.edits" />
                  Edit
                </div>
              </button>
              <button 
                @click.stop="handleCreateContracts(row.payerUuid)"
                class="block w-full text-left py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div class="flex items-center justify-start pl-4 gap-4">
                  <i v-html="icons.edits" />
                  Create Contract
                </div>
              </button>
            </div>
          </div>
        </div>
            </template>
          </Table>
        </div>
      </KenemaPayersContractsDataProvider>
    </template>
  </DefaultPage>
</template>
