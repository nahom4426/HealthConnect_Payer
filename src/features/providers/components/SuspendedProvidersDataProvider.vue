<script setup lang="ts">
import { usePagination } from "@/composables/usePagination";
import { getProviders } from "../api/providerApi";
import { useProviders } from "../store/providersStore";
import { watch, computed } from "vue";
import { Status } from "@/types/interface";

const props = defineProps({
  search: {
    type: String,
    default: ""
  }
});

const store = useProviders();

const pagination = usePagination({
  store: store,
  auto: true,
  reset: true,
  cb: (data) => getProviders({
    ...data,
    status: Status.SUSPENDED,
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

// Computed properties for pagination
const providers = computed(() => store.providers);
const currentPage = computed(() => pagination.page.value);
const itemsPerPage = computed(() => pagination.limit.value);
const totalPages = computed(() => pagination.totalPages.value);

// Methods for pagination control
function setPage(page: number) {
  pagination.page.value = page;
}

function setLimit(limit: number) {
  pagination.limit.value = limit;
}

function refresh() {
  pagination.send();
}

// Expose methods and properties to the parent component
defineExpose({
  setPage,
  setLimit,
  refresh
});
</script>

<template>
  <div>
    <slot 
      :providers="providers" 
      :pending="pagination.pending.value" 
      :currentPage="currentPage"
      :itemsPerPage="itemsPerPage"
      :totalPages="totalPages"
    ></slot>
  </div>
</template>