<script setup lang="ts">
import { usePagination } from "@/composables/usePagination";
import { getActiveInstitutions } from "../api/institutionsApi";
import { useInstitutions } from "../store/InstitutionsStore";
import { watch, computed } from "vue";

const props = defineProps({
  search: {
    type: String,
    default: ""
  }
});

const store = useInstitutions();

const pagination = usePagination({
  store: store,
  auto: true,
  reset: true,
  cb: (data) => getActiveInstitutions({
    ...data,
    search: props.search || undefined
  })
});

// Watch for search changes
watch(
  () => props.search,
  (val) => {
    pagination.search.value = val;
    pagination.searchFetch();
  }
);

// Expose methods and properties
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
    :institutions="store.institutions" 
    :pending="pagination.pending.value" 
    :currentPage="store.currentPage"
    :itemsPerPage="store.itemsPerPage"
    :totalPages="store.totalPages"
  />
</template>
