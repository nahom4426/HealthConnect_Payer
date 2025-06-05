import { defineStore } from "pinia";
import { ref } from "vue";

export const useActivePage = defineStore("activePageStore", () => {
  const activePage = ref("");
  const requested = ref([]);
  const activePayer = ref("");

  function set(data) {
    activePage.value = data;
  }
  function setPayer(data) {
    activePayer.value = data;
  }
  function setRequested(data) {
    requested.value = data;
  }
  function getActivePayer() {
    return activePayer.value;
  }
  function getActivePage() {
    return activePage.value;
  }
  function getrequested() {
    return requested.value;
  }
  function RemoveRequested(id) {
    const idx = requested.value.findIndex((el) => el.claimUuid == id);
    if (idx > -1) {
      requested.value.splice(idx, 1);
    }
  }

  function addRequested(data) {
    requested.value.unshift(data);
  }

  function updateRequested(id, data) {
    const idx = requested.value.findIndex((el) => el.claimUuid == id);
    if (idx > -1) {
      requested.value.splice(idx, 1, data);
    }
  }

  return {
    getActivePayer,
    updateRequested,
    addRequested,
    set,
    getActivePage,
    activePage,
    requested,
    getrequested,
    RemoveRequested,
    setRequested,
    activePayer,
    setPayer,
  };
});
