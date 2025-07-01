<script setup lang="ts">
import { usePagination } from "@/composables/usePagination";
import { getProviders } from "../api/payerContractApi";
import { useProviders } from "../store/payerContractStore";
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
  <div>
    <slot 
      :providers="providers" 
      :pending="isPending" 
      :currentPage="currentPage"
      :itemsPerPage="itemsPerPage"
      :totalPages="totalPages"
    ></slot>
  </div>
</template>