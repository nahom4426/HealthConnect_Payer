<script setup>
import Button from "@/components/Button.vue";
import Table from "@/components/Table.vue";
import { ref } from "vue";

const entries = ref([
  {
    name: "John Doe",
    insuranceId: "123456789",
    relationship: "Self",
    institutionName: "ABC Hospital",
    payerName: "XYZ Insurance",
    status: "Active",
  },
  {
    name: "John Doe",
    insuranceId: "123456789",
    relationship: "Self",
    institutionName: "ABC Hospital",
    payerName: "XYZ Insurance",
    status: "Active",
  },
  {
    name: "John Doe",
    insuranceId: "123456789",
    relationship: "Self",
    institutionName: "ABC Hospital",
    payerName: "XYZ Insurance",
    status: "Active",
  },
  {
    name: "John Doe",
    insuranceId: "123456789",
    relationship: "Self",
    institutionName: "ABC Hospital",
    payerName: "XYZ Insurance",
    status: "Active",
  },
  {
    name: "John Doe",
    insuranceId: "123456789",
    relationship: "Self",
    institutionName: "ABC Hospital",
    payerName: "XYZ Insurance",
    status: "Active",
  },
  {
    name: "John Doe",
    insuranceId: "123456789",
    relationship: "Self",
    institutionName: "ABC Hospital",
    payerName: "XYZ Insurance",
    status: "Active",
  },
  {
    name: "John Doe",
    insuranceId: "123456789",
    relationship: "Self",
    institutionName: "ABC Hospital",
    payerName: "XYZ Insurance",
    status: "Active",
  },
  {
    name: "John Doe",
    insuranceId: "123456789",
    relationship: "Self",
    institutionName: "ABC Hospital",
    payerName: "XYZ Insurance",
    status: "Active",
  },
  {
    name: "John Doe",
    insuranceId: "123456789",
    relationship: "Self",
    institutionName: "ABC Hospital",
    payerName: "XYZ Insurance",
    status: "Active",
  },
]);
const search = ref("");
</script>
<template>
  <div class="flex flex-col gap-4">
    <div class="relative">
      <img
        class="w-full h-[335px]"
        src="../../../assets//img/frame.png"
        alt=""
      />
      <!-- Search input fixed at bottom of image -->
      <div class="absolute top-[210px] flex flex-col gap-2 left-11 right-11">
        <div class="rounded-md bg-white items-center p-2 flex">
          <i class="fa fa-search"></i>
          <input
            v-model="search"
            type="text"
            placeholder="Search ..."
            class="w-full p-2"
          />
        </div>
        <div class="bg-white rounded-md p-4" v-if="search">
          <Table
            :showPagination="false"
            ,
            :headers="{
              head: [
                'Name',
                'Assured Id ',
                'Relationship',
                'Institution Name',
                'Insurance Name',
                'Status ',
                'actions',
              ],
              row: [
                'name',
                'insuranceId',
                'relationship',
                'institutionName',
                'payerName',
                'status',
              ],
            }"
            :rows="entries"
          >
            <template #actions="{ row }">
              <div class="flex gap-4 items-center">
                <Button size="xs" type="secondary">
                  <div class="text-white">Select</div>
                </Button>
              </div>
            </template>
          </Table>
        </div>
      </div>
    </div>

    <!-- Table starts below the image -->
  </div>
</template>
