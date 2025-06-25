<script setup>
import { ref } from "vue";
import Table from "@/components/Table.vue";
import InsuredPersonsDataProvider from "../components/InsuredPersonsDataProvider.vue";
import StatusRow from "../components/InsuredPersonStatusRow.vue";
import { useAuthStore } from "@/stores/auth";
import FamilyDataProvider from "../components/FamilyDataProvider.vue";
import Dropdown from "@/components/Dropdown.vue";
import icons from "@/utils/icons";
import { openModal } from "@customizer/modal-x";
const props = defineProps({
  search: String,
});

const dataProvider = ref();
const auth = useAuthStore();
const institutionId = ref(auth.auth?.user?.payerUuid || "");
</script>

<template>
  <FamilyDataProvider
    :id="institutionId"
    :search="props.search"
    v-slot="{ group, pending }"
  >
    <Table
      :pending="pending"
      :headers="{
        head: [
          'Group Name',
          'Allowed Category Services',
          'Number of Employees',
          'Actions',
        ],
        row: ['groupName', 'groupDescription', 'phone'],
      }"
      :rows="group"
    >
      <template #actions="{ row }">
        <Dropdown v-slot="{ setRef, toggleDropdown }">
          <div
            @click.prevent="toggleDropdown"
            class="flex items-center gap-2 px-5 py-3 rounded-lg cursor-pointer"
          >
            <button>
              <i v-html="icons.threeDots"></i>
            </button>
          </div>
          <div
            class="flex shadow-lg text-base p-2 mt-2 rounded-lg flex-col gap-2 w-60 bg-white"
            :ref="setRef"
          >
            <button
              @click="openModal('EditGroup', row?.groupId)"
              class="p-2 flex text-base-clr items-center gap-2 rounded-lg hover:bg-gray-100"
            >
              <i v-html="icons.edits" />
              <span>Edit</span>
            </button>
            <button
              @click="openModal('ServiceManagement', row?.groupId)"
              class="p-2 flex text-base-clr items-center gap-2 rounded-lg hover:bg-gray-100"
            >
              <i v-html="icons.details" />
              <span>Detail</span>
            </button>
            <button
              @click="remove(row?.groupId)"
              class="p-2 flex items-center text-red-500 gap-2 rounded-lg hover:bg-gray-100"
            >
              <i v-html="icons.deactivate" />
              <span>Mark as unavailable</span>
            </button>
          </div>
        </Dropdown>
      </template>
    </Table>
  </FamilyDataProvider>
</template>
