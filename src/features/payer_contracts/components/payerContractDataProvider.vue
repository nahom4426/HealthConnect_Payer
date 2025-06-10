<script setup lang="ts">
import { usePagination } from "@/composables/usePagination";
import { usePayerContracts } from "../store/payerContractStore";
import { getPayerContracts } from "../api/payerContractApi";
import type { PropType } from "vue";
import { watch, computed } from "vue";
import { Status } from "@/types/interface";

const props = defineProps({
  auto: {
    type: Boolean,
    default: true
  },
  status: {
    type: String as PropType<Status>,
    default: Status.ACTIVE
  },
  search: {
    type: String,
    default: ""
  }
});

const store = usePayerContracts();

const pagination = usePagination({
  store,
  auto: props.auto,
  reset: true,
  cb: (data) =>
    getPayerContracts({
      ...data,
      status: props.status,
      search: props.search || undefined
    })
});

// Reactively watch search
watch(
  () => props.search,
  (val) => {
    pagination.search.value = val;
    pagination.searchFetch();
  }
);

// Expose pagination controls
defineExpose({
  refresh: pagination.send,
  currentPage: computed(() => store.currentPage),
  itemsPerPage: computed(() => store.itemsPerPage),
  setPage: store.setPage,
  setLimit: store.setLimit
});
</script>
<template>
  <slot
    :payerContracts="store.payerContracts"
    :pending="pagination.pending.value"
    :error="pagination.error.value"
    :search="pagination.search"
    :currentPage="store.currentPage"
    :itemsPerPage="store.itemsPerPage"
    :totalPages="store.totalPages"
  />
</template>
