<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useApiRequest } from '@/composables/useApiRequest';
import { searchInsuredByInstitution } from '../api/insuredPersonsApi';

const props = defineProps({
  search: {
    type: String,
    default: ''
  },
  institutionId: {
    type: String,
    required: true
  },
  limit: {
    type: Number,
    default: 10
  },
  page: {
    type: Number,
    default: 1
  }
});

const insuredPersons = ref([]);
const currentPage = ref(props.page);
const itemsPerPage = ref(props.limit);
const totalPages = ref(0);

const request = useApiRequest();

// Fetch insured persons data
function fetchData() {
  const query = {
    page: currentPage.value,
    limit: itemsPerPage.value,
    search: props.search
  };

  request.send(
    () => searchInsuredByInstitution(props.institutionId, query),
    (response) => {
      if (response.data) {
        insuredPersons.value = response.data;
        totalPages.value = response.totalPages || Math.ceil(response.total / itemsPerPage.value) || 1;
      }
    }
  );
}

// Watch for changes in search, page, or limit
watch(() => props.search, fetchData);
watch(() => props.page, (newPage) => {
  currentPage.value = newPage;
  fetchData();
});
watch(() => props.limit, (newLimit) => {
  itemsPerPage.value = newLimit;
  fetchData();
});

// Initial data fetch
onMounted(fetchData);

// Expose method to refresh data
function refresh() {
  fetchData();
}

defineExpose({
  refresh
});
</script>

<template>
  <slot 
    :insuredPersons="insuredPersons" 
    :pending="request.pending.value" 
    :currentPage="currentPage" 
    :itemsPerPage="itemsPerPage" 
    :totalPages="totalPages"
  />
</template>