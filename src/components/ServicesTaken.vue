<script setup>
import Table from "@/components/Table.vue";
import { computed } from "vue";
import { formatCurrency } from "@/utils/utils";
import Price_row from "@/features/credit/authorization/components/price_row.vue";

const props = defineProps({
  search: String,
  data: Object,
});

const filteredData = computed(() => {
  if (!props.search) {
    return props.data?.medicationItems?.filter((el) => {
      return el.itemType === "SERVICE";
    });
  }
  const searchTerm = props.search.toLowerCase();
  return props.data?.medicationItems.filter((item) => {
    return (
      (item.medicationName.toLowerCase().includes(searchTerm) ||
        item.medicationCode.toString().includes(searchTerm)) &&
      item.itemType.toLowerCase() === "service"
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
          head: ['Service ID', 'Service NAme', 'Unit Price', 'Total Price'],
          row: ['medicationCode', 'medicationName', 'unitPrice', 'totalPrice'],
        }"
        :cells="{
          price: (price) => {
            return formatCurrency(price);
          },
        }"
        :rowCom="Price_row"
      >
      </Table>
    </div>
  </div>
</template>
