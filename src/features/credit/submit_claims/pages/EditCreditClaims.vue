<script setup>
import { computed, ref, watch, onMounted } from "vue";
import Table from "@/components/Table.vue";
import Button from "@/components/Button.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import {
  convertBase64Image,
  formatCurrency,
  formatDateToYYMMDD,
} from "@/utils/utils";
import { useRoute } from "vue-router";
import { usePagination } from "@/composables/usePagination";
import DynamicForm from "../../authorization/form/DynamicForm.vue";
import { getAuthorizationDetail } from "../../authorization/api/authorizationApi";
import icons from "@/utils/icons";
import { openModal } from "@customizer/modal-x";
import companyLogo from '@/assets/img/companyLogo.jpeg'
const route = useRoute();
const id = ref(route.params?.id);

const pagination = usePagination({
  cb: (data) => getAuthorizationDetail(route.params?.id),
});

// Get the actual data content from pagination
const contentData = computed(() => {
  return pagination.data?.value || [];
});

// Get first item for summary cards
const firstItem = computed(() => contentData.value[0] || {});

const aboutPayer = computed(() => [
  { title: "payer Name", value: firstItem.value.payerName || "N/A" },
  { title: "catagory", value: firstItem.value.catagory || "N/A" },
  { title: "Contact", value: firstItem.value.payerPhoneNumber || "N/A" },
]);

function toggleDropdown(event, rowId) {
  event.stopPropagation();
  closeAllDropdowns();
  const dropdown = document.getElementById(`dropdown-${rowId}`);
  if (dropdown) dropdown.classList.toggle('hidden');
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(el => el.classList.add('hidden'));
}

const claimSummary = computed(() => [
  { 
    title: "Claim Amount", 
    value: firstItem.value.totalAmount 
      ? formatCurrency(firstItem.value.totalAmount) 
      : "N/A" 
  },
  {
    title: "Medication Items",
    value: firstItem.value.medicationItems?.length || "0",
  },
  { 
    title: "Dispensing Date", 
    value: firstItem.value.dispensingDate 
      ? formatDateToYYMMDD(new Date(firstItem.value.dispensingDate)) 
      : "N/A" 
  },
]);

const profilePicture = computed(() => firstItem.value.payerLogoBase64 || firstItem.value.providerLogoBase64);
async function processProfilePicture() {
  if (!profilePicture.value) return;
  
  try {
    if (profilePicture.value.startsWith("data:image/jpeg")) return;
    profilePicture.value = await convertBase64Image(
      profilePicture.value,
      "image/jpeg",
      0.85
    );
  } catch (error) {
    console.error("Error processing profile picture:", error);
  }
}

watch(profilePicture, () => {
  processProfilePicture();
});

function handleDetailsWithClose(row) {
  closeAllDropdowns();
  handleDetails(row);
}

function handleEditWithClose(row) {
  closeAllDropdowns();
  handleEdit(row);
}

function handleEdit(row) {
  console.log('EditCreditServices modal opened with row:', row)
  if (row.dispensingUuid) {
    openModal('EditCreditServices', {
      dispensingUuid: row.dispensingUuid,
      claim: row,
      onUpdated: (updatedClaim) => {
        claimServicesStore.update(updatedClaim.dispensingUuid, updatedClaim);
        addToast({
          type: 'success',
          title: 'Updated',
          message: 'Claim updated successfully'
        });
      },
      onCancel: () => {
        // Handle cancel if needed
      }
    });
  } else if (typeof props.onEdit === 'function') {
    props.onEdit(row);
  }
}

function handleDetails(row) {
  console.log('DetailsOfCreditServices modal opened with row:', row)
  if (row.dispensingUuid) {
    openModal('DetailsOfCreditServices', {
      dispensingUuid: row.dispensingUuid,
      claim: row,
      onUpdated: (updatedClaim) => {
        claimServicesStore.update(updatedClaim.dispensingUuid, updatedClaim);
        addToast({
          type: 'success',
          title: 'Updated',
          message: 'Claim updated successfully'
        });
      },
      onCancel: () => {
        // Handle cancel if needed
      }
    });
  } else if (typeof props.onEdit === 'function') {
    props.onEdit(row);
  }
}

function openResubmitModal() {
  if (firstItem.value.batchCode) {
    openModal('ResubmitModal', {
      batchCode: firstItem.value.batchCode,
      onSuccess: () => {
        addToast({
          type: 'success',
          title: 'Resubmitted',
          message: 'Claim has been resubmitted successfully'
        });
        pagination.refresh();
      },
      onCancel: () => {
        // Handle cancel if needed
      }
    });
  } else {
    addToast({
      type: 'error',
      title: 'Error',
      message: 'No batch code available for resubmission'
    });
  }
}
</script>

