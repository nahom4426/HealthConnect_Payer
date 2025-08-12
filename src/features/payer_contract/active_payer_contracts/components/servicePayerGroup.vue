<script setup>
import { ref } from "vue";
import Table from "@/components/Table.vue";
import { useAuthStore } from "@/stores/auth";

import Dropdown from "@/components/Dropdown.vue";
import icons from "@/utils/icons";
import { openModal } from "@customizer/modal-x";
import { useRoute } from "vue-router";
import CoverageDataProvider from "@/features/product_settings/components/CoverageDataProvider.vue";

const props = defineProps({
  search: String,
});

const auth = useAuthStore();
const route = useRoute(); // access route params
const institutionId = ref(auth.auth?.user?.payerUuid || "");
</script>

<template>
    <CoverageDataProvider
        ref="dataProvider"
        :search="search"
        v-slot="{ packages, pending, currentPage, itemsPerPage, totalPages }"
      >
        <Table
          :pending="pending"
          :headers="{
            head: [
              'Package Name',
              'Category',
              'Description',
              'Services Count',
              'Status',
              'Actions',
            ],
            row: [
           
              'categoryName',
              'categoryCode',
              'description',
              'eligibleServices',
              'status',
            ],
          }"
          :rows="packages"
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
               @click="openModal('AddServiceToContractPackage', {
  data: {  // Wrap props in data object
    categoryUuid: row?.categoryUuid,
    contractHeaderUuid: route.params.contractHeaderUuid
  }
});"
              class="p-2 flex text-base-clr items-center gap-2 rounded-lg hover:bg-gray-100"
            >
              <i v-html="icons.edits" />
              <span>Add Service</span>
            </button>
 <button
               @click="openModal('RemoveServiceToContract', {
  data: {  // Wrap props in data object
    categoryUuid: row?.categoryUuid,
    contractHeaderUuid: route.params.contractHeaderUuid
  }
});"
              class="p-2 flex text-base-clr items-center gap-2 rounded-lg  hover:bg-red-600 hover:text-white"
            >
              <i v-html="icons.trash" />
              <span>Remove Services</span>
            </button>
            <!-- <button
              @click="
                $router.push(`/insured_list/group-insured/${row?.categoryUuid}`)
              "
              class="p-2 flex text-base-clr items-center gap-2 rounded-lg hover:bg-gray-100"
            >
              <i v-html="icons.details" />
              <span>Detail</span>
            </button> -->

            <!-- <button
              @click="remove(row?.categoryUuid)"
              class="p-2 flex items-center text-red-500 gap-2 rounded-lg hover:bg-gray-100"
            >
              <i v-html="icons.deactivate" />
              <span>Mark as unavailable</span>
            </button> -->
          </div>
        </Dropdown>
      </template>
    </Table>
  </CoverageDataProvider>
</template>
