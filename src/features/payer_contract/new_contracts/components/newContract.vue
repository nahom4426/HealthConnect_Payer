<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { getAllServices } from "@/features/service/api/serviceApi";
import { getAllDrugs } from "@/features/service/api/drugApi";
import { getAllProviders } from "@/features/providers/api/providerApi";
import Select from "@/components/new_form_elements/Select.vue";

interface Provider {
  providerUuid: string;
  providerName: string;
  threeDigitAcronym: string;
  email: string;
  telephone?: string;
}

interface Service {
  id: string;
  serviceUuid: string;
  name: string;
  description: string;
  providerPrice: number;
  userPrice: number;
}

interface Drug {
  id: string;
  drugUuid: string;
  name: string;
  description: string;
  providerPrice: number;
  userPrice: number;
}

const providers = ref<Provider[]>([]);
const selectedProvider = ref<string | null>(null);
const startDate = ref<string>("");
const endDate = ref<string>("");

const activeTab = ref<"services" | "drugs">("services");
const selectedTab = ref<"services" | "drugs">("services");
const services = ref<Service[]>([]);
const drugs = ref<Drug[]>([]);
const selectedItems = ref<Array<Service | Drug>>([]);

const searchQuery = ref<string>("");
const rowsPerPage = ref<number>(5);
const currentPage = ref<number>(1);
const fetchPending = ref(false);
const error = ref<string | null>(null);

const providerOptions = computed(() => {
  return providers.value.map((provider) => ({
    label: `${provider.providerName} (${provider.threeDigitAcronym})`,
    value: provider.providerUuid,
  }));
});

async function fetchProviders() {
  try {
    fetchPending.value = true;
    error.value = null;
    const response = await getAllProviders({ page: 1, limit: 100 });

    if (!response?.data?.content || !Array.isArray(response.data.content)) {
      throw new Error("Invalid data format: missing content array");
    }

    providers.value = response.data.content.map((item) => ({
      providerUuid: item.providerUuid,
      providerName: item.providerName,
      threeDigitAcronym: item.threeDigitAcronym,
      email: item.email,
      telephone: item.telephone,
    }));

    if (providers.value.length === 0) {
      error.value = "No providers available";
    }
  } catch (err) {
    console.error("Error fetching providers:", err);
    error.value = "Failed to load providers. Please try again.";
  } finally {
    fetchPending.value = false;
  }
}

async function fetchServices() {
  if (!selectedProvider.value) return;

  try {
    fetchPending.value = true;
    const response = await getAllServices(selectedProvider.value);

    console.log("Raw services response:", response); // Debug log

    // Handle different possible response structures
    let servicesData = [];
    if (Array.isArray(response)) {
      // Response is directly an array
      servicesData = response;
    } else if (response?.data?.content) {
      // Response has data.content structure
      servicesData = response.data.content;
    } else if (response?.content) {
      // Response has content structure
      servicesData = response.content;
    } else {
      throw new Error("Unexpected services response format");
    }

    services.value = servicesData.map((service: any) => ({
      id: service.serviceUuid,
      serviceUuid: service.serviceUuid,
      name: service.serviceName,
      description:
        service.serviceCategory || service.description || "No description",
      providerPrice: service.price || 0,
      userPrice: service.price || 0,
    }));

    console.log("Mapped services:", services.value); // Debug log
  } catch (err) {
    console.error("Error fetching services:", err);
    services.value = [];
    error.value = "Failed to load services. Please try again.";
  } finally {
    fetchPending.value = false;
  }
}

async function fetchDrugs() {
  if (!selectedProvider.value) return;

  try {
    fetchPending.value = true;
    const response = await getAllDrugs(selectedProvider.value);

    console.log("Raw drugs response:", response); // Debug log

    // Handle different possible response structures
    let drugsData = [];
    if (Array.isArray(response)) {
      drugsData = response;
    } else if (response?.data?.content) {
      drugsData = response.data.content;
    } else if (response?.content) {
      drugsData = response.content;
    } else {
      throw new Error("Unexpected drugs response format");
    }

    drugs.value = drugsData.map((drug: any) => ({
      id: drug.drugUuid,
      drugUuid: drug.drugUuid,
      name: drug.drugName,
      description: drug.category || drug.description || "No description",
      providerPrice: drug.price || 0,
      userPrice: drug.price || 0,
    }));

    console.log("Mapped drugs:", drugs.value); // Debug log
  } catch (err) {
    console.error("Error fetching drugs:", err);
    drugs.value = [];
    error.value = "Failed to load drugs. Please try again.";
  } finally {
    fetchPending.value = false;
  }
}

// Watch for provider selection changes
watch(selectedProvider, (newProviderUuid) => {
  if (newProviderUuid) {
    // Clear previous selections when provider changes
    selectedItems.value = [];
    // Fetch both services and drugs for the new provider
    fetchServices();
    fetchDrugs();
  } else {
    // Clear data if no provider selected
    services.value = [];
    drugs.value = [];
    selectedItems.value = [];
  }
});

