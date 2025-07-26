<script setup>
import { computed, ref, watch } from "vue";
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
// import DynamicForm from "../form/DynamicForm.vue";
import { openModal } from "@customizer/modal-x";
// import { getAuthorizationDetail } from "../api/authorizationApi";
import DynamicForm from "../../authorization/form/DynamicForm.vue";
import { getAuthorizationDetail } from "../../authorization/api/authorizationApi";
import companyLogo from '@/assets/img/companyLogo.jpeg'
import icons from "@/utils/icons";

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
</script>

<template>
  <DefaultPage :first="false">
    <template #first>
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
          <div class="flex gap-2">
            <Button
              @click.prevent="openModal('BatchDetail', row)"
              class="!text-white"
              type="primary"
              size="xs"
            >
              View
            </Button>
          </div>
        </template>
      </Table>
    </div>
  </DefaultPage>
</template>

<style scoped>
.profile-image {
  max-height: 160px;
  object-fit: contain;
}
</style>