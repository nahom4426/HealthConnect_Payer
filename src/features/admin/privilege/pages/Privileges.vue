<script setup>
import { ref } from "vue";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import PrivilegesDataProvider from "../components/PrivilegesDataProvider.vue";
import StatusRow from "../components/PrivilegeStatusRow.vue";
import icons from "@/utils/icons";

const dataProvider = ref();


</script>

<template>
  <DefaultPage  placeholder="Search Privileges">
    <template #filter>
      <button
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 text-primary bg-base-clr3"
      >
        <i v-html="icons.filter"></i>
        <p class="text-base">Filters</p>
      </button>
    </template>

    <template #add-action>
      <button
        class="flex justify-center items-center gap-2 rounded-md px-6 py-4 bg-primary text-white"
        @click="$router.push('/add_privilege')"
      >
        <i v-html="icons.plus_circle"></i>
        <p class="text-base">Add Privilege</p>
      </button>
    </template>

    <template #default="{ search }">
      <PrivilegesDataProvider
        ref="dataProvider"
        :search="search"
        v-slot="{ privileges, pending,  }"
      >
      
        <Table
          :pending="pending"
          :headers="{
            head: ['Privilege Name', 'Description', 'Category', 'Actions'],
            row: ['privilegeName', 'privilegeDescription', 'privilegeCategory'],
          }"
          :rows="privileges"
          :rowCom="StatusRow"
        
        >
         
        </Table>
      </PrivilegesDataProvider>
    </template>
  </DefaultPage>
</template>
