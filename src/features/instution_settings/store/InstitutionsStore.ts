import { defineStore } from "pinia";
import { ref } from "vue";

// Status type (adjust if needed)
export type Status = "ACTIVE" | "INACTIVE" | "PENDING"; // or import from "@/types/interface"

// Payer interface
export interface Payer {
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
  tinNumber?: string;
  dependantCoverage?: boolean;
  payerLogo?: string;
  logoBase64?: string;
  logoPath?: string;
  totalContracts?: number;
  totalPages?: number;
  contracts?: any[];
}

export const institutions = defineStore("institutionsStore", () => {
  const institutions = ref<Payer[]>([]);
  const totalPages = ref(1);
  const currentPage = ref(1);
  const itemsPerPage = ref(25);

  function getAll(): Payer[] {
    return institutions.value;
  }

  function set(data: Payer[]): void {
    console.log("Setting institutions in store:", data);
    
    // Check if data is valid array
    if (!Array.isArray(data)) {
      console.error("Invalid data format for institutions:", data);
      institutions.value = [];
      return;
    }
    
    // Map API response to match our Payer interface
    const mappedData = data.map(item => {
      return {
        payerUuid: item.payerUuid || '',
        email: item.email || '',
        payerName: item.payerName || '',
        description: item.description || '',
        telephone: item.telephone || '',
        category: item.category || '',
        level: item.level || '',
        address1: item.address1 || item.address || '',
        address2: item.address2 || '',
        address3: item.address3 || '',
        state: item.state || '',
        country: item.country || 'Ethiopia',
        latitude: item.latitude || 0,
        longitude: item.longitude || 0,
        status: item.status || 'ACTIVE',
        tinNumber: item.tinNumber || '',
        dependantCoverage: item.dependantCoverage || false,
        payerLogo: item.payerLogo || null,
        logoBase64: item.logoBase64 || null,
        logoPath: item.logoPath || null,
        totalContracts: item.totalContracts || 0,
        contracts: item.contracts || [],
        totalPages: item.totalPages
      };
    });
    
    institutions.value = mappedData;
    
    // Update pagination if available
    if (data.length > 0 && data[0].totalPages) {
      totalPages.value = data[0].totalPages;
    }
  }

  // Alias for set
  function setInstitutions(data: Payer[]): void {
    console.log("Setting institutions with setInstitutions:", data);
    set(data);
  }

  // Alias for set with more flexible input
  function setAll(data: any[] | { content: any[] }): void {
    console.log("Setting institutions with setAll:", data);
    
    // Handle both direct array and paginated response
    const dataArray = Array.isArray(data) 
      ? data 
      : data?.content || [];
    
    if (!dataArray.length) {
      console.error("No valid data provided to setAll");
      return;
    }
    
    // Map the API response to your Payer interface
    const mappedData = dataArray.map(item => ({
      payerUuid: item.payerUuid || '',
      email: item.email || '',
      payerName: item.payerName || '',
      description: item.description || '',
      telephone: item.telephone || '',
      category: item.category || '',
      level: item.level || '',
      address1: item.address1 || item.address || '',
      address2: item.address2 || '',
      address3: item.address3 || '',
      state: item.state || '',
      country: item.country || 'Ethiopia',
      latitude: item.latitude || 0,
      longitude: item.longitude || 0,
      status: item.status || 'ACTIVE',
      tinNumber: item.tinNumber || '',
      dependantCoverage: item.dependantCoverage || false,
      payerLogo: item.payerLogo || null,
      logoBase64: item.logoBase64 || null,
      logoPath: item.logoPath || null,
      totalContracts: item.totalContracts || 0,
      contracts: item.contracts || [],
      totalPages: item.totalPages
    }));
    
    console.log("Mapped institutions data:", mappedData);
    institutions.value = mappedData;
    
    // Update pagination if available
    if (dataArray.length > 0 && dataArray[0].totalPages) {
      totalPages.value = dataArray[0].totalPages;
    }
  }

  function add(data: Payer): void {
    console.log("Adding institution to store:", data);
    institutions.value.unshift(data);
  }

  function update(id: string, data: Partial<Payer>): void {
    console.log(`Updating institution with UUID: ${id}`, data);
    
    // Debug: log all payer UUIDs to check for matches
    console.log("Available payer UUIDs:", institutions.value.map(i => i.payerUuid));
    
    const idx = institutions.value.findIndex((el) => el.payerUuid === id);
    if (idx === -1) {
      console.warn(`[Institution Store] No institution found with UUID: ${id}`);
      // If not found by UUID, try to add it instead
      if (data.payerUuid) {
        console.log("Institution not found for update, adding instead:", data);
        add(data as Payer);
      }
      return;
    }

    // Use splice for reactive updates
    institutions.value.splice(idx, 1, {
      ...institutions.value[idx],
      ...data,
    });
    console.log("Institution updated successfully");
  }

  // Update institution status
  function updateStatus(id: string, status: Status): void {
    console.log(`Updating status for institution with UUID: ${id} to ${status}`);
    update(id, { status });
  }

  function remove(id: string): void {
    const idx = institutions.value.findIndex((el) => el.payerUuid === id);
    if (idx === -1) {
      console.warn(`[Institution Store] No institution found with UUID: ${id}`);
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


