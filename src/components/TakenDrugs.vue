<script setup>
import Table from "@/components/Table.vue";
import { computed } from "vue";
import { formatCurrency } from "@/utils/utils";

const props = defineProps({
  search: String,
  data: Array,
  pending: Boolean,
});

const filteredData = computed(() => {
  if (!props.search) {
    return props.data?.medicationItems?.filter((el) => {
      return el.itemType === "DRUG";
    });
  }
  const searchTerm = props.search.toLowerCase();
  return props.data?.medicationItems.filter((item) => {
    return (
      (item.medicationName.toLowerCase().includes(searchTerm) ||
        item.medicationCode.toString().includes(searchTerm)) &&
      item.itemType.toLowerCase() === "drug"
    );
  });
});
</script>

<template>
  <div>
    <div class="flex flex-col gap-4 bg-white p-3">
      <div class="flex w-full justify-between items-center">
        <h1 class="text-base-clr">Added Drugs</h1>
      </div>
      <Table
        :pending="pending"
        :show-pagination="false"
        :rows="filteredData"
        :headers="{
          head: ['Code', 'Drug Name', 'Price (ETB)', 'Status', 'actions'],
          row: ['drugCode', 'drugName', 'price', 'status'],
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
