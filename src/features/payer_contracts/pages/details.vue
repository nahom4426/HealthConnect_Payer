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
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F6F7FA] p-4 rounded shadow">
      <div class="bg-white p-4 rounded-md gap-4 text-[#373946]">
        <h2 class="font-semibold mb-2 text-[#75778B] border-b border-[#75778B] pb-2">Provider Detail</h2>
        <div class="flex justify-between gap-2 text-sm p-2">
        <p class="font-inter text-[#373946] font-normal text-sm leading-none tracking-normal">Provider legal name:</p>
      <p class="font-sans font-medium text-sm leading-none tracking-normal text-[#373946]">Kenema Pharmacy Enterprises</p>

        </div>
        <div class="flex justify-between gap-2 text-sm p-2">
        <p class="font-inter text-[#373946] font-normal text-sm leading-none tracking-normal">Address:</p>

        <p class="font-sans font-medium text-sm leading-none tracking-normal text-[#373946]"> Arada, Around Semen City Hall, Addis Ababa</p>
        </div>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="flex justify-between gap-2 text-sm p-2 border-r">
        <p class="font-inter text-[#373946] font-normal text-sm leading-none tracking-normal">Contact Person:</p>
        <p class="font-sans font-medium text-sm leading-none tracking-normal text-[#373946]"> Birhane Araya</p>
          </div>
          <div class="flex justify-between gap-2 text-sm p-2">
        <p class="font-inter text-[#373946] font-normal text-sm leading-none tracking-normal">Contact Number:</p>
        <p class="font-sans font-medium text-sm leading-none tracking-normal text-[#373946]"> +251945065432</p>
          </div>
        </div>
      </div>
     <div class="bg-white p-4 rounded-md gap-4 text-[#373946]">
  <h2 class="font-semibold mb-2 text-[#75778B] border-b border-[#75778B] pb-2">Contract Detail</h2>

  <div class="grid grid-cols-2 gap-2 text-sm">
    <div class="col-span-2 grid grid-cols-4 gap-2 border-b pb-2 p-2">
      <p class="font-inter text-[#373946] font-normal text-sm leading-none tracking-normal">Contract ID:</p>
      <p class="font-sans font-medium text-sm leading-none tracking-normal text-[#373946]">Birhane Araya</p>
      <p class="font-inter text-[#373946] font-normal text-sm leading-none tracking-normal">Contract Status:</p>
      <p class="font-sans font-medium text-sm leading-none tracking-normal text-green-600">Active</p>
    </div>

    <div class="grid grid-cols-2 gap-2 border-b pb-2 p-2">
      <p class="font-inter text-[#373946] font-normal text-sm leading-none tracking-normal">Contract From:</p>
      <p class="font-sans font-medium text-sm leading-none tracking-normal text-[#373946]">May 11 2024</p>
      <p class="font-inter text-[#373946] font-normal text-sm leading-none tracking-normal">Contract To:</p>
      <p class="font-sans font-medium text-sm leading-none tracking-normal text-[#373946]">May 10 2025</p>
    </div>

    <div class="grid grid-cols-2 gap-2 p-2">
      <p class="font-inter text-[#373946] font-normal text-sm leading-none tracking-normal">Number of Employees:</p>
      <p class="font-sans font-medium text-sm leading-none tracking-normal text-[#373946]">234</p>
      <p class="font-inter text-[#373946] font-normal text-sm leading-none tracking-normal">Employee Groups:</p>
      <p class="font-sans font-medium text-sm leading-none tracking-normal text-[#373946]">4</p>
    </div>
  </div>
