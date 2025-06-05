import { defineStore } from "pinia";
import { ref } from "vue";
import type { Status } from "@/types/interface";


export interface payer {
  payerUuid: string;
  email: string;
  payerName: string;
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
export const useInstitutions = defineStore("institutionsStore", () => {
  const institutions = ref<payer[]>([]);
  const totalPages = ref(1);
  const currentPage = ref(1);
  const itemsPerPage = ref(25);

  function getAll(): payer[] {
    return institutions.value;
  }

  function set(data: payer[]): void {
    console.log("Setting institutions in store:", data);
    institutions.value = data;
    if (data.length > 0 && data[0].totalPages) {
      totalPages.value = data[0].totalPages;
    }
  }

  function setInstitutions(data: payer[]): void {
    console.log("Setting institutions with setInstitutions:", data);
    set(data);
  }

  function setAll(data: payer[]): void {
    console.log("Setting institutions with setAll:", data);
    set(data);
  }

  function add(data: payer): void {
    console.log("Adding institution to store:", data);
    institutions.value.unshift(data);
  }

  function update(id: string, data: Partial<payer>): void {
    console.log(`Updating institution with ID: ${id}`, data);
    const idx = institutions.value.findIndex((el) => el.payerUuid === id);

    if (idx === -1) {
      console.warn(`[Institution Store] No institution found with ID: ${id}`);
      if (data.payerUuid) {
        console.log("Institution not found for update, adding instead:", data);
        add(data as payer);
      }
      return;
    }

    institutions.value.splice(idx, 1, {
      ...institutions.value[idx],
      ...data,
    });

    console.log("Institution updated successfully");
  }

  function updateStatus(id: string, status: Status): void {
    console.log(`Updating status for institution with ID: ${id} to ${status}`);
    update(id, { status });
  }

  function remove(id: string): void {
    const idx = institutions.value.findIndex((el) => el.payerUuid === id);
    if (idx === -1) {
      console.warn(`[Institution Store] No institution found with ID: ${id}`);
      return;
    }

    institutions.value.splice(idx, 1);
  }

  function setPage(page: number): void {
    currentPage.value = page;
  }

  function setLimit(limit: number): void {
    itemsPerPage.value = limit;
  }

  return {
    institutions,
    totalPages,
    currentPage,
    itemsPerPage,
    getAll,
    set,
    setInstitutions,
    setAll,
    add,
    update,
    updateStatus,
    remove,
    setPage,
    setLimit,
  };
});
