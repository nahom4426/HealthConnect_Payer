<script setup>
import { useApiRequest } from "@/composables/useApiRequest";
import {
  getClaimAttachment,
  getClaims,
  getServiceCoverage,
  getServices,
} from "../api/claimApi";
import { allRequest } from "@/utils/utils";
import { ref } from "vue";
import { useCoverage } from "../store/coverageStore";

const props = defineProps({
  claimUuid: String,
});
const coverageStore = useCoverage();
const api = useApiRequest();
const claimApi = useApiRequest();
const insuredPersonUuid = ref("");
claimApi.send(
  () => getClaims(props.claimUuid),
  (res) => {
    if (res.success) {
      insuredPersonUuid.value = res.data?.insuredPersonUuid;
      getAll();
    }
  }
);

function getAll() {
  api.send(
    () =>
      allRequest({
        services: getServices(insuredPersonUuid.value),
        attachments: getClaimAttachment(props.claimUuid),
        coverage: getServiceCoverage(insuredPersonUuid.value),
      }),
    (res) => {
      coverageStore.set(res.data?.coverage);
    }
  );
}
</script>

<template>
  <slot
    :coverage="api.response.value?.coverage"
    :services="api.response.value?.services"
    :claims="claimApi.response.value"
    :attachments="api.response.value?.attachments"
    :pending="api.pending.value || claimApi.pending.value"
    :error="api.error.value"
  />
</template>
