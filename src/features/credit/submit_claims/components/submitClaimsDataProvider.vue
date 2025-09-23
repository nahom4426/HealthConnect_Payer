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
    // DEBUG: log pagination callback invocation and current filters
    console.log('[DataProvider] pagination.cb called, incoming data:', data);
    console.log('[DataProvider] current filters:', JSON.parse(JSON.stringify(filters)));

    const params = removeUndefined({
      ...data,
      ...(filters.startDate && { startDate: filters.startDate }),
      ...(filters.endDate && { endDate: filters.endDate }),
      ...(filters.payerUuid && { payerUuid: filters.payerUuid }),
      status: "DRAFT",
      sortBy: "dispensingDate",
      sortDirection: "desc"
    });

    console.log('[DataProvider] calling getCreditClaimsbyProviderUuid with params:', params);
    const response = await getCreditClaimsbyProviderUuid(props.providerUuid, params);
    console.log('[DataProvider] raw response:', response);
    const paginated = response?.data || response;
    console.log('[DataProvider] normalized paginated:', paginated);

    if (paginated?.content) {
      claimServicesStore.set(paginated.content);
      currentPage.value = paginated.page ?? 1;
      itemsPerPage.value = paginated.size ?? 25;
      totalPages.value = paginated.totalPages ?? 1;
      totalItems.value = paginated.totalElements ?? paginated.content.length;
      console.log('[DataProvider] stored content length:', (paginated.content || []).length);
    } else {
      claimServicesStore.set(Array.isArray(paginated) ? paginated : []);
      totalItems.value = Array.isArray(paginated) ? paginated.length : 0;
      totalPages.value = 1;
      console.log('[DataProvider] stored fallback length:', totalItems.value);
    }

    return paginated;
  }
});

// Method to update filters and optionally trigger fetch
const setFilters = (newFilters: {
  startDate?: string;
  endDate?: string;
  payerUuid?: string;
}) => {
  console.log('[DataProvider] setFilters called with:', newFilters);
  Object.assign(filters, newFilters);
  console.log('[DataProvider] filters after assign:', JSON.parse(JSON.stringify(filters)));
  // Only send when payerUuid exists
  if (filters.payerUuid) {
    console.log('[DataProvider] payerUuid present, calling pagination.send()');
    return pagination.send();
  }
  console.log('[DataProvider] payerUuid missing, skipping pagination.send()');
  // return a resolved promise for caller convenience
  return Promise.resolve({ content: [] });
};

// Expose methods (add refresh)
defineExpose({
  // refresh explicitly triggers pagination.send and returns the response
  refresh: async () => {
    console.log('[DataProvider] refresh called, filters:', JSON.parse(JSON.stringify(filters)));
    if (!filters.payerUuid) {
      console.log('[DataProvider] refresh aborted - no payerUuid');
      return Promise.resolve({ content: [] });
    }
    const res = await pagination.send();
    console.log('[DataProvider] refresh result received');
    return res;
  },
  currentPage: computed(() => currentPage.value),
  itemsPerPage: computed(() => itemsPerPage.value),
  setPage: pagination.setPage,
  setLimit: pagination.setLimit,
  setFilters
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