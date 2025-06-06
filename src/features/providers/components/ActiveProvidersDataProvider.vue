<script setup>
import { ref, watch, onMounted } from "vue";
import { getProviders } from "../api/providerApi";
import { useProviders } from "../store/providersStore";

const props = defineProps({
  search: {
    type: String,
    default: "",
  },
});

const providers = ref([]);
const pending = ref(false);
const error = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = ref(1);
const totalItems = ref(0);
const providersStore = useProviders();

async function fetchProviders() {
  try {
    pending.value = true;
    error.value = "";

    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: props.search || '',
      // status: 'ACTIVE'
    };

    const response = await getProviders(params);

    if (response.success) {
      const processedProviders = response.data.map((provider) => {
        return {
          ...provider,
          logoUrl:
            provider.logoUrl ||
            (provider.logoPath
              ? `${
                  import.meta.env.VITE_API_URL || "http://localhost:8080/api"
                }/provider/logo/${provider.logoPath}`
              : null),
        };
      });

      providers.value = processedProviders;
      totalItems.value = response.total || processedProviders.length;
      totalPages.value =
        response.totalPages || Math.ceil(totalItems.value / itemsPerPage.value);

      providersStore.set(processedProviders);
    } else {
      error.value = response.error || "Failed to fetch providers";
      console.error("Provider fetch error:", error.value);
    }
  } catch (err) {
    error.value = err.message || "An error occurred while fetching providers";
    console.error("Provider fetch error:", err);
  } finally {
    pending.value = false;
  }
}

watch(
  () => props.search,
  () => {
    currentPage.value = 1;
    fetchProviders();
  }
);

watch(currentPage, () => {
  fetchProviders();
});

watch(itemsPerPage, () => {
  currentPage.value = 1; // Reset to first page when changing items per page
  fetchProviders();
});

// Initial fetch
onMounted(() => {
  fetchProviders();
});

// Function to set the current page
function setPage(page) {
  currentPage.value = page;
}

// Function to set the items per page
function setLimit(limit) {
  itemsPerPage.value = limit;
}

// Function to refresh the data
function refresh() {
  fetchProviders();
}

// Expose functions to parent components
defineExpose({
  setPage,
  setLimit,
  refresh,
});
</script>

<template>
  <div>
    <slot
      :providers="providers"
      :pending="pending"
      :error="error"
      :currentPage="currentPage"
      :itemsPerPage="itemsPerPage"
      :totalPages="totalPages"
      :totalItems="totalItems"
    ></slot>
  </div>
</template>
