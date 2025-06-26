import { defineStore } from "pinia";
import { ref } from "vue";

export const useSubmittedClaimStore = defineStore("submittedClaimStore", () => {
  const submittedClaims = ref([]);

  function set(data) {
    submittedClaims.value = data || [];
  }

  function getAll() {
    return submittedClaims.value;
  }

  function remove(id) {
    const idx = submittedClaims.value.findIndex((el) => el.serviceUuid == id);
    if (idx > -1) {
      submittedClaims.value.splice(idx, 1);
    }
  }

  function add(data) {
    submittedClaims.value.unshift(data);
  }

  function update(id, data) {
    const idx = submittedClaims.value.findIndex((el) => el.serviceUuid == id);
    if (idx > -1) {
      submittedClaims.value.splice(idx, 1, data);
    }
  }

  return {
    set,
    add,
    remove,
    update,
    getAll,
    submittedClaims,
  };
});
