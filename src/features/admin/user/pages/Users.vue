<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Table from '@/components/Table.vue';
import { useUserStore } from '../store/userStore';
import { removeUserById, getAllUser } from '../Api/UserApi';
import { toasted } from '@/utils/utils';
import UserStatusRow from '../components/statusrow.vue';
import { useApiRequest } from '@/composables/useApiRequest';
import { usePagination } from '@/composables/usePagination';
import { openModal } from '@customizer/modal-x';
import TableRowSkeleton from '@/components/TableRowSkeleton.vue';
import DefaultPage from "@/components/DefaultPage.vue";
  import icons from "@/utils/icons";
  
const router = useRouter();
const usersStore = useUserStore();

// Pagination state
const pagination = usePagination({
  store: usersStore,
  cb: getAllUser,
});

// API request for removing a user
const removeReq = useApiRequest();
const remove = (id: string) => {
  openModal('Confirmation', {
    title: 'Remove User',
    message: 'Are you sure you want to delete this user?'
  }, (res) => {
    if (res) {
      removeReq.send(() => removeUserById(id), (res) => {
        if (res.success) {
          usersStore.remove(id);
        }
        toasted(res.success, 'Removed Successfully', res.error);
      });
    }
  });
};

// Handle edit user navigation
const editUser = (userUuid: string) => {
  router.push(`/edit_user/${userUuid}`);
};

// Handle opening the add user modal
const openAddUserModal = () => {
  router.push('/add_user');
};

// function handleAddUser() {
//   // Open the add user modal
//   openModal("AddUser", {
   
//   });
// }
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
          <h3>Users</h3>
        </div>

        <div class="flex items-center space-x-4">
          <button  @click.prevent="openModal('AddUser')"
            class="flex justify-center items-center gap-2 rounded-md px-6 py-4 bg-primary text-white">
               <i v-html="icons.plus_circle"></i>
            Add User
          </button>
        </div>
      </div>

      <Table 
        :pending="pagination.pending.value" 
        :headers="{
          head: [
            'Fullname',
            'Email',
            'Mobile Phone',
            'User Type',
            'Role Name',
            'Gender',
            'Status',
            'Actions',
          ],
          row: [
            'fullname',
            'email',
            'mobilePhone',
            'userType',
            'roleName',
            
            'gender',
            'status',
          ]
        }" 
        :rows="usersStore.users"
          :rowCom="UserStatusRow"
        :Fallback="TableRowSkeleton"
      >
        <template #row="{ row }">
          <UserStatusRow 
            :rowData="row" 
            :rowKeys="['fullname', 'email', 'mobilePhone', 'roleName', 'gender']" 
            :headKeys="['Fullname', 'Email', 'Mobile Phone', 'Role Name', 'Gender', 'Actions']"
            :onEdit="editUser"
            :onDelete="remove"
            :onRowClick="() => {}"
          />
        </template>
      </Table>
    </div>
  </DefaultPage>
</template>