// Watch for search query changes
let searchTimeout: number;
watch(searchQuery, (newQuery) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentPage.value = 1; // Reset to first page when searching
  }, 300);
});

const items = computed(() =>
  activeTab.value === "services" ? services.value : drugs.value
);

const filteredItems = computed(() => {
  const filtered = items.value.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filtered.slice(start, start + rowsPerPage.value);
});

const totalPages = computed(() =>
  Math.ceil(filteredItems.value.length / rowsPerPage.value)
);

const areAllItemsSelected = computed(() =>
  filteredItems.value.every((item) =>
    selectedItems.value.some((sel) => sel.id === item.id)
  )
);

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

function toggleAllItems() {
  if (areAllItemsSelected.value) {
    selectedItems.value = selectedItems.value.filter(
      (item) => !filteredItems.value.some((fi) => fi.id === item.id)
    );
  } else {
    const ids = selectedItems.value.map((i) => i.id);
    filteredItems.value.forEach((item) => {
      if (!ids.includes(item.id)) {
        selectedItems.value.push(item);
      }
    });
  }
}

function editPrices() {
  // Implement price editing logic here
  alert("Price editing functionality will be implemented here");
}

async function submit() {
  if (!selectedProvider.value) {
    alert("Please select a provider first");
    return;
  }

  if (selectedItems.value.length === 0) {
    alert("Please select at least one service or drug");
    return;
  }

  try {
    const payload = {
      providerUuid: selectedProvider.value,
      startDate: startDate.value,
      endDate: endDate.value,
      items: selectedItems.value,
    };
    console.log("Submitting contract:", payload);
    alert("Contract would be submitted here");
  } catch (error) {
    console.error("Submission failed:", error);
    alert("Submission failed. Please try again.");
  }
}

const tabStyle = "px-6 py-3 text-[#75778B] bg-white hover:bg-gray-100 text-sm";
const activeTabStyle = "px-6 py-3 text-white bg-[#75778B] font-medium text-sm";

onMounted(async () => {
  await fetchProviders();
});
</script>

