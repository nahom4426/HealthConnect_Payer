<script setup lang="ts">
import { usePagination } from "@/composables/usePagination";
import { useProviders } from "../store/providersStore";
import { getProviders } from "../api/providerApi";
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
    default: ''
  }
});

const store = useProviders();

const pagination = usePagination({
  store: store,
  auto: props.auto,
  reset: true,
  cb: (data) => getProviders({
    ...data,
    status: props.status,
    search: props.search || undefined
  })
});

// Watch for search input changes
watch(
  () => props.search,
  (newSearch) => {
    pagination.search.value = newSearch;
    pagination.searchFetch();
  }
);

// Expose methods and reactive state
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
    :providers="store.providers"
    :pending="pagination.pending.value"
    :error="pagination.error.value"
    :currentPage="store.currentPage"
    :itemsPerPage="store.itemsPerPage"
    :totalPages="store.totalPages"
    :search="pagination.search"
  />
</template>
