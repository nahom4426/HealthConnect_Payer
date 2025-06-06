<script setup>
import { ref, watch, onMounted } from 'vue';
import { getProviders } from '../api/providerApi';
import { useProviders } from '../store/providersStore';

const props = defineProps({
  search: {
    type: String,
    default: ''
  }
});

const providers = ref([]);
const pending = ref(false);
const error = ref('');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = ref(1);
const totalItems = ref(0);
const providersStore = useProviders();

// Function to fetch active providers
async function fetchProviders() {
  try {
    pending.value = true;
    error.value = '';
    
    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value,
      search: props.search || '',
      // status: 'ACTIVE'
    };
    
    console.log("Fetching providers with params:", params);
    
    const response = await getProviders(params);
    console.log("Provider API response:", response);
    
    if (response.success) {
      // Process the providers to ensure logo data is properly formatted
      const processedProviders = response.data.map(provider => {
        // Ensure the provider has the necessary logo properties
        return {
          ...provider,
          // If logoPath exists but no logoUrl or logoBase64, create a URL
          logoUrl: provider.logoUrl || (provider.logoPath ? 
            `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/provider/logo/${provider.logoPath}` : 
            null)
        };
      });
      
      console.log("Processed providers:", processedProviders);
      
      providers.value = processedProviders;
      totalItems.value = response.total || processedProviders.length;
      totalPages.value = response.totalPages || Math.ceil(totalItems.value / itemsPerPage.value);
      
      // Update the providers store
      providersStore.set(processedProviders);
    } else {
      error.value = response.error || 'Failed to fetch providers';
      console.error('Provider fetch error:', error.value);
    }
  } catch (err) {
    error.value = err.message || 'An error occurred while fetching providers';
    console.error('Provider fetch error:', err);
  } finally {
    pending.value = false;
  }
}

// Watch for changes in search, page, or limit
watch(() => props.search, () => {
  currentPage.value = 1; // Reset to first page on new search
  fetchProviders();
});

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
  refresh
});
</script>

<template>
  <div>
    <div v-if="error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
      {{ error }}
    </div>
    
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




