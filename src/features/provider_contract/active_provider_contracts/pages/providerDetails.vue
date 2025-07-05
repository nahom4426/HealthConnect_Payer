<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPayerContractById } from '../api/providerContractApi';
import { toasted } from '@/utils/utils';
import { openModal } from "@customizer/modal-x";
import icons from '@/utils/icons';
import FamilyGroup from '@/features/insured_persons/pages/FamilyGroup.vue';
const router = useRouter();
const route = useRoute();
const contractId = route.params.contractHeaderUuid;

const contractData = ref({
  contractHeaderUuid: "",
  contractNumber: "",
  contractName: "",
  contractDescription: "",
  startDate: "",
  endDate: "",
  status: "",
  contractCode: "",
  providerName: "",
  providerAddress: "",
  contactPersonName: "",
  contactPersonNumber: "",
  totalInsured: 0,
  totalDependants: 0,
  contractDetails: [],
  insuredSummaries: [],
   providerLogoBase64: '',
  employeeGroups: [],
});

// Tab management
const activeTab = ref('employees');

// Employee data and pagination
const employeeSearch = ref('');
const employeeCurrentPage = ref(1);
const employeeRowsPerPage = ref(10);

const filteredEmployees = computed(() => {
  if (!contractData.value.insuredSummaries) return [];
  const searchTerm = employeeSearch.value.toLowerCase();
  return contractData.value.insuredSummaries.filter(e =>
    (e.fullName && e.fullName.toLowerCase().includes(searchTerm)) ||
    (e.membershipNumber && e.membershipNumber.toLowerCase().includes(searchTerm))
  );
});

const employeeStart = computed(() => (employeeCurrentPage.value - 1) * employeeRowsPerPage.value);
const employeeEnd = computed(() => employeeStart.value + employeeRowsPerPage.value);
const employeeTotalPages = computed(() => Math.ceil(filteredEmployees.value.length / employeeRowsPerPage.value));

const paginatedEmployees = computed(() => {
  return filteredEmployees.value.slice(employeeStart.value, employeeEnd.value);
});

const nextEmployeePage = () => {
  if (employeeCurrentPage.value < employeeTotalPages.value) employeeCurrentPage.value++;
};
const prevEmployeePage = () => {
  if (employeeCurrentPage.value > 1) employeeCurrentPage.value--;
};

// Services data
const serviceSearch = ref('');
const filteredServices = computed(() => {
  if (!contractData.value.contractDetails) return [];
  const searchTerm = serviceSearch.value.toLowerCase();
  return contractData.value.contractDetails.filter(s =>
    (s.serviceName && s.serviceName.toLowerCase().includes(searchTerm)) ||
    (s.drugName && s.drugName.toLowerCase().includes(searchTerm))
  );
});

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'Invalid Date';
  }
};

const getInitials = (name) => {
  if (!name) return '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

// Fetch contract data
const loadingContract = ref(false);
const error = ref(null);

async function fetchContract() {
  try {
    loadingContract.value = true;
    const response = await getPayerContractById(contractId);
    
    if (response && response.data) {
      contractData.value = {
        ...response.data,
        providerAddress: response.data.providerAddress || 'Arada, Around Semen City Hall, Addis Ababa', // Default if not provided
        contactPersonName: response.data.contactPersonName || 'Birhane Araya', // Default if not provided
        contactPersonNumber: response.data.contactPersonNumber || '+251 945065432', // Default if not provided
        contractDetails: response.data.contractDetails || [],
        insuredSummaries: response.data.insuredSummaries || [],
        employeeGroups: response.data.employeeGroups || [],
      };
    } else {
      throw new Error('Contract data not found in response');
    }
  } catch (err) {
    console.error('Error fetching contract:', err);
    error.value = 'Failed to load contract data';
    toasted(false, 'Failed to load contract data');
    // router.push('/payer_contracts');
  } finally {
    loadingContract.value = false;
  }
}

onMounted(async () => {
  await fetchContract();
});

const handleMembersAdded = (newData) => {
  // Create a deep copy of the current data
  const updatedData = JSON.parse(JSON.stringify(contractData.value));
  
  // Add new members to the insuredSummaries array
  newData.insuredSummaries.forEach(newMember => {
    if (!updatedData.insuredSummaries.some(m => m.insuredUuid === newMember.insuredUuid)) {
      updatedData.insuredSummaries.push(newMember);
    }
  });

  // Update the totals
  updatedData.totalInsured += newData.totalInsured;
  updatedData.totalDependants += newData.totalDependants;

  // Reactively update the contract data
  contractData.value = updatedData;
  
  // Force recomputation of filtered/paginated employees
  employeeCurrentPage.value = 1;
};

// Update the modal opening function


function handleRemoveWithClose(id) {
  console.log('Remove:', id);
}

function handleActivateWithClose(id) {
  console.log('Activate:', id);
}

function handleDeactivateWithClose(id) {
  console.log('Deactivate:', id);
}
const toggleDropdown = (event, id) => {
  const dropdown = document.getElementById(`dropdown-${id}`);
  if (dropdown) {
    // Close all other dropdowns first
    document.querySelectorAll('.dropdown-menu').forEach(el => {
      if (el.id !== `dropdown-${id}`) {
        el.classList.add('hidden');
      }
    });
    dropdown.classList.toggle('hidden');
  }
};

// Close dropdowns when clicking outside
onMounted(() => {
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown-container')) {
      document.querySelectorAll('.dropdown-menu').forEach(el => {
        el.classList.add('hidden');
      });
    }
  });
});
</script>

