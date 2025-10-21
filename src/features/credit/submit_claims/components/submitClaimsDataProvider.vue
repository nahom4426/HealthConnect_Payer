<script setup lang="ts">
import { getCreditClaimsbyProviderUuid } from "../api/submitClaimsApi";
import { Status } from "@/types/interface";
import { claimServices } from "../store/submitClaimsStore";
import { ref, watch, onMounted, computed, reactive } from "vue";
import { removeUndefined } from "@/utils/utils";
import type { PropType } from "vue";

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
const pendingResolve = ref<null | ((value: any) => void)>(null);

// Core fetch function (no pagination params)
const fetchData = async () => {
  if (!filters.payerUuid) {
    console.log("[DataProvider] No payerUuid — skipping fetch.");
    return Promise.resolve({ content: [] });
  }

  const params = removeUndefined({
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.payerUuid && { payerUuid: filters.payerUuid }),
    status: "DRAFT",
    sortBy: "dispensingDate",
    sortDirection: "desc"
    // ❌ no page or size here — handled inside API
  });

  console.log("[DataProvider] calling getCreditClaimsbyProviderUuid with params:", params);

  const response = await getCreditClaimsbyProviderUuid(props.providerUuid, params);
  console.log("[DataProvider] raw response:", response);

  const paginated = response?.data || response;

  if (paginated?.content) {
    claimServicesStore.set(paginated.content);
  } else {
    claimServicesStore.set(Array.isArray(paginated) ? paginated : []);
  }

  if (pendingResolve.value) {
    try { pendingResolve.value(paginated); } finally { pendingResolve.value = null; }
  }

  return paginated;
};

// Set filters and fetch data if payerUuid is set
const setFilters = (newFilters: {
  startDate?: string;
  endDate?: string;
  payerUuid?: string;
}) => {
  Object.assign(filters, newFilters);
  if (!filters.payerUuid) return Promise.resolve({ content: [] });

  return new Promise((resolve) => {
    pendingResolve.value = resolve;
    fetchData();
  });
};

// Expose refresh & filters to parent
defineExpose({
  refresh: async () => {
    if (!filters.payerUuid) return Promise.resolve({ content: [] });
    return new Promise((resolve) => {
      pendingResolve.value = resolve;
      fetchData();
    });
  },
  setFilters
});
</script>

<template>
  <slot
    :claimServices="claimServicesStore.claimServices"
    :pending="false"
    :error="null"
  />
</template>
