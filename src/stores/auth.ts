import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("authStore", () => {
  const auth = ref();

  function setAuth(val: any) {
    auth.value = val;
  }

  return { auth, setAuth };
});
