import { defineStore } from "pinia";
import { ref } from "vue";

// Medication Item interface
// In your store file
export interface MedicationItem {
  medicationName?: string;
  quantity?: number;
  unitOfMeasure?: string;
  unitPrice?: number;
  totalPrice?: number;
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

export const claimServices = defineStore("claimServicesStore", () => {
  const claimServices = ref<ClaimService[]>([]);

  function getAll(): ClaimService[] {
    return claimServices.value;
  }

  function set(data: ClaimService[]): void {
    console.log("Setting claim services in store:", data);
    
    if (!Array.isArray(data)) {
      console.error("Invalid data format for claim services:", data);
      claimServices.value = [];
      return;
    }
    
    claimServices.value = data;
  }

  // Alias for set
  function setClaimServices(data: ClaimService[]): void {
    set(data);
  }

  // Alias for set
  function setAll(data: ClaimService[]): void {
    set(data);
  }

// In your claimServices store
function add(apiResponse: any, formValues: any): void {
  console.log("Raw API response:", apiResponse);
  
  // Transform the API response to match ClaimService interface
  const newService: ClaimService = {
    invoiceNumber: apiResponse.invoiceNumber || `INV-${Date.now()}`,
    dispensingUuid: apiResponse.dispensingUuid,
    payerUuid: formValues.payerUuid || apiResponse.payerUuid,
    patientName: formValues.patientName || apiResponse.patientName || 'Unknown Patient',
    insuranceId: apiResponse.insuranceId || null,
    dispensingDate: formValues.dispensingDate || apiResponse.dispensingDate,
    prescriptionNumber: formValues.prescriptionNumber || apiResponse.prescriptionNumber,
    pharmacyTransactionId: formValues.pharmacyTransactionId || apiResponse.pharmacyTransactionId,
    totalAmount: apiResponse.totalAmount ,
    patientResponsibility: apiResponse.patientResponsibility || 0,
    insuranceCoverage: apiResponse.insuranceCoverage || 0,
    branchName: apiResponse.branchName || null,
    createdAt: apiResponse.createdAt || new Date().toISOString(),
    
  };

  console.log("Properly transformed claim service:", newService);
  claimServices.value = [newService, ...claimServices.value]; // Add to beginning of array
}
  function update(id: string, data: Partial<ClaimService>): void {
    console.log(`Updating claim service with UUID: ${id}`, data);
    
    const idx = claimServices.value.findIndex((el) => el.dispensingUuid === id);
    if (idx === -1) {
      console.warn(`[Claim Services Store] No claim service found with UUID: ${id}`);
      if (data.dispensingUuid) {
        console.log("Claim service not found for update, adding instead:", data);
        add(data as ClaimService);
      }
      return;
    }

    claimServices.value.splice(idx, 1, {
      ...claimServices.value[idx],
      ...data,
    });
  }

  function remove(id: string): void {
    const idx = claimServices.value.findIndex((el) => el.dispensingUuid === id);
    if (idx === -1) {
      console.warn(`[Claim Services Store] No claim service found with UUID: ${id}`);
      return;
    }

    claimServices.value.splice(idx, 1);
  }

  return {
    claimServices,
    getAll,
    set,
    setClaimServices,
    setAll,
    add,
    update,
    remove,
  };
});