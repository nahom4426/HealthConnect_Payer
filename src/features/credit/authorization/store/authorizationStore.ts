import { defineStore } from "pinia";
import { ref } from "vue";

// Medication Item interface
export interface MedicationItem {
  medicationName: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  totalPrice: number;
}

// Claim Service interface
export interface ClaimService {
  invoiceNumber: string;
  dispensingUuid: string;
  payerUuid: string;
  patientName: string;
  insuranceId: string | null;
  dispensingDate: string;
  prescriptionNumber: string;
  pharmacyTransactionId: string;
  totalAmount: number;
  patientResponsibility: number;
  insuranceCoverage: number;
  branchName: string | null;
  createdAt: string;
  medicationItems: MedicationItem[];
}

export const authorizationStore = defineStore("authorizationStore", () => {
  const authorizationStore = ref<ClaimService[]>([]);

  function getAll(): ClaimService[] {
    return authorizationStore.value;
  }

  function set(data: ClaimService[]): void {
    console.log("Setting claim services in store:", data);
    
    if (!Array.isArray(data)) {
      console.error("Invalid data format for claim services:", data);
      authorizationStore.value = [];
      return;
    }
    
    authorizationStore.value = data;
  }

  // Alias for set
  function setauthorization(data: ClaimService[]): void {
    set(data);
  }

  // Alias for set
  function setAll(data: ClaimService[]): void {
    set(data);
  }

  function add(data: ClaimService): void {
    console.log("Adding claim service to store:", data);
    authorizationStore.value.unshift(data);
  }

  function update(id: string, data: Partial<ClaimService>): void {
    console.log(`Updating claim service with UUID: ${id}`, data);
    
    const idx = authorization.value.findIndex((el) => el.dispensingUuid === id);
    if (idx === -1) {
      console.warn(`[Claim Services Store] No claim service found with UUID: ${id}`);
      if (data.dispensingUuid) {
        console.log("Claim service not found for update, adding instead:", data);
        add(data as ClaimService);
      }
      return;
    }

    authorizationStore.value.splice(idx, 1, {
      ...authorizationStore.value[idx],
      ...data,
    });
  }

  function remove(id: string): void {
    const idx = authorization.value.findIndex((el) => el.dispensingUuid === id);
    if (idx === -1) {
      console.warn(`[Claim Services Store] No claim service found with UUID: ${id}`);
      return;
    }

    authorizationStore.value.splice(idx, 1);
  }

  return {
    authorizationStore,
    getAll,
    set,
    setauthorization,
    setAll,
    add,
    update,
    remove,
  };
});