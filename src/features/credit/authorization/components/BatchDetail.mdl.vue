<script setup>
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import DynamicForm from "../form/DynamicForm.vue";
import { onMounted, ref } from "vue";
import ServicesTaken from "@/components/ServicesTaken.vue";
import TakenDrugs from "@/components/TakenDrugs.vue";
import { convertBase64Image, getAgeFormDate } from "@/utils/utils";
import { watch } from "vue";
import icons from "@/utils/icons";
import { useApiRequest } from "@/composables/useApiRequest";
import { getInsuredPersonById } from "../api/authorizationApi";
import StatusCard from "@/components/StatusCard.vue";
import Spinner from "@/components/Spinner.vue";

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

const fetchInsuredPersonData = () => {
  api.send(
    () => getInsuredPersonById(props.data?.insuredUuid),
    (res) => {
      if (res.success) {
        profilePicture.value = res.data?.profilePictureBase64;

        personalInfo.value = [
          { title: "Full Name", value: props.data?.payerName || "N/A" },
          { title: "Role", value: res.data?.position || "N/A" },
          { title: "Phone", value: res.data?.phone || "N/A" },
          { title: "Email", value: res.data?.email || "N/A" },
        ];
        detail.value = [
          { title: "Employee ID", value: res.data?.employeeId || "N/A" },
          { title: "Address", value: res.data?.address || "N/A" },
          { title: "Gender", value: res.data?.gender || "N/A" },
          { title: "Age", value: getAgeFormDate(res.data?.birthDate) || "N/A" },
        ];
        status.value = res.data?.status;
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

const active = ref(0);

const setActive = (item) => {
  active.value = item;
};
const components = [
  {
    name: "Services",
    component: ServicesTaken,
  },
  {
    name: "Drugs",
    component: TakenDrugs,
  },
];
const search = ref("");
</script>

<template>
  <ModalParent>
    <NewFormParent
      class=""
      size="xs"
      title="Credit Service detail"
      subtitle="detail"
    >
      <div v-if="!api.pending.value" class="flex flex-col gap-6">
        <div class="grid grid-cols-7 gap-4 p-4 w-full rounded-md bg-base-clr3">
          <div class="flex-1 col-span-1 flex gap-2">
            <div class="p-2 bg-base-clr3 rounded">
              <img
                v-if="profilePicture"
                :src="profilePicture"
                alt="Profile picture"
                class="profile-image"
              />
              <div v-else class="no-image-placeholder">No profile picture</div>
            </div>
          </div>
          <DynamicForm customClass="bg-white col-span-2" :data="personalInfo" />

          <DynamicForm customClass="bg-white col-span-2" :data="detail" />
          <StatusCard
            customClass="bg-white col-span-2"
            :status="status"
            :id="props.data?.employeeId"
          />
        </div>
        <div class="flex flex-col gap-4 bg-base-clr3 rounded-md w-full p-4">
          <div class="grid grid-cols-4 gap-4">
            <div
              class="grid grid-cols-2 col-span-1 border border-base-clr rounded w-full"
            >
              <div
                v-for="(item, index) in components"
                :key="index"
                @click="setActive(index)"
                :class="[
                  ' py-3 transition-colors text-center cursor-pointer duration-300',
                  active === index
                    ? index === 0
                      ? 'bg-base-clr  text-white rounded-l font-medium'
                      : 'bg-base-clr text-white rounded-r  font-medium'
                    : '',
                ]"
              >
                {{ item.name }}
              </div>
            </div>

            <div
              tabindex="0"
              class="w-full col-span-3 md:m bg-white focus-within:border-primary flex items-center rounded-lg overflow-hidden"
            >
              <span
                class="w-10 h-full text-base-clr grid place-items-center"
                v-html="icons.search"
              />
              <input
                v-model="search"
                :placeholder="active === 0 ? 'Search Services' : 'Search Drugs'"
                class="flex-1 bg-transparent px- py-2 h-full outline-none"
              />
            </div>
          </div>
          <component
            :data="props.data"
            :search="search"
            :is="components[active].component"
          ></component>
        </div>
      </div>
      <div class="w-full h-full justify-center items-center" v-else>
        <Spinner />
      </div>
    </NewFormParent>
  </ModalParent>
</template>
<style scoped>
.profile-image {
  width: 173px;
  height: 160px;
  object-fit: cover;
}
</style>
