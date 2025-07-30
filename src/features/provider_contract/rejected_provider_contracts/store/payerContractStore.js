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

  function setPayerContracts(data) {
    console.log("Setting payer contracts with setPayerContracts:", data);
    set(data);
  }

  function setAll(data) {
    console.log("Setting payer contracts with setAll:", data);
    set(data);
  }

  function add(data) {
    console.log("Adding payer contract to store:", data);
    payerContracts.value.unshift(data);
  }

  function update(id, data) {
    console.log(`Updating payer contract with UUID: ${id}`, data);
    console.log(
      "Available contract UUIDs:",
      payerContracts.value.map((c) => c.contractHeaderUuid)
    );

    const idx = payerContracts.value.findIndex(
      (el) => el.contractHeaderUuid === id
    );

    if (idx === -1) {
      console.warn(`[PayerContract Store] No contract found with UUID: ${id}`);
      if (data.contractHeaderUuid) {
        console.log("Contract not found for update, adding instead:", data);
        add(data);
      }
      return;
    }

    payerContracts.value.splice(idx, 1, {
      ...payerContracts.value[idx],
      ...data,
    });

    console.log("Payer contract updated successfully");
  }

  function remove(id) {
    const idx = payerContracts.value.findIndex(
      (el) => el.contractHeaderUuid === id
    );

    if (idx === -1) {
      console.warn(`[PayerContract Store] No contract found with UUID: ${id}`);
      return;
    }

    payerContracts.value.splice(idx, 1);
  }

  function updateStatus(id, status) {
    console.log(`Updating status for contract with UUID: ${id} to ${status}`);
    update(id, { status });
  }

  return {
    payerContracts,
    getAll,
    set,
    setPayerContracts,
    setAll,
    add,
    update,
    updateStatus,
    remove,
  };
});