<template>
  <DefaultPage :first="false">
    <template #first>
      <div class="flex flex-col w-full gap-4">
        <!-- Rejection Reason Alert (only shown when status is REJECTED and remark exists) -->
        <div 
          v-if="firstItem.claimStatus === 'REJECTED' && firstItem.remark" 
          class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
        >
          <div class="flex items-center">
            <i v-html="icons.warning" class="mr-2 text-red-500"></i>
            <strong>Rejection Reason:</strong>
            <span class="ml-2">{{ firstItem.remark }}</span>
          </div>
        </div>

        <div class="flex w-full gap-4">
          <!-- Profile Picture (20%) -->
          <div class="w-1/5 bg-base-clr3 rounded-lg p-4 flex flex-col items-center justify-center">
            <img
              v-if="profilePicture"
              :src="profilePicture || companyLogo"
              alt="Profile picture"
              class="w-full h-auto max-h-40 object-contain"
            />
            <div v-else class="text-gray-500 text-center">No logo available</div>
          </div>

          <!-- About Payer (40%) -->
          <div class="w-2/5 bg-base-clr3 rounded-lg p-4">
            <DynamicForm
              header="About Payer"
              customClass="h-full"
              :data="aboutPayer"
            />
          </div>

          <!-- Claim Summary (40%) -->
          <div class="w-2/5 bg-base-clr3 rounded-lg p-4">
            <DynamicForm
              header="Claim Summary"
              customClass="h-full"
              :data="claimSummary"
            />
          </div>
        </div>

      
      </div>
    </template>

    <div class="bg-base-clr3 rounded-md p-4 mt-4">
      <Table
        :pending="pagination.pending.value"
        :rows="contentData"
        :headers="{
          head: [
            'Invoice ID',
            'Patient Name',
            'Dispensing Date',
            'Branch',
            'Credit Amount',
            'Status',
            'Actions',
          ],
          row: [
            'invoiceNumber',
            'insuredName',
            'dispensingDate',
            'branchName',
            'totalAmount',
            'claimStatus'
          ],
        }"
        :cells="{
          dispensingDate: (date) => formatDateToYYMMDD(new Date(date)),
          totalAmount: (amount) => formatCurrency(amount),
          claimStatus: (status) => status?.toUpperCase() || 'N/A'
        }"
      >
        <template #actions="{ row }">
          <div class="dropdown-container relative">
            <button 
              @click.stop="toggleDropdown($event, row.dispensingUuid || row.id)"
              class="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            <div 
              :id="`dropdown-${row.dispensingUuid || row.id}`"
              class="dropdown-menu hidden absolute right-0 z-10 w-44 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              <div class="py-1">
                <button 
                  @click.stop="handleEditWithClose(row)"
                  class="block w-full text-start py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <div class="flex items-start justify-start pl-4 gap-4">
                    <i v-html="icons.edits"/>
                    Edit
                  </div>
                </button>
                <button 
                  @click.stop="handleDetailsWithClose(row)"
                  class="block w-full text-center py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <div class="flex items-center justify-start pl-4 gap-4">
                    <i v-html="icons.details" />
                    Details
                  </div>
                </button>
                
                <!-- Add Resubmit option if status is REJECTED -->
                <!-- <button 
                  v-if="row.claimStatus === 'REJECTED'"
                  @click.stop="handleEditWithClose(row)"
                  class="block w-full text-center py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <div class="flex items-center justify-start pl-4 gap-4">
                    <i v-html="icons.refresh" />
                    Resubmit
                  </div>
                </button> -->
                
                <template v-if="row.status">
                  <button 
                    v-if="row.status === 'INACTIVE' || row.status === 'Inactive'"
                    class="block w-full text-center py-2 text-sm text-[#28A745] hover:bg-gray-100"
                  >
                    <div class="flex items-center justify-start pl-4 gap-4">
                      <i v-html="icons.activate" />
                      Activate
                    </div>
                  </button>
                  
                  <button 
                    v-if="row.status === 'ACTIVE' || row.status === 'Active'"
                    class="block w-full text-center py-2 text-sm text-[#DB2E48] hover:bg-gray-100"
                  >
                    <div class="flex items-center justify-start pl-4 gap-4">
                      <i v-html="icons.deactivate" />
                      Deactivate
                    </div>
                  </button>
                </template>
              </div>
            </div>
          </div>
        </template>
      </Table>
        <!-- Resubmit Button (shown at bottom when status is REJECTED) -->
        <div 
          v-if="firstItem.claimStatus === 'REJECTED'" 
          class="flex justify-end mt-4"
        >
          <Button 
            @click="openModal('ClaimReSubmit', route.params?.id)"
            class="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors shadow-md"
          >
            <div class="flex items-center gap-2">
              <i v-html="icons.refresh"></i>
              Resubmit Claim
            </div>
          </Button>
        </div>
    </div>
  </DefaultPage>
</template>

<style scoped>
.profile-image {
  max-height: 160px;
  object-fit: contain;
}

/* Style for rejection alert */
.rejection-alert {
  border-left: 4px solid #DB2E48;
  background-color: rgba(219, 46, 72, 0.1);
}

/* Animation for resubmit button */
.resubmit-btn {
  transition: all 0.3s ease;
}

.resubmit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>