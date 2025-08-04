import ApiService from "@/service/ApiService";
import { getQueryFormObject } from "@/utils/utils";

const api = new ApiService();
const path = "/claims";
const baseUrl = import.meta.env.v_API_URI;

export function claimApproval(id) {
  return api.addAuthenticationHeader().post(`${path}/createBatchClaim/${id}`);
}

export function claimRejection(id, data) {
  return api.addAuthenticationHeader().post(`${path}/reject/${id}`, data);
}
 /**
 * Set claim status to REMOVED with a comment.
 * @param {string} claimUuid - UUID of the claim.
 * @param {string} comment - Reason/comment for removal.
 */
export function removeClaimStatus(claimUuid, comment) {
  return api.addAuthenticationHeader().post(`${path}/${claimUuid}/status?newStatus=REMOVED&comment=${encodeURIComponent(comment)}`);
}