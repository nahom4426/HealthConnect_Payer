<script setup lang="ts">
import { usePagination } from "@/composables/usePagination";
import { getProviderContracts } from "../api/providerContractApi";
import { useProviderContracts } from "../store/providerContractStore";
import { watch, computed } from "vue";
import { Status } from "@/types/interface";

const props = defineProps({
  search: {
    type: String,
    default: ""
  }
});

const store = useProviderContracts();

const pagination = usePagination({
  store: store,
  auto: true,
  reset: true,
  cb: (data) => getProviderContracts({
    ...data,
    status: Status.ACTIVE,
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
const contracts = computed(() => store.contracts);
const currentPage = computed(() => pagination.page?.value || 1);
const itemsPerPage = computed(() => pagination.limit?.value || 10);
const totalPages = computed(() => pagination.totalPages?.value || 1);
const isPending = computed(() => pagination.pending?.value || false);

// Methods for pagination control
function setPage(page: number) {
  if (pagination.page) {
    pagination.page.value = page;
  }
}

function setLimit(limit: number) {
  if (pagination.limit) {
    pagination.limit.value = limit;
  }
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
  <slot 
    :contracts="contracts" 
    :pending="isPending" 
    :currentPage="currentPage" 
    :itemsPerPage="itemsPerPage" 
    :totalPages="totalPages" 
  />
</template>