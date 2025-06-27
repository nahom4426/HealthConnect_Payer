import { defineStore } from "pinia";
import { ref } from "vue";
export const useBatchAuthorizationStore = defineStore(
  "batchAuthorizationStire",
  () => {
    const batch = ref([]);
    function set(data) {
      console.log(data);
      batch.value = data;
    }
    function getAll() {
      console.log(batch.value);

      return batch.value;
    }
    function remove(id) {
      const idx = batch.value.findIndex((el) => el.claimUuid == id);
      if (idx > -1) {
        batch.value.splice(idx, 1);
      }
    }
    function add(data) {
      batch.value.unshift(data);
    }
    function update(id, data) {
      const idx = data.value.findIndex((el) => el.claimUuid == id);
      if (idx > -1) {
        batch.value.splice(idx, 1, data);
      }
    }
    return { set, add, remove, update, getAll, batch };
  }
);
