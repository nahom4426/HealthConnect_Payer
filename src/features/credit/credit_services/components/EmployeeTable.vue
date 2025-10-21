<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  employees: { type: Array, default: () => [] },
  selectedEmployee: { type: Object, default: null },
  isInsurancePayer: { type: Boolean, default: false },
  error: { type: [String, Object], default: null },
  searchEmployeeQuery: { type: String, default: '' }
});

const emit = defineEmits(['select-employee', 'clear-search']);

function selectEmployee(row) {
  emit('select-employee', row);
}
</script>

<template>
  <div class="border rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm bg-white">
    <div class="overflow-auto" style="max-height: calc(100vh - 350px); min-height: 300px;">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">#</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Employee ID</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Patient Name</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Type</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Eligibility</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Action</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <template v-if="props.employees.length > 0">
            <template v-for="(employee, index) in props.employees" :key="employee.insuredUuid">
              <tr v-if="!employee.isDependant"
                  :class="{
                    'bg-gradient-to-r from-teal-50 to-cyan-50 border-l-4 border-teal-400': props.selectedEmployee && props.selectedEmployee.insuredUuid === employee.insuredUuid,
                    'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200': !(props.selectedEmployee && props.selectedEmployee.insuredUuid === employee.insuredUuid),
                    'border-b-2 border-blue-200': employee.dependants && employee.dependants.length > 0
                  }" class="group cursor-pointer">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-semibold group-hover:bg-blue-200 transition-colors">
                    {{ index + 1 }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div class="flex items-center space-x-2">
                    <div class="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>{{ employee.membershipNumber || employee.idNumber }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex items-center space-x-3">
                    <template v-if="employee.profilePictureBase64">
                      <img :src="employee.profilePictureBase64" alt="Profile" class="w-8 h-8 rounded-full object-cover border" />
                    </template>
                    <template v-else>
                      <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                        {{ employee.fullName.charAt(0).toUpperCase() }}
                      </div>
                    </template>
                    <span class="font-medium text-gray-900">{{ employee.fullName }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                    Employee
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 border border-green-300">
                    Eligible
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button type="button" @click="selectEmployee(employee)"
                          :class="{
                            'bg-gradient-to-r from-primary to-teal-600 text-white shadow-lg transform scale-105': props.selectedEmployee && props.selectedEmployee.insuredUuid === employee.insuredUuid,
                            'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-primary hover:to-teal-600 hover:text-white hover:shadow-md transform hover:scale-105': !(props.selectedEmployee && props.selectedEmployee.insuredUuid === employee.insuredUuid)
                          }"
                          class="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2">
                    <span>Detail</span>
                  </button>
                </td>
              </tr>

              <!-- Dependants -->
              <template v-if="!employee.isDependant && employee.dependants && employee.dependants.length > 0">
                <tr v-for="(dependant, dIndex) in employee.dependants" :key="dependant.dependantUuid"
                    :class="{
                      'bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400': props.selectedEmployee && props.selectedEmployee.insuredUuid === dependant.dependantUuid,
                      'bg-gradient-to-r from-blue-25 to-indigo-25 hover:from-blue-50 hover:to-indigo-50': !(props.selectedEmployee && props.selectedEmployee.insuredUuid === dependant.dependantUuid)
                    }" class="group cursor-pointer transition-all duration-200">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 pl-10">
                    <div class="flex items-center space-x-2">
                      <span class="text-purple-600 font-bold">↳</span>
                      <div class="flex items-center justify-center w-6 h-6 bg-purple-100 rounded-full text-purple-600 font-semibold text-xs">
                        {{ dIndex + 1 }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="flex items-center space-x-2">
                      <div class="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>{{ employee.membershipNumber }}</span>
                      <span class="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">(Employee ID)</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 pl-2">
                    <div class="flex items-center space-x-3">
                      <div class="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                        {{ dependant.fullName.charAt(0).toUpperCase() }}
                      </div>
                      <div class="flex flex-col">
                        <span class="font-medium text-gray-900">{{ dependant.fullName }}</span>
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
                          {{ dependant.relationshipType }}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-200 text-indigo-800 border border-indigo-300">
                      Dependant
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 border border-green-300">
                      Eligible
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button type="button" @click="selectEmployee({
                        insuredUuid: dependant.dependantUuid,
                        fullName: dependant.fullName,
                        phone: employee.phone,
                        idNumber: employee.membershipNumber,
                        position: `Dependant (${dependant.relationshipType})`,
                        birthDate: '',
                        eligible: true,
                        status: 'ACTIVE',
                        gender: '',
                        email: employee.email,
                        address: employee.address,
                        isDependant: true,
                        dependantUuid: dependant.dependantUuid,
                        employeeUuid: employee.insuredUuid,
                        relationshipType: dependant.relationshipType,
                        membershipNumber: employee.membershipNumber
                      })"
                      :class="{
                        'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105': props.selectedEmployee && props.selectedEmployee.insuredUuid === dependant.dependantUuid,
                        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-purple-500 hover:to-pink-600 hover:text-white hover:shadow-md transform hover:scale-105': !(props.selectedEmployee && props.selectedEmployee.insuredUuid === dependant.dependantUuid)
                      }"
                      class="px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2">
                      <span>{{ props.selectedEmployee && props.selectedEmployee.insuredUuid === dependant.dependantUuid ? 'Selected' : 'Select' }}</span>
                    </button>
                  </td>
                </tr>
              </template>
            </template>
          </template>
          <template v-else>
            <tr>
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <div class="text-4xl">🧑‍⚕️🔍</div>
                  <h3 class="text-lg font-semibold text-gray-900">No employees found</h3>
                  <p class="text-sm text-gray-500">
                    {{ props.searchEmployeeQuery
                      ? 'No matching employees found for your search'
                      : (props.isInsurancePayer
                        ? 'No employees available for the selected institution'
                        : 'No employees available for the selected contract') }}
                  </p>
                  <button v-if="props.searchEmployeeQuery"
                          @click="emit('clear-search')"
                          class="mt-2 px-3 py-1 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Clear search
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
table { @apply min-w-full divide-y divide-gray-200; }
th { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider; }
td { @apply px-6 py-4 whitespace-nowrap text-sm; }
</style>
