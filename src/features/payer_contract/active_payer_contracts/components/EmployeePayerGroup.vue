<script setup>
import { ref } from "vue";
import Table from "@/components/Table.vue";
import { useAuthStore } from "@/stores/auth";
import FamilyDataProvider from "@/features/insured_persons/components/FamilyDataProvider.vue";
import Dropdown from "@/components/Dropdown.vue";
import icons from "@/utils/icons";
import { openModal } from "@customizer/modal-x";
import { useRoute } from "vue-router";

const props = defineProps({
  search: String,
});

const auth = useAuthStore();
const route = useRoute(); // access route params
const institutionId = ref(auth.auth?.user?.payerUuid || "");
</script>

<template>
  <FamilyDataProvider
    :id="institutionId"
    :search="props.search"
    v-slot="{ group, pending }"
  >
    <Table
      :show-pagination="false"
      :pending="pending"
      :headers="{
        head: [
          'Group Name',
          'Allowed Category Services',
          'Number of Employees',
          'Actions',
        ],
        row: ['groupName', 'groupDescription', 'estimatedMembers'],
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
               @click="openModal('AddServiceToContract', {
  data: {  // Wrap props in data object
    groupUuid: row?.groupUuid,
    contractHeaderUuid: route.params.contractHeaderUuid
  }
});"
              class="p-2 flex text-base-clr items-center gap-2 rounded-lg hover:bg-gray-100"
            >
              <i v-html="icons.edits" />
              <span>Add Service</span>
            </button>

            <!-- <button
              @click="
                $router.push(`/insured_list/group-insured/${row?.groupUuid}`)
              "
              class="p-2 flex text-base-clr items-center gap-2 rounded-lg hover:bg-gray-100"
            >
              <i v-html="icons.details" />
              <span>Detail</span>
            </button> -->

            <!-- <button
              @click="remove(row?.groupUuid)"
              class="p-2 flex items-center text-red-500 gap-2 rounded-lg hover:bg-gray-100"
            >
              <i v-html="icons.deactivate" />
              <span>Mark as unavailable</span>
            </button> -->
          </div>
        </Dropdown>
      </template>
    </Table>
  </FamilyDataProvider>
</template>
