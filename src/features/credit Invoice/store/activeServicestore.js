import { defineStore } from "pinia";
import { ref } from "vue";

export const useActiveServiceStore = defineStore("activeServiceStore", () => {
  const activeService = ref([]);

  function set(data) {
    console.log(data);

    activeService.value = data;
  }

  function getAll() {
    return activeService.value;
  }

  function remove(id) {
    const idx = activeService.value.findIndex((el) => el.payerUuid == id);
    if (idx > -1) {
      activeService.value.splice(idx, 1);
    }
  }

  function add(privilege) {
    activeService.value.unshift(privilege);
  }

  function update(id, data) {
    const idx = activeService.value.findIndex((el) => el.payerUuid == id);
    if (idx > -1) {
      activeService.value.splice(idx, 1, data);
    }
  }

  return {
    set,
    add,
    remove,
    update,
    getAll,
    activeService,
  };
});
