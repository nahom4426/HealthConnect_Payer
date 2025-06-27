import { defineStore } from "pinia";
import { ref } from "vue";

// Status type (adjust if needed)
export type Status = "ACTIVE" | "INACTIVE" | "PENDING"; // or import from "@/types/interface"

// PayerContract interface
export interface PayerContract {
  id: number;
  contractHeaderUuid: string;
  contractNumber: string;
  contractName: string;
  contractDescription: string;
  startDate: string;
  endDate: string;
  status: Status;
  payerUuid: string;
  payerName: string;
  providerUuid: string;
  providerName: string;
  // Add any other fields from your API response
}

export const payerContracts = defineStore("payerContractStore", () => {
  const payerContracts = ref<PayerContract[]>([]);

  function getAll(): PayerContract[] {
    return payerContracts.value;
  }

  function set(data: PayerContract[]): void {
    console.log("Setting payer contracts in store:", data);
    payerContracts.value = data;
  }

  // Alias for set
  function setPayerContracts(data: PayerContract[]): void {
    console.log("Setting payer contracts with setPayerContracts:", data);
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
    
    // Debug: log all contract UUIDs to check for matches
    console.log("Available contract UUIDs:", payerContracts.value.map(c => c.contractHeaderUuid));
    
    const idx = payerContracts.value.findIndex((el) => el.contractHeaderUuid === id);
    if (idx === -1) {
      console.warn(`[PayerContract Store] No contract found with UUID: ${id}`);
      // If not found by UUID, try to add it instead
      if (data.contractHeaderUuid) {
        console.log("Contract not found for update, adding instead:", data);
        add(data as PayerContract);
      }
      return;
    }

    // Use splice for reactive updates
    payerContracts.value.splice(idx, 1, {
      ...payerContracts.value[idx],
      ...data,
    });
    console.log("Payer contract updated successfully");
  }

  function remove(id: string): void {
    const idx = payerContracts.value.findIndex((el) => el.contractHeaderUuid === id);
    if (idx === -1) {
      console.warn(`[PayerContract Store] No contract found with UUID: ${id}`);
      return;
    }

    payerContracts.value.splice(idx, 1);
  }

  // Update contract status
  function updateStatus(id: string, status: Status): void {
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