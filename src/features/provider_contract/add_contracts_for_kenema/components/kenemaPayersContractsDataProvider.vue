<script setup lang="ts">
import { usePagination } from "@/composables/usePagination";
import { watch, computed, onMounted } from "vue";
import { debounce } from "@/utils/debounce";
import { institutions } from "@/features/instution_settings/store/InstitutionsStore";
import { getPayersWithoutContract } from "@/features/instution_settings/api/institutionSettingsApi";

const props = defineProps({
  search: {
    type: String,
    default: "",
  },
});

const store = institutions();

const pagination = usePagination({
  store: store,
  auto: true,
  reset: true,
  cb: (data) =>
    getPayersWithoutContract({
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
