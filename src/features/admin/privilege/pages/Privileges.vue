<script setup>
import Table from '@/components/Table.vue';
import PrivilegesDataProvider from '../components/PrivilegesDataProvider.vue';
import { usePagination } from '@/composables/usePagination';
import { usePrivilege } from '../store/privilegeStore';
import { useApiRequest } from '@/composables/useApiRequest';
import { toasted } from '@/utils/utils';
import TableRowSkeleton from '@/components/TableRowSkeleton.vue';
import { getAllPrivilege, removePrivilege } from '../Api/PrivilegeApi';
import { openModal } from '@customizer/modal-x';
import Dropdown from '@/components/Dropdown.vue';
import BaseIcon from '@/components/base/BaseIcon.vue';
import { mdiDeleteAlert, mdiDotsVertical, mdiPencil } from '@mdi/js';

const privilegeStore = usePrivilege();
const pagination = usePagination({
  state: privilegeStore,
  cb: getAllPrivilege,
})

const removeReq = useApiRequest();

function remove(id) {
  // Use the same pattern as in other files that successfully use modals
  openModal('Confirmation', {
    title: 'Remove Privilege',
    message: 'Are you sure you want to delete this privilege?'
  }, (res) => {
    if (res) {
      removeReq.send(
        () => removePrivilege(id),
        (res) => {
          if (res.success) {
            privilegeStore.remove(id);
            toasted(true, 'Removed Successfully');
          } else {
            toasted(false, '', res.error || 'Failed to remove privilege');
          }
        }
      );
    }
  });
}
</script>

<template>
  <div class="p-7">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-semibold">Privileges</h1>
      <button class="bg-primary text-white px-4 py-2 rounded-md" @click="$router.push('/add_privilege')">
        Add Privilege
      </button>
    </div>
    
    <PrivilegesDataProvider v-slot="{ privileges, pending }">
      <Table :headers="{
        head: [
          'Privilege Name',
          'Privilege Description',
          'Privilege Category',
          'Actions',
        ],
        row: [
          'privilegeName',
          'privilegeDescription',
          'privilegeCategory',
        ]
      }" :pending="pending" :rows="privileges || []">
        <template #actions="{ row }">
          <div class="flex gap-2">
            <button class="rounded-lg bg-gray-600 text-white px-2 py-1 border-gray-300 flex gap-1"
              @click='$router.push("/edit_privilege/" + row?.privilegeUuid)'>
              <BaseIcon :path="mdiPencil" />
              Edit
            </button>
            <button class="rounded-lg bg-[#FF4C4C] text-white px-2 py-1 border-gray-300 flex gap-1"
              @click="remove(row?.privilegeUuid)">
              <BaseIcon :path="mdiDeleteAlert" />
              Delete
            </button>
          </div>
        </template>
      </Table>
    </PrivilegesDataProvider>
  </div>
</template>
