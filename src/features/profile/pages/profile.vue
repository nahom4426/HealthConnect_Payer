<script setup>
import { ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import ProfileForm from "../components/ProfileForm.vue";
import SecurityForm from "../components/SecurityForm.vue";
import Button from "@/components/Button.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { updateProfileData, uploadProfilePicture } from "../api/profileApi";
import { convertBase64Image, toasted } from "@/utils/utils";
import { useForm } from "@/components/new_form_builder/useForm";
import icons from "@/utils/icons";
import imageSrc from '@/assets/img/profile.png'

const auth = useAuthStore();

const profilePicture = ref(auth.auth?.user?.imageData || null);

async function processProfilePicture() {
  if (profilePicture.value && !profilePicture.value.startsWith("data:image/")) {
    profilePicture.value = `data:image/png;base64,${profilePicture.value}`;
    return
  }

}

processProfilePicture();

const fileInput = ref(null);
const api=useApiRequest()
const profileApi=useApiRequest()
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toasted(false, "Please select a valid image file.");
    return;
  }

  const formData = new FormData();
  formData.append("profilePicture", file);

  const reader = new FileReader();

  reader.onload = (e) => {
    const base64Image = e.target.result;

    profileApi.send(
      () => uploadProfilePicture(formData),
      (res) => {
        if (res.success) {
          profilePicture.value = base64Image;
          authStore.setProfile(base64Image);

          localStorage.setItem(
            "userDetail",
            JSON.stringify({...(authStore.auth?.user || {})})
          );

          toasted(true, "Profile picture updated successfully!");
        } else {
          toasted(false, res.error || "Failed to update profile picture.");
        }
      }
    );
  };

  reader.onerror = () => {
    toasted(false, "Error reading image file.");
  };

  reader.readAsDataURL(file); // Trigger FileReader to get base64
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

const authStore=useAuthStore();
function handleUpdateProfile({values}){
  
  
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
          <i v-if="profileApi.pending.value" v-html="icons.spinner"/>
          <p v-else>Change Photo</p>
            
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
          <Button v-if="active===0" :pending="api.pending.value" @click.prevent="submit(handleUpdateProfile)" class=" bg-[#FFD665]  font-medium leading-5" type="">Edit</Button>
         </div>
          <component
            :is="components[active].component"
          ></component>
        </div>
      </div>
    </div>
  </div>
</template>
