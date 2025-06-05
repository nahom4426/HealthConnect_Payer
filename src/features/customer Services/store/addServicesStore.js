import { defineStore } from "pinia";
import { ref } from "vue";

export const useAddedServices = defineStore("addedServiceStore", () => {
  const addedServices = ref([]);

  function set(data) {
    console.log(data);

    addedServices.value = data;
  }

  function getAll() {
    return addedServices.value;
  }

  function remove(id) {
    const idx = addedServices.value.findIndex((el) => el.privilegeUuid == id);
    if (idx > -1) {
      addedServices.value.splice(idx, 1);
    }
  }

  function add(privilege) {
    addedServices.value.unshift(privilege);
  }

  function update(id, data) {
    const idx = addedServices.value.findIndex((el) => el.privilegeUuid == id);
    if (idx > -1) {
      addedServices.value.splice(idx, 1, data);
    }
  }

  return {
    set,
    add,
    remove,
    update,
    getAll,
    addedServices,
  };
});
