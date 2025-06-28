<template>
  <div class="p-6 space-y-6 bg-white rounded-lg">
    <!-- Header -->
    <div class="flex items-center justify-between rounded-lg bg-primary p-6 text-white">
      <div class="flex items-center gap-4">
        <div>
          <h1 class="text-xl font-semibold">Kenema Pharmacy Enterprise</h1>
          <p class="text-sm ">Pharmacy</p>
        </div>
      </div>
      <button class="btn btn-primary bg-white font-normal text-sm px-2 py-2 ">View Contract Document</button>
    </div>

    <!-- Provider and Contract Detail -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F6F7FA] p-6 rounded-lg shadow-md">
  <!-- Provider Detail -->
  <div class="bg-white rounded-lg p-6 text-[#373946] space-y-4 shadow-sm">
    <h2 class="text-[#75778B] font-semibold text-lg border-b pb-4">Provider Detail</h2>
    
    <div class="flex justify-between text-sm">
      <span class="text-[#75778B]">Provider legal name:</span>
      <span class="font-medium">Kenema Pharmacy Enterprises</span>
    </div>
    
    <div class="flex justify-between text-sm">
      <span class="text-[#75778B]">Address:</span>
      <span class="font-medium text-right">Arada, Around Semen City Hall, Addis Ababa</span>
    </div>

    <div class="grid grid-cols-2 gap-4 pt-2 text-sm">
      <div class="flex justify-between border-r pr-4">
        <span class="text-[#75778B]">Contact Person:</span>
        <span class="font-medium">Birhane Araya</span>
      </div>
      <div class="flex justify-between pl-4">
        <span class="text-[#75778B]">Contact Number:</span>
        <span class="font-medium">+251 945065432</span>
      </div>
    </div>
  </div>

  <!-- Contract Detail -->
  <div class="bg-white rounded-lg p-6 text-[#373946] space-y-4 shadow-sm">
    <h2 class="text-[#75778B] font-semibold text-lg border-b pb-4">Contract Detail</h2>

    <div class="grid grid-cols-4 gap-2 text-sm border-b pb-4">
      <span class="text-[#75778B]">Contract ID:</span>
      <span class="font-medium col-span-1">Birhane Araya</span>
      <span class="text-[#75778B]">Contract Status:</span>
      <span class="font-medium text-green-600">Active</span>
    </div>

    <div class="grid grid-cols-2 gap-4 text-sm border-b pb-4">
      <div class="flex justify-between">
        <span class="text-[#75778B]">Contract From:</span>
        <span class="font-medium">May 11 2024</span>
      </div>
      <div class="flex justify-between">
        <span class="text-[#75778B]">Contract To:</span>
        <span class="font-medium">May 10 2025</span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 text-sm">
      <div class="flex justify-between">
        <span class="text-[#75778B]">Number of Employees:</span>
        <span class="font-medium">234</span>
      </div>
      <div class="flex justify-between">
        <span class="text-[#75778B]">Employee Groups:</span>
        <span class="font-medium">4</span>
      </div>
    </div>
  </div>
