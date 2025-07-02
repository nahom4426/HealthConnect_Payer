<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { searchInsuredByInstitution, addInsuredToContract } from '../api/payerContractApi';
import { toasted } from '@/utils/utils';
import { closeModal } from '@customizer/modal-x';
import { useAuthStore } from "@/stores/auth";
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";

interface Employee {
  insuredUuid: string;
  fullName: string;
  firstName?: string;
  fatherName?: string;
  grandfatherName?: string;
  membershipNumber: string;
  idNumber?: string;
  phone?: string;
  position?: string;
  eligible?: boolean;
  isDependant?: boolean;
  dependants?: Dependant[];
  relationshipType?: string;
  profilePictureBase64?: string;
  photoBase64?: string;
  photoUrl?: string;
  photoPath?: string;
}

interface Dependant {
  dependantUuid: string;
  fullName: string;
  dependantFirstName?: string;
  dependantFatherName?: string;
  dependantGrandFatherName?: string;
  relationshipType: string;
  dependantStatus?: string;
  profilePictureBase64?: string;
}
const emit = defineEmits(['membersAdded']);
const auth = useAuthStore();
const route = useRoute();
const contractHeaderUuid = route.params.contractHeaderUuid;
const payerUuid = ref(auth.auth?.user?.payerUuid || "");

// Search and table state
const searchQuery = ref('');
const loading = ref(false);
const insuredMembers = ref<Employee[]>([]);
const selectedMembers = ref<Employee[]>([]);
const selectedDependents = ref<Record<string, Dependant[]>>({});

function handleImageError(event: Event) {
  const target = event.target as HTMLImageElement;
  target.src = '/assets/placeholder-profile.png';
}

function getBaseUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
}

// Fetch insured members
const fetchInsuredMembers = async () => {
  if (!payerUuid.value) {
    console.error('Error: payerUuid is not provided to AddMembersToContractModal.');
    toasted(false, "",'Failed to load insured members: Payer information missing.');
    return;
  }

  if (!contractHeaderUuid) {
    console.error('Error: contractHeaderUuid is missing.');
    toasted(false, "", 'Failed to load insured members: Contract information missing.');
    return;
  }

  try {
    loading.value = true;
    const responseData = await searchInsuredByInstitution(
      payerUuid.value,
      {
        search: searchQuery.value,
        contractUuid: contractHeaderUuid, // ✅ use value from route params
        page: 1,
        size: 10
      }
    );
    if (!responseData || !responseData.content) {
      throw new Error('Invalid API response structure: Missing content array.');
    }

    const members = responseData.content.map((employee: any) => {
      const fullName = employee.fullName || 
        `${employee.firstName || ''} ${employee.fatherName || ''} ${employee.grandfatherName || ''}`.trim();

      const mainEmployee: Employee = {
        insuredUuid: employee.insuredUuid,
        fullName,
        firstName: employee.firstName,
        fatherName: employee.fatherName,
        grandfatherName: employee.grandfatherName,
        membershipNumber: employee.membershipNumber || employee.idNumber || 'N/A',
        idNumber: employee.idNumber,
        phone: employee.phone,
        position: employee.position,
        eligible: employee.eligible || employee.status === 'ACTIVE',
        isDependant: false,
        relationshipType: employee.relationshipType || 'Employee',
        profilePictureBase64: employee.profilePictureBase64,
        photoBase64: employee.photoBase64,
        photoUrl: employee.photoUrl,
        photoPath: employee.photoPath
      };

      if (employee.dependants && employee.dependants.length > 0) {
        mainEmployee.dependants = employee.dependants.map((dependant: any) => {
          const dependantFullName = dependant.fullName || 
            `${dependant.dependantFirstName || ''} ${dependant.dependantFatherName || ''} ${dependant.dependantGrandFatherName || ''}`.trim();

          return {
            dependantUuid: dependant.dependantUuid,
            fullName: dependantFullName,
            dependantFirstName: dependant.dependantFirstName,
            dependantFatherName: dependant.dependantFatherName,
            dependantGrandFatherName: dependant.dependantGrandFatherName,
            relationshipType: dependant.relationship,
            dependantStatus: dependant.dependantStatus,
            profilePictureBase64: dependant.profilePictureBase64
          };
        });
      }

      return mainEmployee;
    });

    console.log('👥 Transformed insured members:', members);
    insuredMembers.value = members;
  } catch (error) {
    console.error('❌ Error fetching insured members:', error);
    // toasted(false, "", 'Failed to load insured members');
    insuredMembers.value = [];
  } finally {
    loading.value = false;
  }
};

