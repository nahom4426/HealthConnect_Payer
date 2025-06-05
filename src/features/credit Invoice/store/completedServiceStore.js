import { defineStore } from "pinia";
import { ref } from "vue";

export const useCompletedService = defineStore("completedServiceStore", () => {
  const completedService = ref([]);

  function set(data) {
    console.log(data);

    completedService.value = data;
  }

  function getAll() {
    return completedService.value;
  }

  function remove(id) {
    const idx = completedService.value.findIndex((el) => el.claimUuid == id);
    if (idx > -1) {
      completedService.value.splice(idx, 1);
    }
  }

  function add(data) {
    completedService.value.unshift(data);
  }

  function update(id, data) {
    const idx = completedService.value.findIndex((el) => el.claimUuid == id);
    if (idx > -1) {
      completedService.value.splice(idx, 1, data);
    }
  }

  return {
    set,
    add,
    remove,
    update,
    getAll,
    completedService,
  };
});
