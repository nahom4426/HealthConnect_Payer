<script setup>
import Table from '@/components/Table.vue';
import { useRoles } from '../store/roleStore';
import { getAllRole, removeRoleById } from '../Api/RoleApi';
import { toasted } from '@/utils/utils';
import { useApiRequest } from '@/composables/useApiRequest';
import TableRowSkeleton from '@/components/TableRowSkeleton.vue';
import { openModal } from '@customizer/modal-x';
import { usePagination } from '@/composables/usePagination';
import Dropdown from '@/components/Dropdown.vue';
import BaseIcon from '@/components/base/BaseIcon.vue';
 import { mdiDeleteAlert, mdiDotsVertical, mdiPencil } from '@mdi/js';

const rolesStore = useRoles();

const pagination = usePagination({
  store: rolesStore,
  cb: getAllRole,
});


const removeReq = useApiRequest();
function remove(id) {
  openModal('Confirmation', {
    title: 'Remove Role',
    message: 'Are you sure you want to delete this role'
  },
    (res) => {
      if (res) {
        removeReq.send(() => removeRoleById(id),
          (res) => {
            if (res.success) {
              rolesStore.remove(id)
            }
            toasted(res.success, 'Removed Successfully', res.error);
          })
      }
    })

}
</script>

<template>

  <div class="p-7">

    <div class="flex space-x-8 min-[320px]:text-center max-[600px]:flex-col justify-between mr-5">
      <div class="m-6 ml-1 flex space-x-2 item-center ">
        <span class="item-center mt-1">
          <svg width="7" height="13" viewBox="0 0 7 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="0.6" fill-rule="evenodd" clip-rule="evenodd"
              d="M5.82539 1.0134C6.03505 1.20471 6.05933 1.54072 5.87962 1.76391L2.15854 6.38525L5.87962 11.0066C6.05933 11.2298 6.03505 11.5658 5.82539 11.7571C5.61572 11.9484 5.30007 11.9226 5.12036 11.6994L1.12037 6.73164C0.959876 6.53232 0.959876 6.23819 1.12037 6.03887L5.12036 1.07113C5.30008 0.847943 5.61572 0.822096 5.82539 1.0134Z"
              fill="#263558" stroke="#263558" stroke-linecap="round" />
          </svg>
        </span>
        <h3>Roles</h3>
      </div>
      {{ console.log(rolesStore) }}

      <div class="flex items-center space-x-4 ">
        <div class="relative m-6">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
        </div>

        <slot name="select">
          <button class="border-red-100 gap-3 bg-primary p-2 text-white flex items-center ">
            <svg width="14" height="14" viewBox="0 0 12 14" fill="#263558" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1 4.04995C0.723858 4.04995 0.5 4.27381 0.5 4.54995C0.5 4.82609 0.723858 5.04995 1 5.04995V4.04995ZM2.2 5.04995C2.47614 5.04995 2.7 4.82609 2.7 4.54995C2.7 4.27381 2.47614 4.04995 2.2 4.04995V5.04995ZM1 6.44995C0.723858 6.44995 0.5 6.67381 0.5 6.94995C0.5 7.22609 0.723858 7.44995 1 7.44995V6.44995ZM2.2 7.44995C2.47614 7.44995 2.7 7.22609 2.7 6.94995C2.7 6.67381 2.47614 6.44995 2.2 6.44995V7.44995ZM1 8.84995C0.723858 8.84995 0.5 9.07381 0.5 9.34995C0.5 9.62609 0.723858 9.84995 1 9.84995V8.84995ZM2.2 9.84995C2.47614 9.84995 2.7 9.62609 2.7 9.34995C2.7 9.07381 2.47614 8.84995 2.2 8.84995V9.84995ZM6.9 5.14995V4.64995H5.9V5.14995H6.9ZM5.9 8.74995V9.24995H6.9V8.74995H5.9ZM8.2 7.44995H8.7V6.44995H8.2V7.44995ZM4.6 6.44995H4.1V7.44995H4.6V6.44995ZM1 5.04995H2.2V4.04995H1V5.04995ZM1 7.44995H2.2V6.44995H1V7.44995ZM1 9.84995H2.2V8.84995H1V9.84995ZM2.8 13.45H10V12.45H2.8V13.45ZM10 13.45C10.9389 13.45 11.7 12.6889 11.7 11.75H10.7C10.7 12.1366 10.3866 12.45 10 12.45V13.45ZM11.7 11.75V2.14995H10.7V11.75H11.7ZM11.7 2.14995C11.7 1.21107 10.9389 0.449951 10 0.449951V1.44995C10.3866 1.44995 10.7 1.76335 10.7 2.14995H11.7ZM10 0.449951H2.8V1.44995H10V0.449951ZM2.8 0.449951C1.86112 0.449951 1.1 1.21107 1.1 2.14995H2.1C2.1 1.76335 2.4134 1.44995 2.8 1.44995V0.449951ZM1.1 2.14995V11.75H2.1V2.14995H1.1ZM1.1 11.75C1.1 12.6889 1.86112 13.45 2.8 13.45V12.45C2.4134 12.45 2.1 12.1366 2.1 11.75H1.1ZM5.9 5.14995V8.74995H6.9V5.14995H5.9ZM8.2 6.44995H4.6V7.44995H8.2V6.44995Z"
                fill="white" />
            </svg>
            <router-link to="/create-role"><span class="truncate px-3">Add Role</span></router-link>
            <!-- <span class="truncate px-3">Add Privilege</span> -->
          </button>

        </slot>
      </div>
    </div>


    <Table :pending="pagination.pending.value" :headers="{
      head: [
        'Role Name',
        'Role Description',
        'actions',
      ],
      row: [
        'roleName',
        'roleDescription',
      ]
    }" :Fallback="TableRowSkeleton" :rows="rolesStore.roles">

      <template #actions="{ row }">
        <div class="flex gap-2">
          <button class="rounded-lg bg-gray-600 text-white px-2 py-1 border-gray-300 flex gap-1"
            @click='$router.push("/edit_role/" + row?.roleUuid)'>
            <BaseIcon :path="mdiPencil" />
            Edit
          </button>
          <button class="rounded-lg bg-[#FF4C4C] text-white px-2 py-1 border-gray-300 flex gap-1"
            @click='remove(row?.roleUuid)'>
            <BaseIcon :path="mdiDeleteAlert" />
            Delete
          </button>
          <!-- <Dropdown top="120%" v-slot="{ setRef, toggleDropdown }">
            <button @click="toggleDropdown">
              <BaseIcon :path="mdiDotsVertical" class="bg-black/10 rounded-full" />
            </button>
            <div :ref="setRef">
              <div class="flex flex-col *:text-left gap-2 p-2 bg-white shadow-lg w-40">
                <button class="rounded-lg bg-gray-600 text-white px-2 py-1 border-gray-300 flex gap-1"
                  @click='$router.push("/edit_role/" + row?.roleUuid)'>
                  <BaseIcon :path="mdiPencil" />
                  Edit
                </button>
                <button class="rounded-lg bg-[#FF4C4C] text-white px-2 py-1 border-gray-300 flex gap-1"
                  @click='remove(row?.roleUuid)'>
                  <BaseIcon :path="mdiDeleteAlert" />
                  Delete
                </button>
              </div>
            </div>
          </Dropdown> -->
        </div>
      </template>

    </Table>
  </div>


</template>