<script setup>
import { ref } from "vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { useAuthStore } from "@/stores/auth";
import Table from "@/components/Table.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import { getAllServices, removeService } from "../api/serviceApi.ts";
import { usePagination } from "@/composables/usePagination";
import icons from "@/utils/icons";
import Button from "@/components/Button.vue";
import { openModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
const api = useApiRequest();
const authStore = useAuthStore();
const pagination = usePagination({
  cb: (data) =>
    getAllServices(authStore.auth?.user?.providerUuid, {
      ...data,
    }),
});

function remove(id) {
  api.send(
    () => removeService(id),
    (res) => {
      toasted(res.success, "Service Removed Successfully", res.error);
    }
  );
}
</script>
<template>
  <div class="flex flex-col gap-8 px-4">
    <DefaultPage v-model="search">
      <div class="flex w-full justify-end pt-4 text-white">
        <Button @click.prevent="openModal('AddService')" class="bg-primary"
          >Add Service</Button
        >
      </div>
      <Table
        :pending="pagination.pending.value"
        :rows="pagination.data.value"
        :headers="{
          head: ['Category', 'Sub Category', 'Services', 'actions'],
          row: ['serviceName', 'subCategory', 'item'],
        }"
      >
        <template #actions="{ row }">
          <div class="flex gap-4 items-center">
            <button
              class="size-8 shadow-md rounded-full bg-accent flex justify-center items-center"
              @click="openModal('ServiceManagement', row?.serviceUuid)"
            >
              <i v-html="icons.edit" />
            </button>
            <button @click="remove(row?.serviceUuid)">delete</button>
          </div>
        </template>
      </Table>
    </DefaultPage>
  </div>
</template>
