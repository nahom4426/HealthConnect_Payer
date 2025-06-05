import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Status } from "@/types/interface";

export interface InsuredPerson {
  insuredUuid: string;
  fullName: string;
  gender: string;
  phone: string;
  insuranceId: string;
  address: string;
  status: Status;
  totalPages?: number;
  email?: string;
  dateOfBirth?: string;
  nationalId?: string;
}

export const useInsuredPersonsStore = defineStore('insuredPersonsStore', () => {
  const insuredPersons = ref<InsuredPerson[]>([]);
  const totalPages = ref(1);
  const currentPage = ref(1);
  const itemsPerPage = ref(25);

  function getAll() {
    return insuredPersons.value;
  }

  function set(data: InsuredPerson[]) {
    insuredPersons.value = data;
    if (data.length > 0 && data[0].totalPages) {
      totalPages.value = data[0].totalPages;
    }
  }

  function add(data: InsuredPerson) {
    insuredPersons.value.unshift(data);
  }

  function update(id: string, data: Partial<InsuredPerson>) {
    const idx = insuredPersons.value.findIndex(item => item.insuredUuid === id);
    if (idx !== -1) {
      insuredPersons.value[idx] = { ...insuredPersons.value[idx], ...data };
    }
  }

  function remove(id: string) {
    const idx = insuredPersons.value.findIndex(item => item.insuredUuid === id);
    if (idx !== -1) {
      insuredPersons.value.splice(idx, 1);
    }
  }

  function setPage(page: number) {
    currentPage.value = page;
  }

  function setLimit(limit: number) {
    itemsPerPage.value = limit;
  }

  return {
    insuredPersons,
    totalPages,
    currentPage,
    itemsPerPage,
    getAll,
    set,
    add,
    update,
    remove,
    setPage,
    setLimit
  };
});