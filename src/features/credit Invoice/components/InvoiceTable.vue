<script setup>
import Table from "@/components/Table.vue";

const props = defineProps({
  headers: {
    type: Object,
  },
  rows: {
    type: Array,
  },
  lastCol: { type: Boolean, default: false },

  pending: {
    type: Boolean,
  },
  rowCom: Object,
});
console.log(props.rows);
</script>
<template>
  <div>
    <Table
      :row-com="props.rowCom"
      :lastCol="props.lastCol"
      :pending="props.pending"
      :headers="props.headers"
      :rows="props.rows"
    >
      <template #lastColHeader>
        <slot name="lastColHeader" />
      </template>
      <template #actions="{ row }">
        <slot name="actions" :row="row" />
      </template>
      <template #lastCol="{ row }">
        <slot name="lastCol" :row="row" />
      </template>
    </Table>
  </div>
</template>
