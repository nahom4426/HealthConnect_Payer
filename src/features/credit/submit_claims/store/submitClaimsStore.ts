import { getActiveInstitutions } from "@/features/instution_settings/api/institutionSettingsApi";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

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
  payerName?: string;
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

// Institution interface based on your API response
interface Institution {
  payerUuid: string;
  payerName: string;
  email?: string;
  telephone?: string;
  // Add other fields as needed
}

export const claimServices = defineStore("submitServicesStore", () => {
  const claimServices = ref<ClaimService[]>([]);
  const institutions = ref<Institution[]>([]);
  const loadingInstitutions = ref(false);

  // Fetch active institutions from API
  const fetchActiveInstitutions = async () => {
    loadingInstitutions.value = true;
    try {
      const response = await getActiveInstitutions();
      
      // Handle the nested content array in the response
      if (response?.data?.content && Array.isArray(response.data.content)) {
        institutions.value = response.data.content.map(item => ({
          uuid: item.payerUuid,  // Map payerUuid to uuid
          name: item.payerName,  // Map payerName to name
          ...item                // Include all other properties
        }));
      } else {
        console.warn("Unexpected API response structure:", response);
        institutions.value = [];
      }
    } catch (error) {
      console.error("Error fetching institutions:", error);
      institutions.value = [];
    } finally {
      loadingInstitutions.value = false;
    }
  };

  // Get payer options with proper mapping
  const payerOptions = computed(() => {
    return institutions.value.map(inst => ({
      label: inst.name,
      value: inst.uuid,
      originalData: inst  // Include original data if needed
    }));
  });

  // Standard store methods
  function getAll(): ClaimService[] {
    return claimServices.value;
  }

  function set(data: ClaimService[]): void {
    claimServices.value = Array.isArray(data) ? data : [];
  }

  function add(data: ClaimService): void {
    claimServices.value.unshift(data);
  }

  function update(id: string, data: Partial<ClaimService>): void {
    const idx = claimServices.value.findIndex(el => el.dispensingUuid === id);
    if (idx !== -1) {
      claimServices.value.splice(idx, 1, {
        ...claimServices.value[idx],
        ...data,
      });
    }
  }

  function remove(id: string): void {
    claimServices.value = claimServices.value.filter(el => el.dispensingUuid !== id);
  }

  return {
    claimServices,
    institutions,
    loadingInstitutions,
    payerOptions,
    fetchActiveInstitutions,
    getAll,
    set,
    add,
    update,
    remove,
  };
});