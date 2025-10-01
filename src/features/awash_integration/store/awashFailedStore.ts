import { defineStore } from "pinia";
import { ref } from "vue";
import { getFailedServicesByStatus, retryFailedService, getFailedClaimsByStatus, retryFailedClaim } from "../api/awashApi.js";
import { toasted } from "@/utils/utils";

export type StatusType = "ACTIVE" | "INACTIVE";

export const useAwashFailedStore = defineStore("awashFailed", () => {
  const status = ref<StatusType>("INACTIVE");
  const loading = ref(false);
  const services = ref<any[]>([]);
  const claims = ref<any[]>([]);

  async function fetchServices() {
    loading.value = true;
    const res: any = await getFailedServicesByStatus(status.value);
    if (res.success) services.value = res.data || [];
    loading.value = false;
  }

  async function fetchClaims() {
    loading.value = true;
    const res: any = await getFailedClaimsByStatus(status.value);
    if (res.success) claims.value = res.data || [];
    loading.value = false;
  }

  async function retryService(logUuid: string | number) {
    const res: any = await retryFailedService(logUuid);
    // toasted(res.success, "Retry triggered for service", res.error);
    console.log("aaa",res);
    
    if (res.success) await fetchServices();
    return res;
  }

  async function retryClaim(logUuid: string | number) {
    const res: any = await retryFailedClaim(logUuid);
    // toasted(res.success, "Retry triggered for claim", res.error);
    if (res.success) await fetchClaims();
    return res;
  }

  return {
    status,
    loading,
    services,
    claims,
    fetchServices,
    fetchClaims,
    retryService,
    retryClaim,
  };
});
