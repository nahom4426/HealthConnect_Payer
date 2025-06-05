import { defineStore } from "pinia";
import { ref } from "vue";

export const useCoverage = defineStore("coveragestore", () => {
  const coverage = ref([]);

  function set(data) {
    console.log(data);

    coverage.value = data;
  }

  function getAll() {
    return coverage.value;
  }

  function remove(id) {
    const idx = coverage.value.findIndex((el) => el.privilegeUuid == id);
    if (idx > -1) {
      coverage.value.splice(idx, 1);
    }
  }

  function add(privilege) {
    coverage.value.unshift(privilege);
  }

  function update(id, data) {
    const idx = coverage.value.findIndex((el) => el.privilegeUuid == id);
    if (idx > -1) {
      coverage.value.splice(idx, 1, data);
    }
  }

  return {
    set,
    add,
    remove,
    update,
    getAll,
    coverage,
  };
});
