<script setup>
import { ref, onMounted, computed, toRaw } from 'vue';
import { useRouter } from "vue-router";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import Button from "@/components/Button.vue";
import ModalFormSubmitButton from "@/components/new_form_builder/ModalFormSubmitButton.vue";
import { addToast } from "@/toast";
import { openModal } from "@customizer/modal-x";
import { useApiRequest } from "@/composables/useApiRequest";
import contractRequestStatusRow from "../components/contractRequestStatusRow.vue";
import ActiveInstitutionsDataProvider from "@/features/instution_settings/components/ActiveInstitutionsDataProvider.vue";
import { changeInstitutionStatus } from "@/features/instution_settings/api/institutionSettingsApi";
import { useInstitutions } from "@/features/instution_settings/store/InstitutionsStore";
import { createKenemaContracts } from "../api/contractRequestApi";

const emit = defineEmits(["navigate"]);
const router = useRouter();
const dataProvider = ref();
const store = useInstitutions();
const statusReq = useApiRequest();
const deleteReq = useApiRequest();

// Selection management
const selectedPayers = ref([]);
const allSelected = ref(false);

// Debug mounted hook
onMounted(() => {
  console.log('Parent component mounted');
});

// Refresh data function
function refreshData() {
  console.log("Refreshing institution data");
  if (dataProvider.value) {
    dataProvider.value.refresh();
  }
}

// Handle page change function
function handlePageChange(page) {
  if (dataProvider.value) {
    dataProvider.value.setPage(page);
  }
}

// Handle limit change function
function handleLimitChange(limit) {
  if (dataProvider.value) {
    dataProvider.value.setLimit(limit);
  }
}

// View details function
function viewDetails(institution) {
  router.push(`/institution-settings/payers/${institution.payerUuid}`);
}

// Open edit modal function
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

// Handle institution updated function
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

// Handle status change function
async function handleStatusChange(id, newStatus) {
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

// Computed property to show selected count
const selectedCount = computed(() => {
  return selectedPayers.value.length;
});

// Toggle select all function
function toggleSelectAll() {
  console.log('Toggle Select All triggered');
  allSelected.value = !allSelected.value;
  
  if (allSelected.value && dataProvider.value?.institutions) {
    selectedPayers.value = dataProvider.value.institutions.map(p => p.payerUuid);
  } else {
    selectedPayers.value = [];
  }
}

// Toggle individual selection function
function togglePayerSelection(payerUuid) {
  console.log('Toggling selection for:', payerUuid);
  
  const newSelection = [...selectedPayers.value];
  const index = newSelection.indexOf(payerUuid);
  
  if (index === -1) {
    newSelection.push(payerUuid);
  } else {
    newSelection.splice(index, 1);
  }
  
  selectedPayers.value = newSelection;
  
  // Update "Select All" state
  if (dataProvider.value?.institutions) {
    allSelected.value = newSelection.length === dataProvider.value.institutions.length;
  }
  
  console.log('Current selection:', selectedPayers.value);
}

// Create contracts API call function
async function createContracts() {
  const rawArray = toRaw(selectedPayers.value);
  
  if (rawArray.length === 0) {
    addToast({
      type: "warning",
      title: "No Selection",
      message: "Please select at least one payer to create contracts",
    });
    return;
  }

  try {
    console.log("Creating contracts for:", rawArray);
    const response = await createKenemaContracts(rawArray);
    
    if (response.success) {
      addToast({
        type: "success",
        title: "Contracts Created",
        message: `${rawArray.length} contract(s) created successfully`,
      });
      selectedPayers.value = [];
      allSelected.value = false;
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
  }
}

// Handle add institution function
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
        <ModalFormSubmitButton
          :pending="false"
          :btn-text="`Create Contracts (${selectedCount})`"
          @click="createContracts"
          class="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
          :disabled="selectedCount === 0"
        />
        
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
