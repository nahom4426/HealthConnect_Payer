import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface InstitutionAlert {
  id: string;
  institutionName: string;
  alertType: string;
  message: string;
  createdDate: string;
  status: string;
}

export const useInstitutionAlertsStore = defineStore('institutionAlertsStore', () => {
  const alerts = ref<InstitutionAlert[]>([]);
  
  function getAll() {
    return alerts.value;
  }

  function set(data: InstitutionAlert[]) {
    alerts.value = data;
  }

  return {
    alerts,
    getAll,
    set
  };
});