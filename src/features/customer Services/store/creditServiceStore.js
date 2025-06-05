import { defineStore } from "pinia";
import { ref } from "vue";

export const useinsuredMember = defineStore("creditServiceStore", () => {
  const insuredMember = ref([]);

  function set(data) {
    console.log(data);

    insuredMember.value = data;
  }

  function getAll() {
    return insuredMember.value;
  }

  function remove(id) {
    const idx = insuredMember.value.findIndex((el) => el.privilegeUuid == id);
    if (idx > -1) {
      insuredMember.value.splice(idx, 1);
    }
  }

  function add(privilege) {
    insuredMember.value.unshift(privilege);
  }

  function update(id, data) {
    const idx = insuredMember.value.findIndex((el) => el.privilegeUuid == id);
    if (idx > -1) {
      insuredMember.value.splice(idx, 1, data);
    }
  }

  return {
    set,
    add,
    remove,
    update,
    getAll,
    insuredMember,
  };
});
