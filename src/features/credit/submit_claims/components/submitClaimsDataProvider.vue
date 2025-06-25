<script setup lang="ts">
import { getCreditClaimsbyProviderUuid } from "../api/submitClaimsApi";
import { usePagination } from "@/composables/usePagination";
import { Status } from "@/types/interface";
import { claimServices } from "../store/submitClaimsStore";
import { ref, watch, onMounted, computed, reactive } from "vue";
import { debounce } from "@/utils/debounce";
import type { PropType } from "vue";
import { removeUndefined } from "@/utils/utils";

// Props
const props = defineProps({
  auto: { type: Boolean, default: true },
  providerUuid: { type: String, required: true },
  status: { type: String as PropType<Status>, default: Status.ACTIVE },
  search: { type: String, default: "" },
  startDate: { type: String, default: "" },
  endDate: { type: String, default: "" },
  payerUuid: { type: String, default: "" }
});

// Reactive filters
const filters = reactive({
  startDate: props.startDate,
  endDate: props.endDate,
  payerUuid: props.payerUuid
});

const claimServicesStore = claimServices();
const currentPage = ref(1);
const itemsPerPage = ref(25);
const totalPages = ref(1);
const totalItems = ref(0);

const pagination = usePagination({
  auto: false,
  cb: async (data: any) => {
    const params = removeUndefined({
      ...data,
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
      ...(filters.payerUuid && { payerUuid: filters.payerUuid }),
      status: "DRAFT",
      sortBy: "dispensingDate",
      sortDirection: "desc"
    });

    const response = await getCreditClaimsbyProviderUuid(props.providerUuid, params);
    const paginated = response?.data || response;

    if (paginated?.content) {
      claimServicesStore.set(paginated.content);
      currentPage.value = paginated.page ?? 1;
      itemsPerPage.value = paginated.size ?? 25;
      totalPages.value = paginated.totalPages ?? 1;
      totalItems.value = paginated.totalElements ?? paginated.content.length;
    } else {
      claimServicesStore.set(paginated);
    }

    return paginated;
  }
});

// Method to update filters
const setFilters = (newFilters: {
  startDate?: string;
  endDate?: string;
  payerUuid?: string;
}) => {
  Object.assign(filters, newFilters);
};

// Debounced search
const debouncedSearch = debounce((newSearch: string) => {
  pagination.search.value = newSearch;
  pagination.send();
}, 300);

watch(() => props.search, debouncedSearch);

// Watch filter changes and trigger API call
watch(
  () => [filters.startDate, filters.endDate, filters.payerUuid],
  () => {
    if (filters.startDate || filters.endDate || filters.payerUuid) {
      pagination.send();
    }
  },
  { deep: true }
);

// Auto fetch on mount
onMounted(() => {
  pagination.search.value = props.search;
  if (props.auto) pagination.send();
});

// Expose methods
defineExpose({
  refresh: pagination.send,
  currentPage: computed(() => currentPage.value),
  itemsPerPage: computed(() => itemsPerPage.value),
  setPage: pagination.setPage,
  setLimit: pagination.setLimit,
  setFilters // Expose the setFilters method
});
</script>

<template>
  <slot
    :claimServices="claimServicesStore.claimServices"
    :pending="pagination.pending.value"
    :error="null"
    :search="pagination.search"
    :currentPage="currentPage"
    :itemsPerPage="itemsPerPage"
    :totalPages="totalPages"
    :totalItems="totalItems"
  />
</template>