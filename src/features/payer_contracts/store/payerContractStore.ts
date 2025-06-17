import { defineStore } from "pinia";
import { ref } from "vue";

// Adjust to your actual interface
export interface PayerContract {
  id: number;
  contractHeaderUuid: string;
  contractNumber: string;
  // ... other fields
}

export interface PaginationMeta {
  totalElements: number;
  totalPages: number;
  number: number; // current page
  size: number;   // page size
  first: boolean;
  last: boolean;
}

export const usePayerContracts = defineStore("payerContractStore", () => {
  const payerContracts = ref<PayerContract[]>([]);
  const pagination = ref<PaginationMeta | null>(null);

  function set(data: { content: PayerContract[]; totalElements: number; totalPages: number; number: number; size: number; first: boolean; last: boolean; }) {
    console.log("Setting paginated payer contracts:", data);
    payerContracts.value = data.content;
    pagination.value = {
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      number: data.number,
      size: data.size,
      first: data.first,
      last: data.last,
    };
  }

  function getAll(): PayerContract[] {
    return payerContracts.value;
  }

  function getPagination(): PaginationMeta | null {
    return pagination.value;
  }

  return {
    payerContracts,
    pagination,
    set,
    getAll,
    getPagination,
  };
});
