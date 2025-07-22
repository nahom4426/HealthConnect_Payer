<!-- src/components/creditServices/EmployeeDetailsCard.vue -->
<script setup lang="ts">
interface EmployeeDetails {
  fullName: string;
  employeeId: string;
  role: string;
  phone: string;
  email: string;
  gender: string;
  address: string;
  profilePicture?: string;
  status: string;
}

const props = defineProps<{
  employee: EmployeeDetails;
}>();
</script>

<template>
  <div class="bg-[#F6F7FA] p-4 flex">
    <div class="flex flex-col md:flex-row gap-4 py-4 px-8 bg-[#F6F7FA] rounded-xl shadow-sm w-full">
      <!-- Profile Photo -->
      <div class="w-[15rem] h-[15rem] flex items-center justify-center rounded-lg overflow-hidden">
        <img 
          :src="employee.profilePicture || '/src/assets/img/profile.png'" 
          alt="Profile" 
          class="w-full h-full object-cover"
        />
      </div>

      <!-- Left Info Section -->
      <div class="bg-white rounded-lg p-4 w-full md:w-[35.5rem] space-y-2">
        <div class="flex">
          <span class="text-xs text-[#75778B] w-28">Full Name</span>
          <span class="text-sm font-medium text-[#373946]">{{ employee.fullName }}</span>
        </div>
        <div class="flex">
          <span class="text-xs text-[#75778B] w-28">Role</span>
          <span class="text-sm font-medium text-[#373946]">{{ employee.role }}</span>
        </div>
        <div class="flex">
          <span class="text-xs text-[#75778B] w-28">Phone</span>
          <span class="text-sm font-medium text-[#373946]">{{ employee.phone }}</span>
        </div>
        <div class="flex">
          <span class="text-xs text-[#75778B] w-28">Email</span>
          <span class="text-sm font-medium text-[#373946]">{{ employee.email }}</span>
        </div>
      </div>

      <!-- Right Info Section -->
      <div class="bg-white rounded-lg p-4 w-full md:w-[35.5rem] space-y-2">
        <div class="flex">
          <span class="text-xs text-[#75778B] w-28">Employee ID</span>
          <span class="text-sm font-medium text-[#373946]">{{ employee.employeeId }}</span>
        </div>
        <div class="flex">
          <span class="text-xs text-[#75778B] w-28">Address</span>
          <span class="text-sm font-medium text-[#373946]">{{ employee.address }}</span>
        </div>
        <div class="flex">
          <span class="text-xs text-[#75778B] w-28">Gender</span>
          <span class="text-sm font-medium text-[#373946]">{{ employee.gender }}</span>
        </div>
      </div>

      <!-- Status & Level Section -->
      <div class="bg-white rounded-lg p-4 w-full md:w-[35.5rem] space-y-2">
        <div class="flex p-2 gap-2 bg-[#DFF1F1]">
          <span class="text-xs font-medium bg-primary py-2 rounded-lg px-3 flex items-center gap-2 text-white">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M0 6C0 2.68629 2.68629 0 6 0C9.31371 0 12 2.68629 12 6C12 9.31371 9.31371 12 6 12C2.68629 12 0 9.31371 0 6ZM5.40001 8.34854L9.27427 4.47427L8.42575 3.62574L5.40001 6.65148L3.72427 4.97574L2.87574 5.82427L5.40001 8.34854Z" fill="white"/>
            </svg>
            {{ employee.status }}
          </span>
          <div class="flex-1 flex items-center px-2 justify-between">
            <span class="text-sm font-medium items-center text-center justify-center">{{ employee.employeeId }}</span>
          </div>
        </div>
        <div class="flex">
          <span class="bg-[#DFF1F1] text-[#02676B] px-6 py-3.5 rounded-md mt-2 text-sm font-medium">
            C-Level
          </span>
        </div>
      </div>
    </div>
  </div>
</template>