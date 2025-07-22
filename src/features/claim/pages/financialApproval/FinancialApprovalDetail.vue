<script setup>
import Button from "@/components/Button.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import Table from "@/components/Table.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import DynamicForm from "@/features/credit/authorization/form/DynamicForm.vue";
import { getClaimByID } from "@/features/credit/track_claim/api/trackClaimApi";
import PriceAndStatusRow from "@/features/credit/track_claim/components/PriceAndStatusRow.vue";

import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import Financial_row from "./components/Financial_row.vue";

const route = useRoute();

const profilePicture = ref("");
const providerInfo = ref([]);
const claimSummary = ref([]);
const api = useApiRequest();
const fetchClaim = () => {
  api.send(
    () => getClaimByID(route.params?.id),
    (res) => {
      if (res.success) {
        profilePicture.value = res.data?.providerLogo;

        providerInfo.value = [
          { title: "Provider Name", value: res.data?.providerName || "N/A" },
          { title: "Category", value: res.data?.providerCategory || "N/A" },
          { title: "Phone", value: res.data?.providerPhone || "N/A" },
          { title: "Email", value: res.data?.providerEmail || "N/A" },
        ];
        claimSummary.value = [
          { title: "Claim Amount", value: res.data?.totalAmount || "N/A" },
          { title: "Number of claims", value: res.data?.totalClaims || "N/A" },
          {
            title: "Time Range",
            value:
              `${res.data?.claimFromDate || ""}   To  ${
                res.data?.claimToDate || ""
              }` || "N/A",
          },
        ];
      }
    }
  );
};

async function processProfilePicture() {
  if (!profilePicture.value) {
    return;
  }

  try {
    if (!profilePicture.value.startsWith("data:image/")) {
      profilePicture.value = `data:image/png;base64,${profilePicture.value}`;
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

onMounted(() => {
  fetchClaim();
});
</script>

<template>
  <DefaultPage :first="false">
    <template #first>
      <div class="grid grid-cols-2 gap-8 w-full">
        <div class="flex-1 gap-4 grid grid-cols-3">
          <div class="p-2 col-span-1 bg-base-clr3 rounded">
            <img
              v-if="profilePicture"
              :src="profilePicture"
              alt="Profile picture"
              class="profile-image"
            />
            <div v-else class="no-image-placeholder">No profile picture</div>
          </div>

          <DynamicForm
            header="About Provider"
            customClass="bg-base-clr3 col-span-2"
            :data="providerInfo"
          />
        </div>
        <DynamicForm
          header="Claim Summary"
          customClass="bg-base-clr3 "
          :data="claimSummary"
        />
      </div>
    </template>
    <div class="bg-base-clr3 rounded-md p-4">
      <Table
        :pending="api.pending.value"
        :rows="api.response.value?.services"
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
            'invoiceNumber',
            'insuredPersonName',
            'encounterDate',
            'branchName',
            'totalAmount',
            'claimStatus',
          ],
        }"
        :row-com="Financial_row"
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
