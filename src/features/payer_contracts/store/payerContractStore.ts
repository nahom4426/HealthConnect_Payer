import { defineStore } from "pinia";
import { ref } from "vue";

// Status type (adjust if needed)
export type Status = "ACTIVE" | "INACTIVE" | "PENDING"; // or import from "@/types/interface"

// PayerContracts interface
export interface PayerContract {
  providerUuid: string;
  email: string;
  providerName: string;
  description: string;
  telephone: string;
  category: string;
  level: string;
  address1: string;
  address2: string;
  address3: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  status: Status;
}

export const usePayerContracts = defineStore("payerContractStore", () => {
  const payerContracts = ref<PayerContract[]>([]);

  function getAll(): PayerContract[] {
    return payerContracts.value;
  }

  function set(data: PayerContract[]): void {
    console.log("Setting payer contracts in store:", data);
    payerContracts.value = data;
  }

  // Alias for set
  function setProviders(data: PayerContract[]): void {
    console.log("Setting payer contracts with setProviders:", data);
    set(data);
  }

  // Alias for set
  function setAll(data: PayerContract[]): void {
    console.log("Setting payer contracts with setAll:", data);
    set(data);
  }

  function add(data: PayerContract): void {
    console.log("Adding payer contract to store:", data);
    payerContracts.value.unshift(data);
  }

  function update(id: string, data: Partial<PayerContract>): void {
    console.log(`Updating payer contract with UUID: ${id}`, data);

    console.log("Available provider UUIDs:", payerContracts.value.map(p => p.providerUuid));

    const idx = payerContracts.value.findIndex((el) => el.providerUuid === id);
    if (idx === -1) {
      console.warn(`[PayerContract Store] No contract found with UUID: ${id}`);
      if (data.providerUuid) {
        console.log("Contract not found for update, adding instead:", data);
        add(data as PayerContract);
      }
      return;
    }

    payerContracts.value.splice(idx, 1, {
      ...payerContracts.value[idx],
      ...data,
    });
    console.log("Payer contract updated successfully");
  }

  function remove(id: string): void {
    const idx = payerContracts.value.findIndex((el) => el.providerUuid === id);
    if (idx === -1) {
      console.warn(`[PayerContract Store] No contract found with UUID: ${id}`);
      return;
    }

    payerContracts.value.splice(idx, 1);
  }

  function updateStatus(id: string, status: Status): void {
    console.log(`Updating status for payer contract with UUID: ${id} to ${status}`);
    update(id, { status });
  }

  return {
    payerContracts,
    getAll,
    set,
    setProviders,
    setAll,
    add,
    update,
    updateStatus,
    remove,
  };
});
