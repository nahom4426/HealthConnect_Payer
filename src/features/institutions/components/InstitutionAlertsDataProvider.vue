<script setup lang="ts">
import { useApiRequest } from "@/composables/useApiRequest";
import { getInstitutionAlerts } from "../api/institutionAlertsApi";
import { useInstitutionAlertsStore } from "../store/institutionAlertsStore";
import { watch, ref } from "vue";

const props = defineProps({
  search: {
    type: String,
    default: ""
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 25
  }
});

const currentPage = ref(props.page);
const itemsPerPage = ref(props.limit);
const store = useInstitutionAlertsStore();
const req = useApiRequest();

function fetchData() {
  req.send(
    () => getInstitutionAlerts({
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: props.search
    }),
    (res) => {
      if (res.data) {
        store.set(res.data);
      }
    }
  );
}

// Initial fetch
fetchData();

// Watch for search changes
watch(
  () => props.search,
  () => {
    currentPage.value = 1; // Reset to first page on new search
    fetchData();
  }
);

// Watch for pagination changes
watch([currentPage, itemsPerPage], () => {
  fetchData();
});

defineExpose({
  refresh: fetchData,
  currentPage,
  itemsPerPage
});
</script>

<template>
  <slot 
    :alerts="store.alerts" 
    :pending="req.pending.value" 
    :currentPage="currentPage"
    :itemsPerPage="itemsPerPage"
    :refresh="fetchData"
  />
</template>