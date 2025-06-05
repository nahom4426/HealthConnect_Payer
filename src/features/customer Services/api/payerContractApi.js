import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService(import.meta.env?.v_PAYER_API);

const path = "/payer/claimconnect/payer-institution-contract";
const providerpath = "/payer/claimconnect/provider";

export function getPayerInstitutionContract(id) {
  console.log(api);
  return api.addAuthenticationHeader().get(`${path}/list/institutions/${id}`);
}

export function getInsuredContractMembers(query = {}) {
  const qr = getQueryFormObject(query);
  return api
    .addAuthenticationHeader()
    .get(`${providerpath}/search/insuredperson${qr}`);
}
