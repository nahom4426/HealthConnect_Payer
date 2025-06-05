import type { Status, StoreForPagination } from "@/types/interface";
import { defineStore } from "pinia";
import { ref } from "vue";

export interface ProviderContract {
  contractUuid: string;
  providerName: string;
  providerUuid: string;
  startDate: string;
  endDate: string;
  contractType: string;
  description: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export const useProviderContracts = defineStore("providerContractStore", () => {
  const contracts = ref<ProviderContract[]>([]);

  function getAll() {
    return contracts.value;
  }

  function set(data: ProviderContract[]) {
    contracts.value = data;
  }

  function add(data: ProviderContract) {
    contracts.value.unshift(data);
  }

  function update(id: string, data: Partial<ProviderContract>) {
    const idx = contracts.value.findIndex((el) => el.contractUuid === id);
    if (idx === -1) return;

    contracts.value[idx] = { ...contracts.value[idx], ...data };
  }

  function remove(id: string) {
    const idx = contracts.value.findIndex((el) => el.contractUuid === id);
    if (idx === -1) return;
    
    contracts.value.splice(idx, 1);
  }

  return {
    contracts,
    getAll,
    set,
    add,
    update,
    remove
  };
});