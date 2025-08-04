import { defineStore } from "pinia";
import { ref } from "vue";

export const useFinancialStore = defineStore("financialClaimStore", () => {
  const financialData = ref([]);

  function set(data) {
    financialData.value = data || [];
  }

  function getAll() {
    return financialData.value;
  }

  function remove(id) {
       console.log(id);
    const idx = financialData.value.findIndex((el) => el.claimUuid == id);
    if (idx > -1) {
      financialData.value.splice(idx, 1);
    }
  }

  function add(data) {
    financialData.value.unshift(data);
  }

  function update(id, data) {
    const idx = financialData.value.findIndex((el) => el.claimUuid == id);
    if (idx > -1) {
      financialData.value.splice(idx, 1, data);
    }
  }

  return {
    set,
    add,
    remove,
    update,
    getAll,
    financialData,
  };
});
