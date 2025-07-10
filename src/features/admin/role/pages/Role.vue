<script setup lang="ts">
import { useRouter } from 'vue-router';
import Table from '@/components/Table.vue';
import { useRoles } from '../store/roleStore';
import { removeRoleById, getAllRole } from '../Api/RoleApi';
import { removeUndefined, toasted } from '@/utils/utils';
import { useApiRequest } from '@/composables/useApiRequest';
import { usePagination } from '@/composables/usePagination';
import { openModal } from '@customizer/modal-x';
import TableRowSkeleton from '@/components/TableRowSkeleton.vue';
import DefaultPage from "@/components/DefaultPage.vue";
import icons from "@/utils/icons";
import RoleStatusRow from '../components/RoleStatusRow.vue';
import RolesDataProvider from '../components/RolesDataProvider.vue';

const router = useRouter();

</script>

<template>
   <DefaultPage  placeholder="Search Roles">
    <template #filter>
      <button
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 text-primary bg-base-clr3"
      >
        <i v-html="icons.filter"></i>
        <p class="text-base">Filters</p>
      </button>
    </template>

    <template #add-action>
      <button
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 bg-primary text-white"
        @click.prevent="$router.push('/create-role')"
      >
        <i v-html="icons.plus_circle"></i>
        <p class="text-base">Add Role</p>
      </button>
    </template>

    <template #default="{ search }">
      <RolesDataProvider
        ref="dataProvider"
        :search="search"
        v-slot="{ roles, pending,  }"
      >
      
        <Table 
        :pending="pending" 
        :headers="{
          head: [
            'Role Name',
            'Role Description',
            'Actions',
          ],
          row: [
            'roleName',
            'roleDescription',
          ]
        }" 
        :rows="roles"
        :rowCom="RoleStatusRow"
        :Fallback="TableRowSkeleton"
      >
         
        </Table>
      </RolesDataProvider>
    </template>
  </DefaultPage>
  <!-- <DefaultPage v-slot="{ search }">
    <template #filter>
      
    </template> -->
    <!-- <div class="p-4">
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-2">
          <span class="p-2 bg-primary/10 rounded">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                fill="#263558" stroke="#263558" stroke-linecap="round" />
            </svg>
          </span>
          <h3>Roles</h3>
        </div>

        <div class="flex items-center space-x-4">
          <button @click.prevent="openAddRoleModal"
            class="flex justify-center items-center gap-2 rounded-md px-6 py-4 bg-primary text-white">
            <i v-html="icons.plus_circle"></i>
            Add Role
          </button>
        </div>
      </div>
     
    </div> -->
     <!-- <template #default="{ search }">
      <RolesDataProvider
        ref="dataProvider"
        :search="search"
        v-slot="{ privileges, pending,  }"
      >
    
      <Table 
        :pending="pagination.pending.value" 
        :headers="{
          head: [
            'Role Name',
            'Role Description',
            'Actions',
          ],
          row: [
            'roleName',
            'roleDescription',
          ]
        }" 
        :rows="rolesStore.roles"
        :rowCom="RoleStatusRow"
        :Fallback="TableRowSkeleton"
      >
      
      </Table>
    </RolesDataProvider>
</template>
  </DefaultPage> -->
</template>