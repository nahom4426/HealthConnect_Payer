<script setup >
import { useRouter } from 'vue-router';
import Table from '@/components/Table.vue';
import TableRowSkeleton from '@/components/TableRowSkeleton.vue';
import DefaultPage from "@/components/DefaultPage.vue";
import icons from "@/utils/icons";
import RolesDataProvider from '../components/RolesDataProvider.vue';
import Dropdown from '@/components/Dropdown.vue';

const router = useRouter();

</script>

<template>
   <DefaultPage  placeholder="Search Roles">
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
        @click.prevent="$router.push('/create-role')"
      >
        <i v-html="icons.plus_circle"></i>
        <p class="text-base">Add Role</p>
      </button>
    </template>

    <template #default="{ search }">
      <RolesDataProvider
        ref="dataProvider"
        :search="search"
        v-slot="{ roles, pending,  }"
      >
      
        <Table 
        :pending="pending" 
        :headers="{
          head: [
            'Role Name',
            'Role Description',
            'Actions',
          ],
          row: [
            'roleName',
            'roleDescription',
          ]
        }" 
        :rows="roles"
        :Fallback="TableRowSkeleton"
      >
      <template #actions="{row}">
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
          class="flex shadow-lg text-base p-2 mt-2 rounded-lg flex-col gap-2 bg-white"
          :ref="setRef"
        >
          <button @click.prevent="$router.push(`/edit_role/${row?.roleUuid}`)"
            class="p-2 flex text-base-clr items-center gap-2 rounded-lg hover:bg-gray-100"
          >
            <i v-html="icons.edits" />
            <span>Edit</span>
          </button>

          <button
          
            class="p-2 flex text-base-clr items-center gap-2 rounded-lg hover:bg-gray-100"
          >
            <i v-html="icons.details" />
            <span>Detal</span>
          </button>
          
        </div>
      </Dropdown>
      </template>
         
        </Table>
      </RolesDataProvider>
    </template>
  </DefaultPage>
  </template>