<script setup lang="ts">
import { useApiRequest } from "@/composables/useApiRequest";
import { searchInsuredByInstitution } from "../api/insuredPersonsApi";
import { usePagination } from "@/composables/usePagination";
import type { PropType } from "vue";
import { Status } from "@/types/interface";
import { insuredMembers } from "../store/insuredPersonsStore";
import { ref, watch } from "vue";

// Props
const props = defineProps({
  auto: {
    type: Boolean,
    default: true
  },
  institutionId: {
    type: String,
    required: true
  },
  status: {
    type: String as PropType<Status>,
    default: Status.ACTIVE
  },
  search: {
    type: String,
    default: ""
  }
});

console.log('institutionId:', props.institutionId);

// Store & Request
const insuredStore = insuredMembers();
const insuredReq = useApiRequest();
const currentPage = ref(1);
const itemsPerPage = ref(25);
const totalPages = ref(1);
const totalItems = ref(0);

// Pagination setup
const pagination = usePagination({
  auto: false,
  cb: async (data: any) => {
    try {
      const response = await searchInsuredByInstitution(
        props.institutionId,
        {
          ...data,
          status: props.status
        }
      );
      
      console.log("API Response:", response);
      
      // Check if the response has the expected structure (paginated response)
      if (response && response.data && response.data.content) {
        // Update the store with the content array
        insuredStore.set(response.data.content);
        
        // Update pagination information
        currentPage.value = response.data.page || 1;
        itemsPerPage.value = response.data.size || 25;
        totalPages.value = response.data.totalPages || 1;
        totalItems.value = response.data.totalElements || response.data.content.length;
        
        return response.data;
      } else if (response && response.content) {
        // Alternative structure
        insuredStore.set(response.content);
        
        // Update pagination information
        currentPage.value = response.page || 1;
        itemsPerPage.value = response.size || 25;
        totalPages.value = response.totalPages || 1;
        totalItems.value = response.totalElements || response.content.length;
        
        return response;
      } else {
        // Fallback for old API structure
        insuredStore.set(response);
        return response;
      }
    } catch (error) {
      console.error("Error fetching insured persons:", error);
      return { error };
    }
  }
});

// Watch for search changes
watch(() => props.search, (newValue) => {
  if (newValue !== undefined) {
    pagination.search(newValue);
  }
});

// Auto-fetch if needed
if (props.auto) {
  pagination.send();
}
</script>

<template>
  <slot
    :insuredMembers="insuredStore.insuredMembers"
    :pending="insuredReq.pending.value"
    :error="insuredReq.error.value"
    :search="pagination.search"
    :currentPage="currentPage"
    :itemsPerPage="itemsPerPage"
    :totalPages="totalPages"
    :totalItems="totalItems"
  />
</template>


