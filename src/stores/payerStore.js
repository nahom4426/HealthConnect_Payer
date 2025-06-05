import { defineStore } from "pinia";
import { ref } from "vue";

export const usePayer = defineStore("payerStore", () => {
  const payers = ref([]);

  function set(data) {
    console.log(data);

    payers.value = data;
  }

  function getAll() {
    return payers.value;
  }

  function remove(id) {
    const idx = payers.value.findIndex((el) => el.payerUuid == id);
    if (idx > -1) {
      payers.value.splice(idx, 1);
    }
  }

  function add(privilege) {
    payers.value.unshift(privilege);
  }

  function update(id, data) {
    const idx = payers.value.findIndex((el) => el.payerUuid == id);
    if (idx > -1) {
      payers.value.splice(idx, 1, data);
    }
  }

  return {
    set,
    add,
    remove,
    update,
    getAll,
    payers,
  };
});