<template>
  <div class="bg-white rounded-md p-6 space-y-6">
    <!-- Provider and Date Inputs -->
    <div class="grid md:grid-cols-2 gap-6">
      <Select
        :obj="true"
        name="provider"
        label="Select Provider"
        validation="required"
        :options="providerOptions"
        :disabled="fetchPending"
        :attributes="{
          placeholder: 'Search and select provider',
        }"
        v-model="selectedProvider"
      />
      <div class="flex gap-6">
        <div class="w-1/2">
          <label class="block text-sm font-medium text-base-clr mb-1">
            Start date
          </label>
          <input
            type="date"
            class="w-full bg-base-clr3 h-7 pl-3 py-3 rounded border border-base-clr/30"
            v-model="startDate"
          />
        </div>
        <div class="w-1/2">
          <label class="block text-sm font-medium text-base-clr mb-1">
            End date
          </label>
          <input
            type="date"
            class="w-full h-7 pl-3 bg-base-clr3 py-3 rounded border border-base-clr/30"
            v-model="endDate"
          />
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
      {{ error }}
    </div>

    <!-- Tab Navigation -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-gray-900">
        Provider Services and Drugs
      </h3>
      <div class="flex border rounded overflow-hidden">
        <button
          @click="activeTab = 'services'"
          :class="activeTab === 'services' ? activeTabStyle : tabStyle"
        >
          Services
        </button>
        <button
          @click="activeTab = 'drugs'"
          :class="activeTab === 'drugs' ? activeTabStyle : tabStyle"
        >
          Drugs
        </button>
      </div>
    </div>

    <!-- Search and Edit Button -->
    <div class="relative bg-gray-100 p-4 rounded">
      <input
        type="text"
        class="w-full p-3 rounded border border-gray-300"
        :placeholder="`Search and Select ${
          activeTab === 'services' ? 'Services' : 'Drugs'
        }`"
        v-model="searchQuery"
      />
      <div class="text-center mt-4">
        <button
          class="text-sm text-white bg-[#75778B] px-4 py-2 rounded hover:bg-gray-600"
          @click="editPrices"
        >
          If you want to negotiate prices of services and drugs,
          <strong>Click here</strong>
        </button>
      </div>
    </div>

    <!-- Main Table and Selected Preview -->
    <div class="grid md:grid-cols-3 gap-6">
      <!-- Left: Selectable List (2/3 width) -->
      <div class="md:col-span-2 bg-white rounded border border-gray-200">
        <div v-if="fetchPending" class="p-4 text-center">
          <span class="animate-pulse">Loading {{ activeTab }}...</span>
        </div>
        <template v-else>
          <table class="w-full table-auto text-sm">
            <thead>
              <tr class="text-left bg-gray-100 text-gray-600">
                <th class="p-3">
                  <input
                    type="checkbox"
                    @change="toggleAllItems"
                    :checked="areAllItemsSelected"
                    class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                </th>
                <th class="p-3">#</th>
                <th class="p-3">
                  {{ activeTab === "services" ? "Service" : "Drug" }} Name
                </th>
                <th class="p-3">Description</th>
                <th class="p-3">Provider Price</th>
                <th class="p-3">Your Price</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in filteredItems"
                :key="item.id"
                class="border-b hover:bg-gray-50"
              >
                <td class="p-3">
                  <input
                    type="checkbox"
                    :checked="selectedItems.some((sel) => sel.id === item.id)"
                    @change="
                      selectedItems.some((sel) => sel.id === item.id)
                        ? (selectedItems = selectedItems.filter(
                            (sel) => sel.id !== item.id
                          ))
                        : selectedItems.push(item)
                    "
                    class="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                </td>
                <td class="p-3">{{ index + 1 }}</td>
                <td class="p-3">{{ item.name }}</td>
                <td class="p-3">{{ item.description }}</td>
                <td class="p-3">
                  ETB {{ item.providerPrice.toLocaleString() }}
                </td>
                <td class="p-3">ETB {{ item.userPrice.toLocaleString() }}</td>
              </tr>
              <tr v-if="filteredItems.length === 0">
                <td colspan="6" class="p-4 text-center text-gray-500">
                  No {{ activeTab }} found
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="flex justify-between items-center p-3 text-sm border-t">
            <div>
              Showing
              <select
                v-model="rowsPerPage"
                class="border rounded px-2 py-1 mx-1"
                @change="currentPage = 1"
              >
                <option v-for="n in [5, 10, 20]" :key="n" :value="n">
                  {{ n }}
                </option>
              </select>
              <span
                >Showing {{ (currentPage - 1) * rowsPerPage + 1 }} to
                {{ Math.min(currentPage * rowsPerPage, filteredItems.length) }}
                out of {{ filteredItems.length }} records</span
              >
            </div>
            <div class="flex items-center gap-1">
              <button
                @click="prevPage"
                :disabled="currentPage === 1"
                class="px-3 py-1 border rounded"
              >
                &lt;
              </button>
              <span v-for="n in totalPages" :key="n">
                <button
                  :class="[
                    'px-3 py-1 border rounded',
                    currentPage === n
                      ? 'bg-[#75778B] text-white'
                      : 'hover:bg-gray-100',
                  ]"
                  @click="currentPage = n"
                >
                  {{ n }}
                </button>
              </span>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 border rounded"
              >
                &gt;
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- Right: Selected Items (1/3 width) -->
      <div class="bg-teal-50 p-4 rounded-md border border-teal-200">
        <h3 class="text-gray-700 text-lg font-medium mb-3">
          Selected Services / Drugs
        </h3>
        <div class="flex gap-2 mb-4">
          <button
            @click="selectedTab = 'services'"
            :class="[
              'px-4 py-2 rounded text-sm',
              selectedTab === 'services'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-700 border',
            ]"
          >
            Services
          </button>
          <button
            @click="selectedTab = 'drugs'"
            :class="[
              'px-4 py-2 rounded text-sm',
              selectedTab === 'drugs'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-700 border',
            ]"
          >
            Drugs
          </button>
        </div>
        <table class="text-sm w-full">
          <thead>
            <tr class="border-b">
              <th class="text-left p-2">#</th>
              <th class="text-left p-2">Name</th>
              <th class="text-left p-2">Price</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, idx) in selectedItems.filter((item) =>
                selectedTab === 'services'
                  ? 'serviceUuid' in item
                  : 'drugUuid' in item
              )"
              :key="item.id"
              class="border-b"
            >
              <td class="p-2">{{ idx + 1 }}</td>
              <td class="p-2">{{ item.name }}</td>
              <td class="p-2">ETB {{ item.userPrice.toLocaleString() }}</td>
            </tr>
            <tr
              v-if="
                selectedItems.filter((item) =>
                  selectedTab === 'services'
                    ? 'serviceUuid' in item
                    : 'drugUuid' in item
                ).length === 0
              "
            >
              <td colspan="3" class="p-4 text-center text-gray-500">
                No {{ selectedTab }} selected
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="text-right">
      <button
        @click="submit"
        class="bg-[#146C5C] text-white px-6 py-3 rounded hover:bg-green-800 transition"
      >
        Submit Contract
      </button>
    </div>
  </div>
</template>

<style scoped>
input[type="checkbox"] {
  @apply h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded;
}

input[type="date"],
input[type="text"],
select {
  @apply border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-md shadow-sm;
}

button:disabled {
  @apply opacity-50 cursor-not-allowed;
}

table {
  @apply min-w-full divide-y divide-gray-200;
}

th {
  @apply py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

td {
  @apply py-4 whitespace-nowrap;
}
</style>
