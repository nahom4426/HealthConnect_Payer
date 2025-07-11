import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("authStore", () => {
  const auth = ref();
  const imageData	= ref('')

  function setAuth(val: any) {
    auth.value = val;
  }
  function setProfile(val: any) {
    console.log(imageData.value, val);
    
    imageData.value = val;
  }

  return { auth, setAuth ,setProfile,imageData	};
});
