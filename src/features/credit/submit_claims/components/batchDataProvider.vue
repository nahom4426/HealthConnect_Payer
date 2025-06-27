<script setup>
import { usePagination } from "@/composables/usePagination";
import { watch } from "vue";
import { getAuthorizationBatch } from "@/features/credit/authorization/api/authorizationApi";
import { removeUndefined } from "@/utils/utils";
import { useBatchAuthorizationStore } from "../store/batchAuthorizationStore";

const props = defineProps({
  search: String,
});
const bacthStore = useBatchAuthorizationStore();
const pagination = usePagination({
  store: bacthStore,
  cb: (data) =>
    getAuthorizationBatch(removeUndefined({ ...data, search: props.search })),
});

watch(
  () => props.search,
  () => {
    pagination.send();
  }
);
// if (bacthStore.data.length == 0) {
//   pagination.send();
// }
</script>

<template>
  {{ console.log(bacthStore.batch) }}
  {{ console.log(pagination) }}

  <slot
    :data="bacthStore.batch"
    :pending="pagination.pending.value"
    :error="pagination.error.value"
  />
</template>
