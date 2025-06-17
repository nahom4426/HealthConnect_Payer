<script setup lang="ts">
import { usePagination } from "@/composables/usePagination";
import { getActiveInstitutions } from "../api/institutionsApi";
import { useInstitutions } from "../store/InstitutionsStore";
import { watch, computed, onMounted } from "vue";
import { debounce } from "@/utils/debounce";

const props = defineProps({
  search: {
    type: String,
    default: "",
  },
});

const store = useInstitutions();

const pagination = usePagination({
  store: store,
  auto: true,
  reset: true,
  cb: (data) =>
    getActiveInstitutions({
      ...data,
      search: props.search.trim() || undefined,
    }),
});

// Initialize with current search term
onMounted(() => {
  if (props.search) {
    pagination.search.value = props.search;
    pagination.send();
  }
});

// Debounced search watcher
const debouncedSearch = debounce((newSearch: string) => {
  pagination.search.value = newSearch;
  pagination.send();
}, 300);

watch(
  () => props.search,
  (newSearch) => {
    debouncedSearch(newSearch);
  }
);

// Expose methods and properties
defineExpose({
  refresh: pagination.send,
  currentPage: computed(() => store.currentPage),
  itemsPerPage: computed(() => store.itemsPerPage),
  setPage: store.setPage,
  setLimit: store.setLimit,
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
