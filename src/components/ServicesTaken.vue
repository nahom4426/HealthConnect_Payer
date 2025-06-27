<script setup>
import Table from "@/components/Table.vue";
import { computed } from "vue";
import { formatCurrency } from "@/utils/utils";

const props = defineProps({
  search: String,
  data: Object,
});

const filteredData = computed(() => {
  if (!props.search) {
    return props.data?.medicationItems;
  }
  const searchTerm = props.search.toLowerCase();
  return props.data?.medicationItems.filter((item) => {
    return (
      item.providerName.toLowerCase().includes(searchTerm) ||
      item.serviceName.toLowerCase().includes(searchTerm) ||
      item.serviceCode.toString().includes(searchTerm)
    );
  });
});
</script>

<template>
  <div>
    <div class="flex flex-col gap-4 bg-white p-3">
      <div class="flex w-full justify-between items-center">
        <h1 class="text-base-clr">Added Services</h1>
      </div>
      <Table
        :show-pagination="false"
        :rows="filteredData"
        :headers="{
          head: ['Service ID', 'Provider', 'Services', 'Price'],
          row: ['medicationCode', 'providerName', 'medicationName', 'price'],
        }"
        :cells="{
          price: (price) => {
            return formatCurrency(price);
          },
        }"
      >
      </Table>
    </div>
  </div>
</template>
