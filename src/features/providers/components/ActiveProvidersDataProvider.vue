<script setup lang="ts">
import { usePagination } from "@/composables/usePagination";
import { useProviders } from "../store/providersStore";
import { getProviders } from "../api/providerApi";
import type { PropType } from "vue";
import { watch, computed, onMounted } from "vue";
import { Status } from "@/types/interface";
import { debounce } from "@/utils/debounce";

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
    search: props.search.trim() || undefined // Send search term to API
  })
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
  pagination.searchFetch(); // Use searchFetch which likely resets to page 1
}, 300);

watch(
  () => props.search,
  (newSearch) => {
    debouncedSearch(newSearch);
  }
);

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
  />
</template>