let searchTimeout: ReturnType<typeof setTimeout>;
watch(searchQuery, (newVal) => {
  clearTimeout(searchTimeout);
  if (newVal.length > 2 || newVal.length === 0) {
    searchTimeout = setTimeout(fetchInsuredMembers, 500);
  }
});
// Toggle member selection
const toggleMemberSelection = (member: Employee) => {
  const index = selectedMembers.value.findIndex(m => m.insuredUuid === member.insuredUuid);
  if (index === -1) {
    selectedMembers.value.push(member);
  } else {
    selectedMembers.value.splice(index, 1);
    // Remove any selected dependents for this member
    delete selectedDependents.value[member.insuredUuid];
  }
};

// Toggle dependent selection
const toggleDependentSelection = (member: Employee, dependent: Dependant) => {
  if (!selectedDependents.value[member.insuredUuid]) {
    selectedDependents.value[member.insuredUuid] = [];
  }

  const index = selectedDependents.value[member.insuredUuid].findIndex(
    d => d.dependantUuid === dependent.dependantUuid
  );

  if (index === -1) {
    selectedDependents.value[member.insuredUuid].push(dependent);
  } else {
    selectedDependents.value[member.insuredUuid].splice(index, 1);
    // If no more dependents selected, remove the array
    if (selectedDependents.value[member.insuredUuid].length === 0) {
      delete selectedDependents.value[member.insuredUuid];
    }
  }
};

// Check if member is selected
const isMemberSelected = (member: Employee) => {
  return selectedMembers.value.some(m => m.insuredUuid === member.insuredUuid);
};

// Check if dependent is selected
const isDependentSelected = (member: Employee, dependent: Dependant) => {
  return selectedDependents.value[member.insuredUuid]?.some(
    d => d.dependantUuid === dependent.dependantUuid
  );
};

// Submit selected members to contract

// Submit selected members to contract
const submitSelectedMembers = async () => {
  if (selectedMembers.value.length === 0) {
    toasted(false, 'Please select at least one member');
    return;
  }

  const confirmed = confirm(`Add ${selectedMembers.value.length} member(s) to contract?`);
  if (!confirmed) return;

  try {
    loading.value = true;
    
    const payload = {
      insuredUuids: selectedMembers.value.map(m => m.insuredUuid),
      dependants: []
    };

    for (const [insuredUuid, dependents] of Object.entries(selectedDependents.value)) {
      for (const dependent of dependents) {
        payload.dependants.push({
          insuredUuid,
          dependantUuid: dependent.dependantUuid
        });
      }
    }

    const response = await addInsuredToContract(contractHeaderUuid, payload);
    
    if (response.success) {
      toasted(true, 'Members added successfully');
      
      // Emit the actual API response data if available, or our local data
      emit('membersAdded', {
        insuredSummaries: selectedMembers.value.map(member => ({
          ...member,
          dependants: selectedDependents.value[member.insuredUuid] || [],
          status: 'ACTIVE'
        })),
        totalInsured: selectedMembers.value.length,
        totalDependants: Object.values(selectedDependents.value).flat().length
      });
      
      closeModal();
    } else {
      throw new Error(response.message || 'Failed to add members');
    }
  } catch (error) {
    console.error('Error:', error);
    toasted(false, error.message || 'Failed to add members');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchInsuredMembers();
});
</script>

