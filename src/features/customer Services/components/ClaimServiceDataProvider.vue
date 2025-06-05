<script setup>
import { allRequest } from "@/utils/utils";
import { claimedServices, getClaims } from "../api/claimApi";
import { useApiRequest } from "@/composables/useApiRequest";
const props = defineProps({
  claimUuid: {
    type: String,
    required: true,
  },
});
console.log(props.claimUuid);
const api = useApiRequest();
function getAll() {
  api.send(
    () =>
      allRequest({
        claims: getClaims(props.claimUuid),
        claimServices: claimedServices({ claimUuid: props.claimUuid }),
      }),
    (res) => {
      console.log(res);
    }
  );
}
getAll();
</script>
<template>
  <slot
    :pending="api.pending.value"
    :error="api.error.value"
    :claims="api.response.value?.claims"
    :claimServices="api.response.value?.claimServices"
  />
</template>
