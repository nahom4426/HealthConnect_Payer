<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import ProfileForm from "../components/ProfileForm.vue";
import SecurityForm from "../components/SecurityForm.vue";
import Button from "@/components/Button.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { updateProfileData } from "../api/profileApi";
import { toasted } from "@/utils/utils";
import { useForm } from "@/components/new_form_builder/useForm";

const auth = useAuthStore();

const profilePicture = ref(auth.auth?.user?.profilePicture || null);
const imageSrc = "/src/assets/img/profile.png";

async function processProfilePicture() {
  if (profilePicture.value && !profilePicture.value.startsWith("data:image/")) {
    profilePicture.value = `data:image/png;base64,${profilePicture.value}`;
  }

  try {
    if (profilePicture.value?.startsWith("data:image/jpeg")) {
      return;
    }

    // profilePicture.value = await convertBase64Image(
    //   profilePicture.value,
    //   "image/jpeg",
    //   0.85
    // );
  } catch (error) {
    console.error("Error processing image:", error);
  }
}

processProfilePicture();

const fileInput = ref(null);

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profilePicture.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};
const active = ref(0);

const setActive = (item) => {
  active.value = item;
};
const components = [
  {
    name: "Profile",
    component: ProfileForm,
  },
  {
    name: "Security",
    component: SecurityForm,
  },
];
const {submit}=useForm('ProfileForm');

const api=useApiRequest();
const authStore=useAuthStore();
function handleUpdateProfile({values}){
  console.log(values);
  
  
  api.send(()=>updateProfileData(authStore.auth?.user?.userUuid,values),res=>{
    if(res.success){

    }
    toasted(res.success,'Profile Updated Successfully',res.error)
  })
}
</script>
<template>
  <div class="max-w-full min-h-full">
    <div class="relative h-screen overflow-hidden">
      <div class="h-56 rounded-2xl bg-primary"></div>
      <div class="flex gap-8 absolute top-28 left-8 right-8">
        <div class="bg-white w-fit h-fit space-y-4 rounded-2xl p-4">
          <img
            :src="profilePicture || imageSrc"
            class="rounded-lg w-[259px] h-[206px] object-cover"
            alt="Profile"
          />

          <!-- Hidden file input -->
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileChange"
          />

          <button
            @click.prevent="triggerFileInput"
            class="flex h-12 gap-4 items-center w-full rounded text-white justify-center font-medium bg-primary hover:bg-primary/80"
            size="xs"
            type="primary"
          >
            Change Photo
          </button>
        </div>
        <div class="bg-white w-full space-y-14 p-6 rounded-2xl">
         <div class=" flex w-full justify-between items-center">
           <div class="flex border border-base-clr rounded w-fit">
            <div
              v-for="(item, index) in components"
              :key="index"
              @click="setActive(index)"
              :class="[
                'px-4 py-3 transition-colors cursor-pointer duration-300',
                active === index
                  ? index === 0
                    ? 'bg-base-clr w-fit text-white rounded-l font-medium'
                    : 'bg-base-clr text-white rounded-r  font-medium'
                  : '',
              ]"
            >
              {{ item.name }}
            </div>
          </div>
          <Button :pending="api.pending.value" @click.prevent="submit(handleUpdateProfile)" class=" bg-[#FFD665]  font-medium leading-5" type="">Edit</Button>
         </div>
          <component
            :search="search"
            :is="components[active].component"
          ></component>
        </div>
      </div>
    </div>
  </div>
</template>
