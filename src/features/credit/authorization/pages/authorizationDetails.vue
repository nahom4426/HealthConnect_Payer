<script setup>
import { computed, ref, watch } from "vue";
import Table from "@/components/Table.vue";
import Button from "@/components/Button.vue";
import icons from "@/utils/icons";
import DefaultPage from "@/components/DefaultPage.vue";
import AuthorizationBatchDataProvider from "../components/AuthorizationBatchDataProvider.vue";
import Dropdown from "@/components/Dropdown.vue";
import {
  convertBase64Image,
  formatCurrency,
  formatDateToYYMMDD,
} from "@/utils/utils";
import { useRoute } from "vue-router";
import { usePagination } from "@/composables/usePagination";
import AboutPayerForm from "../form/AboutPayerForm.vue";
import { getAuthorizationDetail } from "../api/authorizationApi";
import DynamicForm from "../form/DynamicForm.vue";
import { openModal } from "@customizer/modal-x";
const route = useRoute();
const id = ref(route.params?.id);

const pagination = usePagination({
  cb: (data) => getAuthorizationDetail(route.params?.id),
});
const aboutPayer = computed(() => [
  { title: "Payer Name", value: pagination.data?.value?.payerName || "N/A" },
  { title: "Category", value: pagination.data?.value?.providerName || "N/A" },
  { title: "Contact", value: "123-456-7890" },
]);
const claimSummary = computed(() => [
  { title: "Claim Amount", value: pagination.data?.value?.employeeId || "N/A" },
  {
    title: "Number of claims",
    value: pagination.data?.value?.address || "N/A",
  },
  { title: "Time Range", value: pagination.data?.value?.gender || "N/A" },
]);
const profilePicture = computed(() => pagination.data?.value?.profileLogo);
async function processProfilePicture() {
  if (!profilePicture.value) {
    return;
  }

  try {
    if (profilePicture.value.startsWith("data:image/jpeg")) {
      return;
    }

    profilePicture.value = await convertBase64Image(
      profilePicture.value,
      "image/jpeg",
      0.85
    );
  } catch (error) {}
}

watch(profilePicture, () => {
  processProfilePicture();
});
</script>

<template>
  <DefaultPage :first="false">
    <template #first>
      <div class="grid grid-cols-3 gap-4 w-full">
        <div class="p-2 bg-base-clr3 rounded-lg">
          <img
            v-if="profilePicture"
            :src="profilePicture"
            alt="Profile picture"
            class="profile-image"
          />
          <div v-else class="no-image-placeholder">No profile picture</div>
        </div>
        <DynamicForm
          header="About Payer"
          customClass="bg-base-clr3 "
          :data="aboutPayer"
        />
        <DynamicForm
          header="Claim Summary"
          customClass="bg-base-clr3 ml-4"
          :data="claimSummary"
        />
      </div>
    </template>
    <div class="bg-base-clr3 rounded-md p-4">
      <Table
        :pending="pagination.pending.value"
        :rows="pagination.data?.value"
        :headers="{
          head: [
            'Invoice ID',
            'Patient Name',
            'Encounter Date',
            'Branch',
            'Credit Amount',
            'Status',
            'Actions',
          ],
          row: [
            'batchCode',
            'insuredName',
            'recordedAt',
            'branchName',
            'totalAmount',
            'status',
          ],
        }"
        :cells="{
          requestedOn: (requestedOn) => {
            const date = new Date(requestedOn);
            if (!isNaN(date.getTime())) {
              return formatDateToYYMMDD(date);
            }
          },
          totalAmount: (totalAmount) => {
            return formatCurrency(totalAmount);
          },
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
