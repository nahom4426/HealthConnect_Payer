import { defineStore } from "pinia";
import { ref } from "vue";

export const payerContracts = defineStore("payerContractStore", () => {
  const payerContracts = ref([]);

  function getAll() {
    return payerContracts.value;
  }

  function set(data) {
    console.log("Setting payer contracts in store:", data);
    payerContracts.value = data;
  }

  function setAll(data) {
    set(data);
  }

  function add(data) {
    payerContracts.value.unshift(data);
  }

  function update(id, data) {
    const idx = payerContracts.value.findIndex(
      (el) => el.contractHeaderUuid === id
    );

    if (idx === -1) {
      if (data.contractHeaderUuid) {
        add(data);
      }
      return;
    }

    payerContracts.value.splice(idx, 1, {
      ...payerContracts.value[idx],
      ...data,
    });
  }

  function remove(id) {
    const idx = payerContracts.value.findIndex(
      (el) => el.contractHeaderUuid === id
    );
    if (idx !== -1) payerContracts.value.splice(idx, 1);
  }

  function updateStatus(id, status) {
    update(id, { status });
  }

  return {
    payerContracts,
    getAll,
    set,
    setAll,
    add,
    update,
    updateStatus,
    remove,
  };
});
