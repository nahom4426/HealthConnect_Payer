<script setup>
import { watch } from "vue";
import { removeUndefined } from "@/utils/utils";
import { useSubmittedClaimStore } from "@/features/claim/store/submittedClaimStore";
import { getClaimByStatus } from "@/features/credit/track_claim/api/trackClaimApi";
import { useApiRequest } from "@/composables/useApiRequest";
import { useFinancialStore } from "@/features/claim/store/financialStore";

const props = defineProps({
  auto: {
    type: Boolean,
    default: false,
  },
  providerUuid: String,
  status: { String },

  search: {
    type: String,
    default: "",
  },
  id: {
    type: String,
  },
});
const api = useApiRequest();
const financialStore = useFinancialStore();
const submittedClaimStore = useSubmittedClaimStore();

function fetchData() {
  api.send(
    (data) =>
      getClaimByStatus(
        removeUndefined({
          ClaimStatus: props.status,
          providerUuid: props.providerUuid,

          searchKey: props.search,
          ...data,
        })
      ),
    (res) => {
      if (res.success) {
        if (props.status === "DRAFT") {
          submittedClaimStore.set(res.data?.content);
        } else {
          financialStore.set(res.data?.content);
        }
      }
    }
  );
}
fetchData();

watch(
  () => [props.search, props.providerUuid],
  () => {
    fetchData();
  }
);
</script>
<template>
  <slot
    :pending="api.pending.value"
    :error="api.error.value"
    :claims="
      props.status === 'DRAFT'
        ? submittedClaimStore.submittedClaims
        : financialStore.financialData
    "
  />
</template>
