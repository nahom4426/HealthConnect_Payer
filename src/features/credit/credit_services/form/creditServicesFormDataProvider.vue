<script setup lang="ts">
import { useApiRequest } from "@/composables/useApiRequest";
import {
  createCreditService,
  createCreditDrug,
} from "../api/creditServicesApi";
import { ref } from "vue";
import { toasted } from "@/utils/utils";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const creditReq = useApiRequest();
const pending = ref(false);

interface CreditServiceData {
  payerUuid: string;
  payerName: string;
  phone: string;
  employeeId: string;
  dispensingDate: string;
  prescriptionNumber?: string;
  pharmacyTransactionId?: string;
  medicationItems?: Array<{
    serviceUuid: string;
    primaryDiagnosis: string;
    secondaryDiagnosis: string;
    totalPrice: number;
  }>;
  drugItems?: Array<{
    drugUuid: string;
    quantity: number;
    totalPrice: number;
    route: string;
    frequency: string;
    dose: string;
    duration: string;
  }>;
}

async function createCredit(formData: CreditServiceData): Promise<any> {
  try {
    pending.value = true;
    const isDrugClaim = formData.drugItems !== undefined;

    const payload = {
      providerUuid: auth.auth?.user?.providerUuid || "",
      payerUuid: formData.payerUuid,
      payerName: formData.payerName || "", // Ensure payerName is included
      phone: formData.phone,
      employeeId: formData.employeeId,
      insuredUuid: formData.insuredUuid,
      dispensingDate: formData.dispensingDate,
      prescriptionNumber: formData.prescriptionNumber,
      pharmacyTransactionId: formData.pharmacyTransactionId,
      ...(isDrugClaim
        ? {
            drugItems: formData.drugItems.map((item) => ({
              ...item,
              totalPrice:
                item.totalPrice || (item.price || 0) * (item.quantity || 1),
            })),
          }
        : {
            medicationItems:
              formData.serviceItems?.map((item) => ({
                serviceUuid: item.serviceUuid,
                primaryDiagnosis: item.primaryDiagnosis || "", // Ensure this is included
                secondaryDiagnosis: item.secondaryDiagnosis || "", // Ensure this is included
                totalPrice: item.totalPrice || 0,
              })) || [],
          }),
    };

    const apiCall = isDrugClaim ? createCreditDrug : createCreditService;
    const response = await apiCall(payload);

    if (response.success) {
      const successMsg = isDrugClaim
        ? "Credit drug created successfully"
        : "Credit service created successfully";
      toasted(true, successMsg);
      return response;
    }
    throw new Error(response.error || "Failed to create credit");
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Credit creation failed";
    toasted(false, errorMsg);
    throw error;
  } finally {
    pending.value = false;
  }
}
defineExpose({
  createCredit,
  pending,
});
</script>
<template>
  <slot :createCredit="createCredit" :pending="pending" />
</template>
