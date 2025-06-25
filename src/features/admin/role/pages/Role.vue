<script setup lang="ts">
import { useRouter } from 'vue-router';
import Table from '@/components/Table.vue';
import { useRoles } from '../store/roleStore';
import { removeRoleById, getAllRole } from '../Api/RoleApi';
import { toasted } from '@/utils/utils';
import { useApiRequest } from '@/composables/useApiRequest';
import { usePagination } from '@/composables/usePagination';
import { openModal } from '@customizer/modal-x';
import TableRowSkeleton from '@/components/TableRowSkeleton.vue';
import DefaultPage from "@/components/DefaultPage.vue";
import icons from "@/utils/icons";
import RoleStatusRow from '../components/RoleStatusRow.vue';

const router = useRouter();
const rolesStore = useRoles();

// Pagination state
const pagination = usePagination({
  store: rolesStore,
  cb: getAllRole,
});

// API request for removing a role
const removeReq = useApiRequest();
const remove = (id: string) => {
  openModal('Confirmation', {
    title: 'Remove Role',
    message: 'Are you sure you want to delete this role?'
  }, (res) => {
    if (res) {
      removeReq.send(() => removeRoleById(id), (res) => {
        if (res.success) {
          rolesStore.remove(id);
        }
        toasted(res.success, 'Role Removed Successfully', res.error);
      });
    }
  });
};

// Handle edit role navigation
const editRole = (roleUuid: string) => {
  router.push(`/edit_role/${roleUuid}`);
};

// Handle opening the add role modal
const openAddRoleModal = () => {
  router.push('/create-role');
};
</script>

<template>
  <DefaultPage v-slot="{ search }">
    <div class="p-4">
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
        <template #row="{ row }">
          <RoleStatusRow 
            :rowData="row" 
            :rowKeys="['roleName', 'roleDescription']" 
            :headKeys="['Role Name', 'Role Description', 'Actions']"
            :onEdit="editRole"
            :onDelete="remove"
            :onRowClick="() => {}"
          />
        </template>
      </Table>
    </div>
  </DefaultPage>
</template>