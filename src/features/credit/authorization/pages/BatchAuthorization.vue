<script setup>
import { ref } from "vue";
import Table from "@/components/Table.vue";
import Button from "@/components/Button.vue";
import icons from "@/utils/icons";
import DefaultPage from "@/components/DefaultPage.vue";
import AuthorizationBatchDataProvider from "../components/AuthorizationBatchDataProvider.vue";
import Dropdown from "@/components/Dropdown.vue";
import { formatDateToYYMMDD, toasted } from "@/utils/utils";
import { openModal } from "@customizer/modal-x";
import StatusRow from "../components/authorizationStatusRow.vue";
function remove(id) {
  openModal(
    "Confirmation",
    {
      title: "Claim rejection",
      message: "Are you sure you want to remove this  claim?",
    },
    (res) => {
      if (res) {
        api.send(
          () => removeService(id),
          (res) => {
            if (res.success) {
              serviceListStore.remove(id);
            }
            toasted(res.success, "Service Removed Successfully", res.error);
          }
        );
      }
    }
  );
}
</script>

<template>
  <DefaultPage placeholder="Search Claim Batch">
    <!-- <template #filter>
      <Dropdown v-slot="{ setRef, toggleDropdown }">
        <button
          @click.prevent="toggleDropdown"
          class="flex justify-center items-center gap-2 rounded-md px-6 py-4 text-primary bg-base-clr3"
        >
          <i v-html="icons.filter"></i>
          <p class="text-base">Filters</p>
        </button>
        <div
          class="flex shadow-lg border p-2 mt-2 rounded flex-col gap-2 w-60 bg-[#F6F7FA]"
          :ref="setRef"
        >
          <button
            class="p-2 flex items-center gap-2 rounded-lg hover:bg-gray-100"
          >
            <span>Status</span>
          </button>
        </div>
      </Dropdown>
    </template> -->

    <template #default="{ search }">
      <AuthorizationBatchDataProvider
        v-slot="{ pending, data }"
        :search="search"
      >
        <Table
          :pending="pending"
          :rows="data"
          :headers="{
            head: [
              'Batch Code',
              'Payer',
              'Requested On',
              'Claim dating from',
              'Claim dating to',
              'Status',
              'Actions',
            ],
            row: [
              'batchCode',
              'payerName',
              'requestedOn',
              'claimDatingFrom',
              'claimDatingTo',
              'status',
            ],
          }"
           :rowCom="StatusRow"
          :cells="{
            requestedOn: (requestedOn) => {
              const date = new Date(requestedOn);
              if (!isNaN(date.getTime())) {
                return formatDateToYYMMDD(date);
              }
            },
          }"
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
                class="flex shadow-lg text-base p-2 mt-2 rounded-lg flex-col gap-2 w-40 bg-white"
                :ref="setRef"
              >
                <button
                  @click="
                    $router.push(`claim-approval/detail/${row.batchCode}`)
                  "
                  class="p-2 flex text-base-clr items-center gap-2 rounded-lg hover:bg-gray-100"
                >
                  <i v-html="icons.edits" />
                  <span>Detail</span>
                </button>

                <button
                  @click="openModal('ClaimApproval', row?.batchCode)"
                  class="p-2 flex text-base-clr items-center gap-2 rounded-lg hover:bg-gray-100"
                >
                  <i v-html="icons.details" />
                  <span>Approve</span>
                </button>
                <button
                   @click="openModal('ClaimRejection', row?.batchCode)"
                  class="p-2 flex items-center text-red-500 bg-[#FFE8E8] gap-2 rounded-lg hover:bg-gray-100"
                >
                  <i v-html="icons.deactivate" />
                  <span>Reject</span>
                </button>
              </div>
            </Dropdown>
          </template>
        </Table>
      </AuthorizationBatchDataProvider>
    </template>
  </DefaultPage>
</template>
