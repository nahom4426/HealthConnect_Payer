import { defineStore } from "pinia";
import { ref } from "vue";

export const useFinancialDetailStore = defineStore(
  "financialDetailStore",
  () => {
    const financialDetail = ref([]);

    function set(data) {
      financialDetail.value = data || [];
    }

    function getAll() {
      return financialDetail.value;
    }

    function remove(id) {
      const idx = financialDetail.value.findIndex(
        (el) => el.dispensingUuid == id
      );
      if (idx > -1) {
        financialDetail.value.splice(idx, 1);
      }
    }

    function add(data) {
      financialDetail.value.unshift(data);
    }

    function update(id, data) {
      const idx = financialDetail.value.findIndex(
        (el) => el.dispensingUuid == id
      );
      if (idx > -1) {
        financialDetail.value.splice(idx, 1, data);
      }
    }

    return {
      set,
      add,
      remove,
      update,
      getAll,
      financialDetail,
    };
  }
);