<template>
  <div v-if="loadingContract" class="flex justify-center items-center h-64">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <span class="ml-2 text-gray-700 font-medium">Loading contract data...</span>
  </div>

  <div v-else class="p-6 space-y-6 bg-white rounded-lg">
    <!-- Header -->
    <div class="flex items-center justify-between rounded-lg bg-primary p-6 text-white">
      <div class="flex items-center gap-4">
         <div class="w-20 h-20 flex items-center justify-center  rounded-lg ">
  <img 
    v-if="contractData.providerLogoBase64" 
    :src="contractData.providerLogoBase64" 
    alt="Provider Logo" 
    class="w-full h-full object-contain p-4"
    @error="handleImageError"
  />
  <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
</div>
        <div>
          <h1 class="text-xl font-semibold">{{ contractData.providerName || 'N/A Provider' }}</h1>
          <p class="text-sm">Pharmacy</p>
        </div>
      </div>
      <button class="btn btn-primary bg-white font-normal text-sm px-2 py-2">View Contract Document</button>
    </div>

    <!-- Provider and Contract Detail -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F6F7FA] p-6 rounded-lg shadow-md">
      <div class="bg-white rounded-lg p-6 text-[#373946] space-y-4 shadow-sm">
        <h2 class="text-[#75778B] font-semibold text-lg border-b pb-4">Provider Detail</h2>
        
        <div class="flex justify-between text-sm">
          <span class="text-[#75778B]">Provider legal name:</span>
          <span class="font-medium">{{ contractData.providerName || 'N/A' }}</span>
        </div>
        
        <div class="flex justify-between text-sm">
          <span class="text-[#75778B]">Address:</span>
          <span class="font-medium text-right">{{ contractData.providerAddress || 'N/A' }}</span>
        </div>

        <div class="grid grid-cols-2 gap-4 pt-2 text-sm">
          <div class="flex justify-between border-r pr-4">
            <span class="text-[#75778B]">Contact Person:</span>
            <span class="font-medium">{{ contractData.contactPersonName || 'N/A' }}</span>
          </div>
          <div class="flex justify-between pl-4">
            <span class="text-[#75778B]">Contact Number:</span>
            <span class="font-medium">{{ contractData.contactPersonNumber || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg p-6 text-[#373946] space-y-4 shadow-sm">
        <h2 class="text-[#75778B] font-semibold text-lg border-b pb-4">Contract Detail</h2>

        <div class="grid grid-cols-2 gap-4 text-sm border- pb-4">
          <div class="flex justify-between border-r pr-2">
            <span class="text-[#75778B]">Contract ID:</span>
          <span class="font-medium col-span-1">{{ contractData.contractCode || 'N/A' }}</span>
          </div>
          <div class="flex justify-between">
          <span class="text-[#75778B]">Contract Status:</span>
          <span
            :class="[
              'font-medium',
              {
                'text-green-600': contractData.status === 'ACTIVE',
                'text-red-600': contractData.status === 'INACTIVE',
                'text-yellow-600': contractData.status === 'PENDING',
              }
            ]"
          >
            {{ contractData.status || 'N/A' }}
          </span>
        </div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm  pb-4">
          <div class="flex justify-between border-r pr-2">
            <span class="text-[#75778B]">Contract From:</span>
            <span class="font-medium">{{ formatDate(contractData.startDate) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#75778B]">Contract To:</span>
            <span class="font-medium">{{ formatDate(contractData.endDate) }}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="flex justify-between">
            <span class="text-[#75778B]">Number of Employees:</span>
            <span class="font-medium">{{ contractData.totalInsured ?? 0 }}</span>
          </div>
          <!-- <div class="flex justify-between">
            <span class="text-[#75778B]">Employee Groups:</span>
            <span class="font-medium">{{ contractData.employeeGroups?.length ?? 0 }}</span> 
          </div> -->
        </div>
      </div>
    </div>

    <div class="bg-[#F6F7FA] p-6 rounded-md">
      <div class="flex justify-between items-center mb-4">
        <div class="flex bg-white rounded overflow-hidden border">
          <button
            @click="activeTab = 'employees'"
            :class="[
              'px-6 py-3 text-sm font-medium',
              activeTab === 'employees'
                ? 'bg-[#75778B] text-white'
                : 'text-[#75778B] hover:bg-gray-100'
            ]"
          >
            Employees ({{ contractData.totalInsured ?? 0 }})
          </button>
          <!-- <button
            @click="activeTab = 'groups'"
            :class="[
              'px-6 py-3 text-sm font-medium',
              activeTab === 'groups'
                ? 'bg-[#75778B] text-white'
                : 'text-[#75778B] hover:bg-gray-100'
            ]"
          >
            Employee Groups ({{ contractData.employeeGroups?.length ?? 0 }})
          </button> -->
          <button
            @click="activeTab = 'services'"
            :class="[
              'px-6 py-3 text-sm font-medium',
              activeTab === 'services'
                ? 'bg-[#75778B] text-white'
                : 'text-[#75778B] hover:bg-gray-100'
            ]"
          >
            Services ({{ contractData.contractDetails?.length ?? 0 }})
          </button>
        </div>

   


      </div>

      <div v-if="activeTab === 'employees'" class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex justify-end mb-4">
          <input
            v-model="employeeSearch"
            type="text"
            placeholder="Search employees"
            class="w-full md:w-[400px] px-4 py-3 bg-[#F6F7FA] text-sm border border-gray-300 rounded-md"
          />
        </div>

        <table class="w-full table-auto text-sm">
          <thead class="text-[#75778B] text-left border-b">
            <tr>
              <th class="py-3">#</th>
              <th class="py-3">Photo</th>
              <th class="py-3">Insured ID</th>
              <th class="py-3">Full Name</th>
              <th class="py-3">Dependents</th>
              <th class="py-3">Role</th>
              <th class="py-3">Employee Group</th>
              <th class="py-3">Status</th>
              <th class="py-3">Action</th>
            </tr>
          </thead>
          <tbody class="text-[#373946]">
            <tr
              v-for="(employee, index) in paginatedEmployees"
              :key="employee.insuredUuid"
              class="border-b hover:bg-gray-50"
            >
              <td class="py-3">{{ index + employeeStart + 1 }}</td>
              <td class="py-3">
                <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span class="text-xs">{{ getInitials(employee.fullName) }}</span>
                </div>
              </td>
              <td class="py-3">{{ employee.membershipNumber || 'N/A' }}</td>
              <td class="py-3">{{ employee.fullName || 'N/A' }}</td>
              <td class="py-3">{{ employee.dependants?.length ?? 0 }}</td>
              <td class="py-3">Employee</td>
              <td class="py-3">Standard</td>
              <td class="py-3">
                <span
                  class="bg-[#D6F3EF] text-[#007E73] px-3 py-1 rounded-md text-xs font-medium"
                >
                  Active
                </span>
              </td>
              <td class="py-3 text-left">
  <div class="dropdown-container relative">
    <button 
      @click.stop="toggleDropdown($event, employee.insuredUuid)"
      class="inline-flex items-center justify-center p-2 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none"
      type="button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    </button>

    <div 
      :id="`dropdown-${employee.insuredUuid}`"
      class="dropdown-menu hidden absolute right-0 z-10 w-44 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
    >
      <div class="py-1" role="none">
        <button 
          @click.stop="handleAddDependantsWithClose(employee)"
          class="block w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <div class="flex items-center gap-2">
            <i v-html="icons.add" class="w-4 h-4"></i>
            Add Dependent
          </div>
        </button>
        
        <button 
          @click.stop="handleRemoveWithClose(employee.insuredUuid)"
          class="block w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <div class="flex items-center gap-2">
            <i v-html="icons.remove" class="w-4 h-4"></i>
            Remove
          </div>
        </button>
        
        <template v-if="employee.status">
          <button 
            v-if="employee.status === 'INACTIVE' || employee.status === 'Inactive'"
            @click.stop="handleActivateWithClose(employee.insuredUuid)"
            class="block w-full text-start px-4 py-2 text-sm text-[#28A745] hover:bg-gray-100"
          >
            <div class="flex items-center gap-2">
              <i v-html="icons.activate" class="w-4 h-4"></i>
              Activate
            </div>
          </button>
          
          <button 
            v-if="employee.status === 'ACTIVE' || employee.status === 'Active'"
            @click.stop="handleDeactivateWithClose(employee.insuredUuid)"
            class="block w-full text-start px-4 py-2 text-sm text-[#DB2E48] hover:bg-gray-100"
          >
            <div class="flex items-center gap-2">
              <i v-html="icons.deactivate" class="w-4 h-4"></i>
              Deactivate
            </div>
          </button>
        </template>
      </div>
    </div>
  </div>
</td>
            </tr>
            <tr v-if="paginatedEmployees.length === 0">
              <td colspan="9" class="py-3 text-center text-gray-500">No employees found.</td>
            </tr>
          </tbody>
        </table>

        <div class="flex justify-between items-center mt-6 text-sm text-[#75778B]">
          <div class="flex items-center">
            <span class="mr-2">Showing</span>
            <select v-model="employeeRowsPerPage" class="border rounded-md px-2 py-1 text-sm">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <div>
            Showing {{ employeeStart + 1 }} to
            {{ Math.min(employeeEnd, filteredEmployees.length) }} out of
            {{ filteredEmployees.length }} records
          </div>
          <div class="flex items-center space-x-1">
            <button
              @click="prevEmployeePage"
              :disabled="employeeCurrentPage === 1"
              class="px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-30"
            >
              &lt;
            </button>
            <button
              v-for="page in employeeTotalPages"
              :key="page"
              @click="employeeCurrentPage = page"
              :class="[
                'px-3 py-1 rounded',
                employeeCurrentPage === page
                  ? 'bg-[#007E73] text-white'
                  : 'hover:bg-gray-100'
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="nextEmployeePage"
              :disabled="employeeCurrentPage === employeeTotalPages"
              class="px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-30"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'groups'" class="bg-white p-6 rounded-lg shadow-sm">
        <!-- <h3 class="text-lg font-semibold mb-4">Employee Groups for this Contract</h3>
        <p class="text-gray-600">
          Currently, there are {{ contractData.employeeGroups?.length ?? 0 }} employee groups.
        </p> -->
        <!-- <FamilyGroup /> -->
        <!-- <div v-if="contractData.employeeGroups?.length > 0">
          <table class="w-full table-auto text-sm mt-4">
            <thead class="text-[#75778B] text-left border-b">
              <tr>
                <th class="py-3">#</th>
                <th class="py-3">Group Name</th>
                <th class="py-3">Employees in Group</th>
                <th class="py-3">Status</th>
              </tr>
            </thead>
            <tbody class="text-[#373946]">
              <tr v-for="(group, gIndex) in contractData.employeeGroups" :key="group.uuid || gIndex" class="border-b hover:bg-gray-50">
                <td class="py-3">{{ gIndex + 1 }}</td>
                <td class="py-3">{{ group.name || 'N/A' }}</td>
                <td class="py-3">{{ group.employeeCount ?? 0 }}</td>
                <td class="py-3">
                  <span
                    :class="[
                      'px-3 py-1 rounded-md text-xs font-medium',
                      {
                        'bg-[#D6F3EF] text-[#007E73]': group.status === 'Active',
                        'bg-red-100 text-red-700': group.status === 'Inactive'
                      }
                    ]"
                  >
                    {{ group.status || 'N/A' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="py-3 text-center text-gray-500">No employee groups found.</div> -->
      </div>

      <div v-if="activeTab === 'services'" class="bg-white p-6 rounded-lg shadow-sm">
        <div class="flex justify-end mb-4">
          <input
            v-model="serviceSearch"
            type="text"
            placeholder="Search services"
            class="w-full md:w-[400px] px-4 py-3 bg-[#F6F7FA] text-sm border border-gray-300 rounded-md"
          />
        </div>

        <table class="w-full table-auto text-sm">
          <thead class="text-[#75778B] text-left border-b">
            <tr>
              <th class="py-3">#</th>
              <th class="py-3">Service Name / Drug Name</th>
              <th class="py-3">Negotiated Price (ETB)</th>
              <th class="py-3">Action</th>
            </tr>
          </thead>
          <tbody class="text-[#373946]">
            <tr
              v-for="(service, index) in filteredServices"
              :key="service.contractDetailUuid || index"
              class="border-b hover:bg-gray-50"
            >
              <td class="py-3">{{ index + 1 }}</td>
              <td class="py-3">{{ service.serviceName || service.drugName || 'N/A' }}</td>
              <td class="py-3">ETB {{ service.negotiatedPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00' }}</td>
              <td class="py-3 text-right">
                <button class="text-gray-500 hover:text-gray-700">
                  <i class="fas fa-ellipsis-v"></i>
                </button>
              </td>
            </tr>
            <tr v-if="filteredServices.length === 0">
              <td colspan="4" class="py-3 text-center text-gray-500">No services or drugs found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tab {
  padding: 0.5rem 1rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
}
.tab-active {
  background-color: white;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.btn {
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
}
.btn-primary {
  background-color: white;
  color: #3b82f6;
}
.btn-primary:hover {
  background-color: white;
}
.btn-secondary {
  background-color: #e5e7eb;
  color: #1f2937;
}
.btn-secondary:hover {
  background-color: #d1d5db;
}
</style>