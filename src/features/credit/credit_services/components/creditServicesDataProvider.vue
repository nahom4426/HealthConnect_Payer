<script setup lang="ts">
import { getCreditClaimsbyProviderUuid } from "../api/creditServicesApi";
import { usePagination } from "@/composables/usePagination";
import type { PropType } from "vue";
import { Status } from "@/types/interface";
import { claimServices } from "../store/creditClaimsStore";
import { ref, watch, onMounted, computed } from "vue";
import { debounce } from "@/utils/debounce";

// Props
const props = defineProps({
  auto: {
    type: Boolean,
    default: true
  },
  providerUuid: {
    type: String,
    required: true
  },
  status: {
    type: String as PropType<Status>,
    default: Status.DRAFT
  },
  search: {
    type: String,
    default: ""
  }
});

const claimServicesStore = claimServices();
const currentPage = ref(1);
const itemsPerPage = ref(25);
const totalPages = ref(1);
const totalItems = ref(0);

// ✅ Pagination setup without useApiRequest
const pagination = usePagination({
  auto: false,
  cb: async (data: any) => {
    const response = await getCreditClaimsbyProviderUuid(props.providerUuid, {
      ...data,
      status: "DRAFT",
    });

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

// ✅ Debounced search watcher
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

// ✅ Auto-fetch on mount
onMounted(() => {
  if (props.search) {
    pagination.search.value = props.search;
  }

  if (props.auto) {
    pagination.send();
  }
});

// ✅ Expose to parent
defineExpose({
  refresh: pagination.send,
  currentPage: computed(() => currentPage.value),
  itemsPerPage: computed(() => itemsPerPage.value),
  setPage: pagination.setPage,
  setLimit: pagination.setLimit
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
