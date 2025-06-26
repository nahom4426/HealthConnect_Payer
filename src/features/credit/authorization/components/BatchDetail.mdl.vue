<script setup>
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import DynamicForm from "../form/DynamicForm.vue";
import { onMounted, ref } from "vue";
import ServicesTaken from "@/components/ServicesTaken.vue";
import TakenDrugs from "@/components/TakenDrugs.vue";
import { convertBase64Image } from "@/utils/utils";
import { watch } from "vue";

const props = defineProps({
  data: {
    type: Object,
  },
});
const profilePicture = ref("");
async function processProfilePicture() {
  if (!props.data?.profilePicture) {
    profilePicture.value = "";
    return;
  }

  try {
    if (props.data.profilePicture.startsWith("data:image/jpeg")) {
      profilePicture.value = props.data.profilePicture;
      return;
    }

    profilePicture.value = await convertBase64Image(
      props.data.profilePicture,
      "image/jpeg",
      0.85
    );
  } catch (error) {
    console.error("Error processing profile picture:", error);
    profilePicture.value = props.data.profilePicture || "";
  }
}

watch(
  () => props.data?.profilePicture,
  () => {
    processProfilePicture();
  }
);

onMounted(() => {
  processProfilePicture();
});

const aboutPayer = ref([
  { title: "Payer Name", value: "John Doe" },
  { title: "Category", value: "Health Insurance" },
  { title: "Contact", value: "123-456-7890" },
]);

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
</script>

<template>
  <ModalParent>
    <NewFormParent
      class=""
      size="xl"
      title="Credit Service detail"
      subtitle="detail"
    >
      <div class="flex flex-col gap-6">
        <div class="grid grid-cols-2 gap-4 w-full bg-base-clr3">
          <div class="flex-1 flex gap-2">
            <div class="p-2 bg-base-clr3 rounded-lg">
              <img
                v-if="profilePicture"
                :src="profilePicture"
                alt="Profile picture"
                class="profile-image"
              />
              <div v-else class="no-image-placeholder">No profile picture</div>
            </div>
            <DynamicForm :aboutPayer="aboutPayer" />
          </div>
          <DynamicForm :aboutPayer="aboutPayer" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid grid-cols-2 border border-base-clr rounded w-full">
            <div
              v-for="(item, index) in components"
              :key="index"
              @click="setActive(index)"
              :class="[
                'px-4 py-3 transition-colors text-center cursor-pointer duration-300',
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

          <select
            v-model="selectedProvider"
            class="rounded-md bg-white px-4"
            name=""
            id=""
          >
            <option disabled selected value="">Select Provider</option>
            <option
              v-for="data in providers"
              :key="data.providerName"
              :value="data.providerUuid"
            >
              {{ data.providerName }}
            </option>
          </select>
        </div>
        <component
          :data="props.data"
          :id="selectedProvider"
          :search="search"
          :is="components[active].component"
        ></component>
      </div>
    </NewFormParent>
  </ModalParent>
</template>
<style scoped>
.profile-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #eee;
}

.no-image-placeholder {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  border: 2px dashed #ccc;
}
</style>
