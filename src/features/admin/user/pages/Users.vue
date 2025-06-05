<script setup>
import { ref, onMounted, computed } from 'vue';
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

const router = useRouter();
const usersStore = useUserStore();

// Pagination state
const pending = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = ref(1);

// Load users on component mount
// onMounted(async () => {
//   pending.value = true;
//   try {
//     await usersStore.fetchUsers();
//   } catch (error) {
//     console.error('Failed to fetch users:', error);
//     toasted(false, '', 'Failed to load users');
//   } finally {
//     pending.value = false;
//   }
// });

// Handle user deletion


const pagination = usePagination({
  store: usersStore,
  cb: getAllUser,
})

const removeReq = useApiRequest();
function remove(id) {
  openModal('Confirmation', {
    title: 'Remove User',
    message: 'Are you sure you want to delete this user'
  }, (res) => {
    if (res) {
      removeReq.send(() => removeUserById(id),
        (res) => {
          if (res.success) {
            usersStore.remove(id)
          }
          toasted(res.success, 'Removed Successfully', res.error);
        })
    }
  })
}
// Handle edit user navigation
const editUser = (userUuid) => {
  router.push(`/edit_user/${userUuid}`);
};

// Handle opening the add user modal
const openAddUserModal = () => {
  router.push('/add_user');
};
</script>

<template>
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
        <slot name="select">
          <button @click="openModal('AddUser')"
            class="border-red-100 gap-3 bg-primary p-2 text-white flex items-center ">
            <svg width="14" height="14" viewBox="0 0 12 14" fill="#263558" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1 4.04995C0.723858 4.04995 0.5 4.27381 0.5 4.54995C0.5 4.82609 0.723858 5.04995 1 5.04995V4.04995ZM2.2 5.04995C2.47614 5.04995 2.7 4.82609 2.7 4.54995C2.7 4.27381 2.47614 4.04995 2.2 4.04995V5.04995ZM1 6.44995C0.723858 6.44995 0.5 6.67381 0.5 6.94995C0.5 7.22609 0.723858 7.44995 1 7.44995V6.44995ZM2.2 7.44995C2.47614 7.44995 2.7 7.22609 2.7 6.94995C2.7 6.67381 2.47614 6.44995 2.2 6.44995V7.44995ZM1 8.84995C0.723858 8.84995 0.5 9.07381 0.5 9.34995C0.5 9.62609 0.723858 9.84995 1 9.84995V8.84995ZM2.2 9.84995C2.47614 9.84995 2.7 9.62609 2.7 9.34995C2.7 9.07381 2.47614 8.84995 2.2 8.84995V9.84995ZM6.9 5.14995V4.64995H5.9V5.14995H6.9ZM5.9 8.74995V9.24995H6.9V8.74995H5.9ZM8.2 7.44995H8.7V6.44995H8.2V7.44995ZM4.6 6.44995H4.1V7.44995H4.6V6.44995ZM1 5.04995H2.2V4.04995H1V5.04995ZM1 7.44995H2.2V6.44995H1V7.44995ZM1 9.84995H2.2V8.84995H1V9.84995ZM2.8 13.45H10V12.45H2.8V13.45ZM10 13.45C10.9389 13.45 11.7 12.6889 11.7 11.75H10.7C10.7 12.1366 10.3866 12.45 10 12.45V13.45ZM11.7 11.75V2.14995H10.7V11.75H11.7ZM11.7 2.14995C11.7 1.21107 10.9389 0.449951 10 0.449951V1.44995C10.3866 1.44995 10.7 1.76335 10.7 2.14995H11.7ZM10 0.449951H2.8V1.44995H10V0.449951ZM2.8 0.449951C1.86112 0.449951 1.1 1.21107 1.1 2.14995H2.1C2.1 1.76335 2.4134 1.44995 2.8 1.44995V0.449951ZM1.1 2.14995V11.75H2.1V2.14995H1.1ZM1.1 11.75C1.1 12.6889 1.86112 13.45 2.8 13.45V12.45C2.4134 12.45 2.1 12.1366 2.1 11.75H1.1ZM5.9 5.14995V8.74995H6.9V5.14995H5.9ZM8.2 6.44995H4.6V7.44995H8.2V6.44995Z"
                fill="white" />
            </svg>
            Add User
            <!-- <span class="truncate px-3">Add Privilege</span> -->
          </button>
        </slot>
      </div>
    </div>

    <Table 
      :pending="pagination.pending.value" 
      :headers="{
        head: [
          'Fullname',
          'Email',
          'Mobile Phone',
          'Role Name',
          'Gender',
          'Actions',
        ],
        row: [
          'fullname',
          'email',
          'mobilePhone',
          'roleName',
          'gender',
        ]
      }" 
      :rows="usersStore.users"
      :Fallback="TableRowSkeleton"
    >
      <template #row>
        <UserStatusRow 
          :rowData="usersStore.users" 
          :rowKeys="['fullname', 'email', 'mobilePhone', 'roleName', 'gender']" 
          :headKeys="['Fullname', 'Email', 'Mobile Phone', 'Role Name', 'Gender', 'Actions']"
          :onEdit="editUser"
          :onDelete="remove"
          :onRowClick="() => {}"
        />
      </template>
    </Table>
  </div>
</template>
