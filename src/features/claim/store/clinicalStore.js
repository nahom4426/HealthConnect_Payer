import { defineStore } from "pinia";
import { ref } from "vue";

export const useClinical = defineStore("claimStore", () => {
  const clinicalClaim = ref([]);

  function set(data) {
    clinicalClaim.value = data || [];
  }

  function getAll() {
    return clinicalClaim.value;
  }

  function remove(id) {
    const idx = clinicalClaim.value.findIndex((el) => el.dispensingUuid == id);
    if (idx > -1) {
      clinicalClaim.value.splice(idx, 1);
    }
  }

  function add(data) {
    clinicalClaim.value.unshift(data);
  }

  function update(id, data) {
    const idx = clinicalClaim.value.findIndex((el) => el.dispensingUuid == id);
    if (idx > -1) {
      clinicalClaim.value.splice(idx, 1, data);
    }
  }
     function updateStatus(id, claimStatus) {
    const idx = clinicalClaim.value.findIndex((el) => el.dispensingUuid == id);
    if (idx == -1) return;

    clinicalClaim.value[idx].claimStatus = claimStatus;
  }

  return {
    set,
    add,
    remove,
    update,
    updateStatus,
    getAll,
    clinicalClaim,
  };
});
