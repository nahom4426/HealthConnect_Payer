import { defineStore } from "pinia";
import { ref } from "vue";

export interface ServiceItem {
  serviceUuid: string;
  medicationName: string;
  primaryDiagnosis: string;
  secondaryDiagnosis: string;
  totalPrice: number;
  itemType: 'SERVICE';
}

export interface DrugItem {
  drugUuid: string;
  medicationName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  route: string;
  frequency: string;
  dose: string;
  duration: string;
  itemType: 'DRUG';
}

export interface ClaimService {
  invoiceNumber: string;
  dispensingUuid: string;
  payerUuid: string;
  payerName: string;
  patientName: string;
  employeeId?: string;
  phone?: string;
  insuredUuid?: string;
  insuranceId: string | null;
  dispensingDate: string;
  prescriptionNumber: string;
  pharmacyTransactionId: string;
  totalAmount: number;
  patientResponsibility: number;
  insuranceCoverage: number;
  branchName: string | null;
  createdAt: string;
  medicationItems?: ServiceItem[];
  drugItems?: DrugItem[];
  type: 'service' | 'drug';
}
export const claimServices = defineStore("claimServicesStore", () => {
  const claimServices = ref<ClaimService[]>([]);

  function getAll(): ClaimService[] {
    return claimServices.value;
  }

  function set(data: ClaimService[]): void {
    if (!Array.isArray(data)) {
      console.error("Invalid data format for claim services:", data);
      claimServices.value = [];
      return;
    }

    // Transform legacy medicationItems to new structure if needed
    claimServices.value = data.map(item => {
      if (item.medicationItems) {
        return transformLegacyClaim(item);
      }
      return {
        ...item,
        type: item.type || (item.medicationItems ? 'service' : 'drug')
      };
    });
  }

// In your store file
function add(formValues: any, apiResponse: any = {}): void {
  const isDrugClaim = formValues.drugItems !== undefined;
  
  const newClaim: ClaimService = {
    invoiceNumber: apiResponse.invoiceNumber || formValues.invoiceNumber || `INV-${Date.now()}`,
    dispensingUuid: apiResponse.dispensingUuid || formValues.dispensingUuid || generateUUID(),
    payerUuid: formValues.payerUuid || apiResponse.payerUuid,
    payerName: formValues.payerName || apiResponse.payerName, // Use provided payerName
    patientName: formValues.patientName || apiResponse.patientName, // Use provided patientName
    employeeId: formValues.employeeId,
    phone: formValues.phone,
    insuredUuid: formValues.insuredUuid || apiResponse.insuredUuid || null,
    insuranceId: apiResponse.insuranceId || null,
    dispensingDate: formValues.dispensingDate || apiResponse.recordedAt || new Date().toISOString(),
    prescriptionNumber: formValues.prescriptionNumber || '',
    pharmacyTransactionId: formValues.pharmacyTransactionId || '',
    totalAmount: apiResponse.totalAmount ,
    patientResponsibility: apiResponse.patientResponsibility ?? 0,
    insuranceCoverage: apiResponse.insuranceCoverage ?? (calculateTotal(formValues) - (apiResponse.patientResponsibility ?? 0)),
    branchName: apiResponse.branchName || null,
    createdAt: apiResponse.createdAt || new Date().toISOString(),
    type: isDrugClaim ? 'drug' : 'service'
  };

  if (isDrugClaim) {
    newClaim.drugItems = formValues.drugItems.map((item: any) => ({
      drugUuid: item.drugUuid,
      medicationName: item.drugName || 'Unknown Drug',
      quantity: Number(item.quantity) || 1,
      unitPrice: item.price || 0,
      totalPrice: (item.price || 0) * (Number(item.quantity) || 1),
      route: item.route || 'oral',
      frequency: item.frequency || 'daily',
      dose: item.dose || '1',
      duration: item.duration || '7 days',
      itemType: 'DRUG'
    }));
  } else {
    newClaim.medicationItems = formValues.medicationItems?.map((item: any) => ({
      serviceUuid: item.serviceUuid,
      medicationName: item.serviceName || 'Unknown Service',
      primaryDiagnosis: item.primaryDiagnosis || '',
      secondaryDiagnosis: item.secondaryDiagnosis || '',
      totalPrice: item.totalPrice || 0,
      itemType: 'SERVICE'
    })) || [];
  }

  claimServices.value = [newClaim, ...claimServices.value];
}
  function update(id: string, data: Partial<ClaimService>): void {
    const idx = claimServices.value.findIndex((el) => el.dispensingUuid === id);
    if (idx === -1) {
      if (data.dispensingUuid) {
        add(data as ClaimService);
      }
      return;
    }

    claimServices.value.splice(idx, 1, {
      ...claimServices.value[idx],
      ...data,
      type: data.type || claimServices.value[idx].type
    });
  }

  function remove(id: string): void {
    claimServices.value = claimServices.value.filter((el) => el.dispensingUuid !== id);
  }

  // Helper functions
  function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function calculateTotal(formValues: any): number {
    let total = 0;

    if (Array.isArray(formValues.drugItems)) {
      total += formValues.drugItems.reduce(
        (sum: number, item: any) => sum + (item.totalPrice || (item.price || 0) * (Number(item.quantity) || 1)),
        0
      );
    }

    if (Array.isArray(formValues.medicationItems)) {
      total += formValues.medicationItems.reduce(
        (sum: number, item: any) => sum + (parseFloat(item.paymentAmount?.replace('ETB ', '')) || 0) * (Number(item.quantity) || 1),
        0
      );
    }

    return total;
  }

  function transformLegacyClaim(legacyClaim: any): ClaimService {
    const isDrug = legacyClaim.medicationItems[0]?.drugUuid !== undefined;

    if (isDrug) {
      return {
        ...legacyClaim,
        drugItems: legacyClaim.medicationItems.map((item: any) => ({
          drugUuid: item.drugUuid,
          medicationName: item.medicationName || 'Unknown Drug',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          route: item.route || 'oral',
          frequency: item.frequency || 'daily',
          dose: item.dose || '1',
          duration: item.duration || '7 days',
          unitOfMeasure: item.unitOfMeasure || 'unit',
          itemType: 'DRUG'
        })),
        type: 'drug'
      };
    } else {
      return {
        ...legacyClaim,
        medicationItems: legacyClaim.medicationItems.map((item: any) => ({
          serviceUuid: item.serviceUuid,
          medicationName: item.medicationName || 'Unknown Service',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          unitOfMeasure: item.unitOfMeasure || 'service',
          itemType: 'SERVICE'
        })),
        type: 'service'
      };
    }
  }

  return {
    claimServices,
    getAll,
    set,
    add,
    update,
    remove,
  };
});