</div>


    <!-- Tabs -->

  <div class="bg-[#F6F7FA] p-6 rounded-md">
    <!-- Tabs and Add Button -->
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
          Employees (3)
        </button>
        <button
          @click="activeTab = 'groups'"
          :class="[
            'px-6 py-3 text-sm font-medium',
            activeTab === 'groups'
              ? 'bg-[#75778B] text-white'
              : 'text-[#75778B] hover:bg-gray-100'
          ]"
        >
          Employee Groups
        </button>
        <button
          @click="activeTab = 'services'"
          :class="[
            'px-6 py-3 text-sm font-medium',
            activeTab === 'services'
              ? 'bg-[#75778B] text-white'
              : 'text-[#75778B] hover:bg-gray-100'
          ]"
        >
          Services (123)
        </button>
      </div>

      <button class="bg-[#007E73] hover:bg-[#005f58] text-white px-5 py-2 rounded-md text-sm">
        {{ activeTab === 'groups' ? 'Add Group' : 'Add Employee' }}
      </button>
    </div>

    <!-- Employee Table -->
    <div v-if="activeTab === 'employees'" class="bg-white p-6 rounded-lg shadow-sm">
      <!-- Search -->
      <div class="flex justify-end mb-4">
        <input
          v-model="employeeSearch"
          type="text"
          placeholder="Search employees"
          class="w-full md:w-[400px] px-4 py-3 bg-[#F6F7FA] text-sm border border-gray-300 rounded-md"
        />
      </div>

      <!-- Table -->
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
            :key="employee.id"
            class="border-b hover:bg-gray-50"
          >
            <td class="py-3">{{ index + 1 }}</td>
            <td class="py-3">
              <img
                :src="employee.photo"
                class="w-10 h-10 rounded-full object-cover"
                alt="employee"
              />
            </td>
            <td class="py-3">{{ employee.insuredId }}</td>
            <td class="py-3">{{ employee.fullName }}</td>
            <td class="py-3">{{ employee.dependents }}</td>
            <td class="py-3">{{ employee.role }}</td>
            <td class="py-3">{{ employee.group }}</td>
            <td class="py-3">
              <span
                class="bg-[#D6F3EF] text-[#007E73] px-3 py-1 rounded-md text-xs font-medium"
              >
                {{ employee.status }}
              </span>
            </td>
            <td class="py-3 text-right">
              <button class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-ellipsis-v"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="flex justify-between items-center mt-6 text-sm text-[#75778B]">
        <div class="flex items-center">
          <span class="mr-2">Showing</span>
          <select v-model="employeeRowsPerPage" class="border rounded-md px-2 py-1 text-sm">
            <option value="10">10</option>
            <option value="20">20</option>
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
  </div>


  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Tab management
const activeTab = ref('employees')

// Employee data and pagination
const employeeSearch = ref('')
const employeeCurrentPage = ref(1)
const employeeRowsPerPage = ref(10)

const employees = ref([
  {
    id: 1,
    insuredId: 'HCJ-234128973',
    fullName: 'Birhane Araya Mebrahimu',
    dependents: 12,
    role: 'Human Resource',
    group: 'C-Level',
    status: 'Active',
  },
  {
    id: 2,
    insuredId: 'HCJ-234432578',
    fullName: 'Girmay Lemma Birhanu',
    dependents: 5,
    role: 'Accountant',
    group: 'Standard',
    status: 'Active',
  },
  {
    id: 3,
    insuredId: 'HCJ-234189504',
    fullName: 'Nahom Alemseged',
    dependents: 6,
    role: 'Project Manager',
    group: 'Management',
    status: 'Active',
  },
])

const filteredEmployees = computed(() => {
  return employees.value.filter(e =>
    e.fullName.toLowerCase().includes(employeeSearch.value.toLowerCase()) ||
    e.insuredId.toLowerCase().includes(employeeSearch.value.toLowerCase())
  )
})

const employeeStart = computed(() => (employeeCurrentPage.value - 1) * employeeRowsPerPage.value)
const employeeEnd = computed(() => employeeStart.value + employeeRowsPerPage.value)
const employeeTotalPages = computed(() => Math.ceil(filteredEmployees.value.length / employeeRowsPerPage.value))

const paginatedEmployees = computed(() => {
  return filteredEmployees.value.slice(employeeStart.value, employeeEnd.value)
})

const nextEmployeePage = () => {
  if (employeeCurrentPage.value < employeeTotalPages.value) employeeCurrentPage.value++
}
const prevEmployeePage = () => {
  if (employeeCurrentPage.value > 1) employeeCurrentPage.value--
}

// Group data and pagination
const groupSearch = ref('')
const groupCurrentPage = ref(1)
const groupRowsPerPage = ref(10)

const groups = ref([
  {
    id: 1,
    name: 'C-Level',
    employeeCount: 5,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Management',
    employeeCount: 15,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Standard',
    employeeCount: 200,
    status: 'Active',
  },
  {
    id: 4,
    name: 'Temporary',
    employeeCount: 14,
    status: 'Inactive',
  },
])

const filteredGroups = computed(() => {
  return groups.value.filter(g =>
    g.name.toLowerCase().includes(groupSearch.value.toLowerCase())
  )
})

const groupStart = computed(() => (groupCurrentPage.value - 1) * groupRowsPerPage.value)
const groupEnd = computed(() => groupStart.value + groupRowsPerPage.value)
const groupTotalPages = computed(() => Math.ceil(filteredGroups.value.length / groupRowsPerPage.value))

const paginatedGroups = computed(() => {
  return filteredGroups.value.slice(groupStart.value, groupEnd.value)
})

const nextGroupPage = () => {
  if (groupCurrentPage.value < groupTotalPages.value) groupCurrentPage.value++
}
const prevGroupPage = () => {
  if (groupCurrentPage.value > 1) groupCurrentPage.value--
}

// Services data
const serviceSearch = ref('')
</script>

<style scoped>
.tab {
  padding: 0.5rem 1rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
}
.tab-active {
  @apply tab bg-white border border-gray-200 shadow;
}
.badge-success {
  @apply bg-green-100 text-green-700 px-2 py-1 rounded text-xs;
}
.input {
  @apply border border-gray-300 rounded px-3 py-1;
}
.btn {
  @apply px-4 py-3 rounded text-primary;
}
.btn-primary {
  @apply bg-white text-primary hover:bg-white;
}
.btn-secondary {
  @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
}
</style>