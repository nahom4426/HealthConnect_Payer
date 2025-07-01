<script setup>
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import { closeModal } from "@customizer/modal-x";
import { ref, computed, onMounted } from "vue";
import Form from "@/components/new_form_builder/Form.vue";
import Input from "@/components/new_form_elements/Input.vue";
import Button from "@/components/Button.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { useToast } from '@/toast/store/toast';
import { toasted } from '@/utils/utils';
import { getPayerContractById ,assignServicesToGroup ,getContractDetailsByGroup} from '../api/payerContractApi';
import { useRoute } from 'vue-router';

const props = defineProps({
  groupUuid: {
    type: String,
    required: true
  },
  contractHeaderUuid: {
    type: String,
    required: true
  }
});
const route = useRoute();
const { addToast } = useToast();
const api = useApiRequest();
const contractApi = useApiRequest();
const contractHeaderUuid = route.params.contractHeaderUuid;
// Data states
const allServices = ref([]);
const existingServices = ref([]);
const searchTerm = ref('');
const selectedServices = ref([]);
const loading = ref(true);

// Fetch all available services and existing contract services
async function fetchServices() {
  try {
    loading.value = true;
    
    // Fetch existing services in the contract
    const contractResponse = await getContractDetailsByGroup(props.groupUuid, contractHeaderUuid);

    existingServices.value = contractResponse.data?.contractDetails || [];
    
    // Fetch all available services for the group
    const response = await getPayerContractById(props.contractHeaderUuid);
    const allContractServices = response.data?.contractDetails || [];
    
    // Filter out services that are already in the contract
    allServices.value = allContractServices.filter(service => 
      !existingServices.value.some(existing => 
        existing.serviceUuid === service.serviceUuid || 
        existing.drugUuid === service.drugUuid
      )
    );
    
  } catch (error) {
    console.error('Error fetching services:', error);
    toasted(false, 'Failed to load services');
  } finally {
    loading.value = false;
  }
}

// Filter services based on search term
const filteredServices = computed(() => {
  if (!searchTerm.value) {
    return [
      ...existingServices.value.map(s => ({ ...s, isExisting: true })),
      ...allServices.value
    ];
  }
  
  const term = searchTerm.value.toLowerCase();
  return [
    ...existingServices.value
      .filter(s => 
        (s.serviceName && s.serviceName.toLowerCase().includes(term)) ||
        (s.drugName && s.drugName.toLowerCase().includes(term))
      )
      .map(s => ({ ...s, isExisting: true })),
    ...allServices.value
      .filter(s => 
        (s.serviceName && s.serviceName.toLowerCase().includes(term)) ||
        (s.drugName && s.drugName.toLowerCase().includes(term))
      )
  ];
});

// Toggle service selection
function toggleServiceSelection(service) {
  const index = selectedServices.value.findIndex(s => 
    s.serviceUuid === service.serviceUuid || 
    s.drugUuid === service.drugUuid
  );
  
  if (index > -1) {
    selectedServices.value.splice(index, 1);
  } else {
    selectedServices.value.push({
      serviceUuid: service.serviceUuid,
      drugUuid: service.drugUuid,
      negotiatedPrice: service.negotiatedPrice,
      serviceName: service.serviceName || service.drugName,
      isExisting: service.isExisting
    });
  }
}

// Check if service is selected
function isServiceSelected(service) {
  return selectedServices.value.some(s => 
    s.serviceUuid === service.serviceUuid || 
    s.drugUuid === service.drugUuid
  );
}

// Submit selected services
async function submitServices() {
  try {
    // Filter out existing services from the selection (we only want to add new ones)
    const servicesToAdd = selectedServices.value
      .filter(s => !s.isExisting)
      .map(s => ({
        serviceUuid: s.serviceUuid,
        drugUuid: s.drugUuid,
        negotiatedPrice: s.negotiatedPrice
      }));
    
    if (servicesToAdd.length === 0) {
      addToast({
        type: 'info',
        title: 'No Changes',
        message: 'No new services selected to add'
      });
      closeModal();
      return;
    }
    
    const response = await assignServicesToGroup(
      props.groupUuid,
      props.contractHeaderUuid,
      { contractDetails: servicesToAdd }
    );
    
    if (response.success) {
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Services added to contract successfully'
      });
      closeModal(true); // Pass true to indicate success
    } else {
      throw new Error(response.message || 'Failed to add services');
    }
  } catch (error) {
    console.error('Error adding services:', error);
    addToast({
      type: 'error',
      title: 'Error',
      message: error.message || 'Failed to add services to contract'
    });
  }
}

onMounted(() => {
  fetchServices();
});
</script>

<template>
  <ModalParent>
    <NewFormParent
      size="lg"
      title="Add Services to Contract"
      subtitle="Select services to add to this contract"
    >
      <div class="space-y-4">
        <!-- Search input -->
        <div class="relative">
          <Input
            v-model="searchTerm"
            placeholder="Search services..."
            :attributes="{
              'icon-left': 'search',
              class: 'pl-10'
            }"
          />
          <div class="absolute left-3 top-3 text-gray-400">
            <i class="fas fa-search"></i>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center items-center h-40">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>

        <!-- Services table -->
        <div v-else class="overflow-y-auto max-h-96">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service/Drug Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price (ETB)
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="service in filteredServices" 
                :key="service.serviceUuid || service.drugUuid"
                :class="{
                  'bg-blue-50': service.isExisting,
                  'hover:bg-gray-50': !service.isExisting
                }"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    :checked="isServiceSelected(service)"
                    @change="toggleServiceSelection(service)"
                    :disabled="service.isExisting"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ service.serviceName || service.drugName || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ service.serviceName ? 'Service' : 'Drug' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ service.negotiatedPrice?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span 
                    v-if="service.isExisting"
                    class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                  >
                    Already in contract
                  </span>
                  <span 
                    v-else
                    class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                  >
                    Available
                  </span>
                </td>
              </tr>
              <tr v-if="filteredServices.length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                  No services found matching your search
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Action buttons -->
        <div class="flex justify-end gap-4 pt-4">
          <Button @click="closeModal" variant="outline">
            Cancel
          </Button>
          <Button
            @click="submitServices"
            :pending="api.pending.value"
            type="primary"
            :disabled="selectedServices.filter(s => !s.isExisting).length === 0"
          >
            Add Selected Services
          </Button>
        </div>
      </div>
    </NewFormParent>
  </ModalParent>
</template>

<style scoped>
table {
  border-collapse: separate;
  border-spacing: 0;
}

th {
  position: sticky;
  top: 0;
  z-index: 10;
}

tr:last-child td {
  border-bottom: none;
}
</style>