</div>

    </div>

    <!-- Tabs -->
    <div class="flex space-x-2 mt-4">
      <button 
        @click="activeTab = 'employees'"
        :class="activeTab === 'employees' ? 'tab-active' : 'tab'"
      >
        Employees (3)
      </button>
      <button 
        @click="activeTab = 'groups'"
        :class="activeTab === 'groups' ? 'tab-active' : 'tab'"
      >
        Groups
      </button>
      <button 
        @click="activeTab = 'services'"
        :class="activeTab === 'services' ? 'tab-active' : 'tab'"
      >
        Services (123)
      </button>
      <button class="ml-auto btn btn-secondary">
        {{ activeTab === 'groups' ? 'Add Group' : 'Add Employee' }}
      </button>
    </div>

    <!-- Employees Table (shown when activeTab === 'employees') -->
    <div v-if="activeTab === 'employees'" class="bg-white p-4 rounded shadow">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-medium">Insured Employees</h3>
        <input type="text" placeholder="Search Employees" class="input" v-model="employeeSearch" />
      </div>
      <table class="w-full table-auto">
        <thead>
          <tr class="text-left text-sm text-gray-500 border-b">
            <th>#</th>
            <th>Insured ID</th>
            <th>Full Name</th>
            <th>Dependents</th>
            <th>Role</th>
            <th>Employee Group</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(employee, index) in paginatedEmployees" :key="employee.id" class="text-sm border-b">
            <td>{{ index + 1 }}</td>
            <td>{{ employee.insuredId }}</td>
            <td>{{ employee.fullName }}</td>
            <td>{{ employee.dependents }}</td>
            <td>{{ employee.role }}</td>
            <td>{{ employee.group }}</td>
            <td>
              <span class="badge badge-success">{{ employee.status }}</span>
            </td>
            <td>
              <button class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-ellipsis-v"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="flex items-center justify-between mt-4 text-sm">
        <div>
          Showing <select v-model="employeeRowsPerPage" class="input w-16 mx-1">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
          </select> ✔
        </div>
        <div>
          Showing {{ employeeStart + 1 }} to {{ Math.min(employeeEnd, filteredEmployees.length) }} out of {{ filteredEmployees.length }} records
        </div>
        <div class="flex items-center space-x-1">
          <button @click="prevEmployeePage" :disabled="employeeCurrentPage === 1" class="px-2 py-1 rounded hover:bg-gray-100">
            &lt;
          </button>
          <button v-for="page in employeeTotalPages" :key="page" 
                  @click="employeeCurrentPage = page"
                  :class="{'bg-gray-200': employeeCurrentPage === page}"
                  class="px-2 py-1 rounded hover:bg-gray-100">
            {{ page }}
          </button>
          <button @click="nextEmployeePage" :disabled="employeeCurrentPage === employeeTotalPages" class="px-2 py-1 rounded hover:bg-gray-100">
            &gt;
          </button>
        </div>
      </div>
    </div>

    <!-- Groups Table (shown when activeTab === 'groups') -->
    <div v-else-if="activeTab === 'groups'" class="bg-white p-4 rounded shadow">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-medium">Employee Groups</h3>
        <input type="text" placeholder="Search Groups" class="input" v-model="groupSearch" />
      </div>
      <table class="w-full table-auto">
        <thead>
          <tr class="text-left text-sm text-gray-500 border-b">
            <th>#</th>
            <th>Group Name</th>
            <th>Number of Employees</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(group, index) in paginatedGroups" :key="group.id" class="text-sm border-b">
            <td>{{ index + 1 }}</td>
            <td>{{ group.name }}</td>
            <td>{{ group.employeeCount }}</td>
            <td>
              <span class="badge badge-success">{{ group.status }}</span>
            </td>
            <td>
              <button class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-ellipsis-v"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="flex items-center justify-between mt-4 text-sm">
        <div>
          Showing <select v-model="groupRowsPerPage" class="input w-16 mx-1">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
          </select> ✔
        </div>
        <div>
          Showing {{ groupStart + 1 }} to {{ Math.min(groupEnd, filteredGroups.length) }} out of {{ filteredGroups.length }} records
        </div>
        <div class="flex items-center space-x-1">
          <button @click="prevGroupPage" :disabled="groupCurrentPage === 1" class="px-2 py-1 rounded hover:bg-gray-100">
            &lt;
          </button>
          <button v-for="page in groupTotalPages" :key="page" 
                  @click="groupCurrentPage = page"
                  :class="{'bg-gray-200': groupCurrentPage === page}"
                  class="px-2 py-1 rounded hover:bg-gray-100">
            {{ page }}
          </button>
          <button @click="nextGroupPage" :disabled="groupCurrentPage === groupTotalPages" class="px-2 py-1 rounded hover:bg-gray-100">
            &gt;
          </button>
        </div>
      </div>
    </div>

    <!-- Services Table (shown when activeTab === 'services') -->
    <div v-else class="bg-white p-4 rounded shadow">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-medium">Services</h3>
        <input type="text" placeholder="Search Services" class="input" v-model="serviceSearch" />
      </div>
      <p class="text-center py-8 text-gray-500">Services content would go here</p>
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