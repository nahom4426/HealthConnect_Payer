<script setup>
import { onMounted, ref } from "vue";
import { convertBase64Image, getAgeFormDate } from "@/utils/utils";
import { watch } from "vue";
import icons from "@/utils/icons";
import { useApiRequest } from "@/composables/useApiRequest";
import StatusCard from "@/components/StatusCard.vue";
import { getInsuredPersonById } from "@/features/insured_persons/api/insuredPersonsApi";
import DynamicForm from "@/features/credit/authorization/form/DynamicForm.vue";
import Spinner from "@/components/Spinner.vue";
import { getClaimByID } from "@/features/credit/track_claim/api/trackClaimApi";
import { useRoute } from "vue-router";
import Button from "@/components/Button.vue";
import { openModal } from "@customizer/modal-x";

const props = defineProps({
  data: {
    type: Object,
  },
});

const profilePicture = ref("");
const personalInfo = ref([]);
const detail = ref([]);
const status = ref("");
const api = useApiRequest();
const route = useRoute();
const fetchInsuredPersonData = () => {
  api.send(
    () => getClaimByID(route.params?.id),
    (res) => {
      if (res.success) {
        profilePicture.value = res.data?.providerLogo;

        personalInfo.value = [
          { title: "Provider Name", value: res.data?.providerName || "N/A" },
          { title: "Category", value: res.data?.position || "N/A" },
          { title: "Contact", value: res.data?.providerPhone || "N/A" },
        ];
        detail.value = [
          { title: "Claim Amount", value: res.data?.totalAmount || "N/A" },
          { title: "Number of claims", value: res.data?.totalClaims || "N/A" },
          { title: "Time Range", value: res.data?.gender || "N/A" },
        ];
      }
    }
  );
};

async function processProfilePicture() {
  if (!profilePicture.value.startsWith("data:image/")) {
    profilePicture.value = `data:image/png;base64,${profilePicture.value}`;
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

onMounted(() => {
  fetchInsuredPersonData();
});

const search = ref("");
</script>

<template>
  <div v-if="!api.pending.value" class="flex flex-col gap-4">
    <div class="grid grid-cols-2 gap-4 p-4 w- rounded-md bg-white">
      <div class="flex gap-2">
        <div class="p-2 bg-base-clr3 rounded">
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
          customClass="bg-base-clr3  w-full"
          :data="personalInfo"
        />
      </div>
      <DynamicForm
        header="Claim Summary"
        customClass="bg-base-clr3 "
        :data="detail"
      />
    </div>
    <div class="flex flex-col gap-5 bg-white rounded-lg px-4 py-6">
      <div class="flex items-center justify-between">
        <p class="font-bold text-base-clr text-base">Claim Audit Summary</p>
        <div class="bg-base-clr3 px-4 py-2 rounded">
          <span class="text-primary">Clinical & Financial Approved </span>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div
          class="flex rounded-md items-center text-base-clr justify-center bg-base-clr3 py-4"
        >
          <p class="px-2 border-r">Total Requested Claim Amount</p>
          <p class="font-bold pl-2 text-base-clr">ETB 1,424</p>
        </div>
        <div
          class="flex rounded-md font-bold items-center text-primary justify-center bg-secondary py-4"
        >
          <p class="px-2 border-r">Total Accepted and payable Claim Amount</p>
          <p class="pl-2">ETB 1,424</p>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-md p-4 flex justify-end gap-4">
      <Button
        @click.prevent="openModal('ClaimPaymentRejection')"
        class="bg-error !text-white"
        >Reject Payment</Button
      >
      <Button
        @click.prevent="openModal('ClaimPayment', api.response.value)"
        type="primary"
        >Make Payment</Button
      >
    </div>
  </div>

  <div class="w-full h-full justify-center items-center" v-else>
    <Spinner />
  </div>
</template>
<style scoped>
.profile-image {
  width: 220px;
  height: 160px;
  object-fit: cover;
}
</style>
