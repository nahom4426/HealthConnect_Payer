import { getActiveInstitutions, getPayersWithContractForLoggedInProvider } from "@/features/instution_settings/api/institutionSettingsApi";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const claimServices = defineStore("submitServicesStore", () => {
  const claimServices = ref([]);
  const institutions = ref([]);
  const loadingInstitutions = ref(false);
  const fetchPending = ref(false);
  const error = ref(null);
  const payers = ref([]);
  const fetchActiveInstitutions = async () => {
    loadingInstitutions.value = true;
    try {
     const response = await getPayersWithContractForLoggedInProvider({ page: 1, size:10000 });
      
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
  async function fetchActiveInstitution() {
    try {
      fetchPending.value = true;
      error.value = null;
      const response = await getPayersWithContractForLoggedInProvider({ page: 1, size:10000 });
      
      if (!response?.data?.content || !Array.isArray(response.data.content)) {
        throw new Error('Invalid data format: missing content array');
      }

      payers.value = response.data.content.map(item => ({
        payerUuid: item.payerUuid,
        payerName: item.payerName || `Unnamed Payer (${item.email})`,
        email: item.email,
        telephone: item.telephone,
        contracts: item.contracts || []
      }));

      if (payers.value.length === 0) {
        error.value = 'No payers available';
      }
    } catch (err) {
      console.error('Error fetching payers:', err);
      error.value = 'Failed to load payers. Please try again.';
    } finally {
      fetchPending.value = false;
    }
  }

  const payerOptions = computed(() => {
    return institutions.value.map(inst => ({
      label: inst.name,
      value: inst.uuid,
      originalData: inst
    }));
  });

  function getAll() {
    return claimServices.value;
  }

  function set(data) {
    claimServices.value = Array.isArray(data) ? data : [];
  }

  function add(data) {
    claimServices.value.unshift(data);
  }

  function update(id, data) {
    const idx = claimServices.value.findIndex(el => el.dispensingUuid === id);
    if (idx !== -1) {
      claimServices.value.splice(idx, 1, {
        ...claimServices.value[idx],
        ...data,
      });
    }
  }

  function remove(id) {
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