<template>
  <ModalParent>
    <NewFormParent
      size="lg"
      title="Add Members to Contract"
      subtitle="Search and select members to add to this contract"
    >
      <div class="bg-white rounded-lg">
        <!-- Search bar -->
        <div class="p-4 border-b">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by name or membership number..."
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              @input="fetchInsuredMembers"
            />
            <div class="absolute right-3 top-2.5">
              <svg
                v-if="loading"
                class="animate-spin h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <svg
                v-else
                class="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Selected members summary -->
        <div v-if="selectedMembers.length > 0" class="p-4 bg-blue-50 border-b">
          <div class="flex items-center justify-between">
            <div>
              <span class="font-medium text-blue-800">
                {{ selectedMembers.length }} member(s) selected
              </span>
              <span v-if="Object.keys(selectedDependents).length > 0" class="ml-2 text-blue-600">
                (+{{ Object.values(selectedDependents).flat().length }} dependents)
              </span>
            </div>
            <button
              @click="submitSelectedMembers"
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-[#014F4F] focus:outline-none focus:ring-2"
              :disabled="loading"
            >
              Add Selected
            </button>
          </div>
        </div>

        <!-- Table container with fixed height and scroll -->
        <div class="flex-1 overflow-hidden flex flex-col">
          <div class="overflow-y-auto" style="height: calc(70vh - 180px);">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membership #
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Eligibility
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <template v-if="insuredMembers.length > 0">
                  <template v-for="member in insuredMembers" :key="member.insuredUuid">
                    <!-- Main employee row -->
                    <tr v-if="!member.isDependant" class="hover:bg-gray-50" :class="{ 'bg-gray-50': isMemberSelected(member) }">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          :checked="isMemberSelected(member)"
                          @change="toggleMemberSelection(member)"
                          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden border border-gray-200">
                            <img 
                              v-if="member.profilePictureBase64 || member.photoBase64" 
                              :src="member.profilePictureBase64 || member.photoBase64" 
                              alt="Profile" 
                              class="h-full w-full object-cover"
                              @error="handleImageError"
                            />
                            <img 
                              v-else-if="member.photoUrl" 
                              :src="member.photoUrl" 
                              alt="Profile" 
                              class="h-full w-full object-cover"
                              @error="handleImageError"
                            />
                            <img 
                              v-else-if="member.photoPath" 
                              :src="`${getBaseUrl()}/insured/photo/${member.photoPath}`" 
                              alt="Profile" 
                              class="h-full w-full object-cover"
                              @error="handleImageError"
                            />
                            <div v-else class="h-full w-full bg-gray-200 flex items-center justify-center">
                              <span class="text-xs text-gray-500">
                                {{ member.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() }}
                              </span>
                            </div>
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">{{ member.fullName }}</div>
                            <div class="text-sm text-gray-500">{{ member.relationshipType || 'Employee' }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ member.membershipNumber || 'N/A' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ member.phone || 'N/A' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ member.position || 'N/A' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-bold">
                        <span :class="member.eligible ? 'bg-[#DFF1F1] text-[#02676B] p-1' : 'text-[#DB2E48] bg-[#DB2E481A] p-1'">
                          {{ member.eligible ? 'Eligible' : 'Not Eligible' }}
                        </span>
                      </td>
                    </tr>

                    <!-- Dependants rows -->
                    <template v-if="member.dependants && member.dependants.length > 0">
                      <tr 
                        v-for="dependent in member.dependants" 
                        :key="dependent.dependantUuid"
                        class="bg-blue-50 hover:bg-blue-100"
                        :class="{ 'bg-blue-100': isDependentSelected(member, dependent) }"
                      >
                        <td class="px-6 py-4 whitespace-nowrap pl-10">
                          <input
                            type="checkbox"
                            :checked="isDependentSelected(member, dependent)"
                            @change="toggleDependentSelection(member, dependent)"
                            :disabled="!isMemberSelected(member)"
                            :class="[
                              'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2',
                              { 'opacity-50 cursor-not-allowed': !isMemberSelected(member) }
                            ]"
                          />
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap pl-2">
                          <div class="flex items-center">
                            <div class="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden border border-gray-200">
                              <img 
                                v-if="dependent.profilePictureBase64" 
                                :src="dependent.profilePictureBase64" 
                                alt="Profile" 
                                class="h-full w-full object-cover"
                                @error="handleImageError"
                              />
                              <div v-else class="h-full w-full bg-blue-100 flex items-center justify-center">
                                <span class="text-xs text-blue-600">
                                  {{ dependent.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() }}
                                </span>
                              </div>
                            </div>
                            <div class="ml-4">
                              <span class="text-blue-600 mr-2">↳</span>
                              <div>
                                <div class="text-sm font-medium text-gray-900">{{ dependent.fullName }}</div>
                                <div class="text-sm text-gray-500">Dependant ({{ dependent.relationshipType }})</div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ member.membershipNumber || 'N/A' }}
                          <span class="text-xs text-gray-400">(Employee ID)</span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ member.phone || 'N/A' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          Dependant ({{ dependent.relationshipType }})
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-bold">
                          <span :class="dependent.dependantStatus === 'ACTIVE' ? 'bg-[#DFF1F1] text-[#02676B] p-1' : 'text-[#DB2E48] bg-[#DB2E481A] p-1'">
                            {{ dependent.dependantStatus === 'ACTIVE' ? 'Eligible' : 'Not Eligible' }}
                          </span>
                        </td>
                      </tr>
                    </template>
                  </template>
                </template>
                <template v-else>
                  <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                      {{ loading ? 'Loading...' : 'No members found' }}
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <template #bottom>
        <div class="flex justify-end gap-2 w-full p-4 border-t">
          <button
            @click="closeModal"
            class="px-4 py-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back
          </button>
          <button
            @click="submitSelectedMembers"
            class="px-4 py-4 bg-primary text-white rounded-md shadow-sm text-sm font-medium hover:bg-[#014F4F] "
            :disabled="selectedMembers.length === 0 || loading"
          >
            Continue
          </button>
        </div>
      </template>
    </NewFormParent>
  </ModalParent>
</template>

<style scoped>
.table-container {
  scroll-behavior: smooth;
}
</style>