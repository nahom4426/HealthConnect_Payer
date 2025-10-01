<script setup lang="ts">
import DefaultPage from "@/components/DefaultPage.vue";
import Table from "@/components/Table.vue";
import icons from "@/utils/icons";
import { onMounted, watch } from "vue";
import { useAwashFailedStore } from "../store/awashFailedStore";
import AwashServiceRow from "../components/AwashServiceRow.vue";

const store = useAwashFailedStore();

onMounted(() => {
  store.fetchServices();
});

watch(
  () => store.status,
  () => {
    store.fetchServices();
  }
);
</script>

<template>
   

    <Table
      :pending="store.loading"
      :rows="store.services"
      :headers="{
        head: [
     
          'Service ID',
          'Quantity',
          'Total Price',
          'Provided Date',
          'Status',
          'Error Message',
          'Actions',
        ],
        row: [
     
          'serviceId',
          'quantity',
          'totalPrice',
          'providedDate',
          'status',
          'errorMessage',
        ],
      }"
      :row-com="AwashServiceRow"
    />

</template>

