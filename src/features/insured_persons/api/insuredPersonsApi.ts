import ApiService from "@/service/ApiService";
import type { InsuredPerson, AsyncResponse } from "@/types/interface";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService()
const path = '/insuredperson'
const baseUrl = import.meta.env.v_API_URI
const basePath = '/insuredperson';

export function getInsuredByContractId(id: string, query = {}) {
	return api.addAuthenticationHeader().get<InsuredPerson[]>(`${path}/list/${id}`, {
		params: query
	})
}

export function searchInsuredByInstitution(id: string, query = {}, config = {}) {
	return api.addAuthenticationHeader().get<InsuredPerson[]>(`${path}/payer/with-dependants/${id}`, {
		params: query,
		...config
	})
}

export function createInsuredPerson(data: any) {
	return api.addAuthenticationHeader().post(`${baseUrl}/insuredperson`, data)
}

export function updateInsuredPerson(uuid: string, data: any) {
	return api.addAuthenticationHeader().put(`${baseUrl}/insuredperson/${uuid}`, data)
}

export function getInsuredPersonById(uuid: string) {
	return api.addAuthenticationHeader().get(`${baseUrl}/insuredperson/${uuid}`)
}

import { useAuthStore } from "@/stores/auth"; // Make sure to import the auth store

export function importInsuredPersons(file: File, institutionUuid: string): Promise<AsyncResponse<any>> {
  const formData = new FormData();
  formData.append('file', file);

  const auth = useAuthStore();
  const token = auth.auth.token; // Get the token from the auth store

  return api.addAuthenticationHeader().post(`${basePath}/import-insured-and-dependant?institutionUuid=${institutionUuid}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        // You can emit this percentage if needed
      }
    }
  });
}