import { defineStore } from "pinia";
import { ref } from "vue";

export const useFamily = defineStore("familyStore", () => {
  const family = ref([]);

  function set(data) {
    console.log(data);

    family.value = data;
  }

  function getAll() {
    return family.value;
  }

  function remove(id) {
    const idx = family.value.findIndex((el) => el.serviceUuid == id);
    if (idx > -1) {
      family.value.splice(idx, 1);
    }
  }

  function add(data) {
    family.value.unshift(data);
  }

  function update(id, data) {
    const idx = family.value.findIndex((el) => el.serviceUuid == id);
    if (idx > -1) {
      family.value.splice(idx, 1, data);
    }
  }

  return {
    set,
    add,
    remove,
    update,
    getAll,
    family,
  };
});
