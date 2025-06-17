<script setup>
import DataTable from "./DataTable.vue";
import { inject, ref, useAttrs, watch } from "vue";
import GenericTableRow from "./GenericTableRow.vue";
import TableRowSkeleton from "./TableRowSkeleton.vue";
import icons from "@/utils/icons";

const emit = defineEmits([
  "row",
  "action:certificate",
  "action:delete",
  "action:review",
  "action:suspend",
  "action:edit",
  "bottom",
]);

const props = defineProps({
  showPagination: {
    type: Boolean,
    default: true,
  },
  rowCom: Object,
  actionHide: String,
  headers: {
    type: [Array, Object],
    required: true,
  },
  rows: {
    type: Array,
    default: [],
  },
  lastCol: { type: Boolean, default: false },
  firstCol: { type: Boolean, default: false },
  placeholder: String,
  photoRow: Object,
  cells: Object,
  actions: Array,
  exceptions: Array,
  length: Number,
  Fallback: {
    type: Object,
    default: TableRowSkeleton,
  },
  pending: Boolean,
});

function toUpper(str) {
  let words = str.split(" ");
  if (words.length == 0) return str;

  for (let i = 1; i < words.length; i++) {
    words[0] += words[i].charAt(0).toUpperCase() + words[i].substring(1);
  }

  return words[0];
}

const spec = ref({ head: [], row: [] });

function format() {
  if (Array.isArray(props.headers)) {
    spec.value.head = props.headers;

    const res = props.headers.reduce((state, el) => {
      const temp = el.toLowerCase();
      state.push(toUpper(temp));
      return state;
    }, []);

    spec.value.row = res.filter((el) => el != "modify");
  } else {
    spec.value.head = props.headers?.head || [];
    spec.value.row = props.headers?.row || [];
  }
}

format();

watch(
  () => props.headers,
  () => {
    format();
  }
);

const nextPage = inject("next", null);
const previousPage = inject("previous", null);
const send = inject("send", () => {});
const page = inject("page", 1);
const searchTotalPages = inject("searchTotalPages");
const totalPages = inject("totalPages", 1);

const perPage = inject("perPage", 25);
const totalElements = inject("totalElements");

const selectedValue = ref(25);
const active = ref(1);
</script>
<template>
  <DataTable
    :lastCol="props.lastCol"
    :firstCol="props.firstCol"
    class="bg-table-clr border border-white/10"
    :headers="spec.head"
  >
    <template v-if="lastCol" #lastColHeader="{ row }">
      <slot name="lastColHeader" :row="row" />
    </template>
    <template v-if="firstCol" #headerFirst="{ row }">
      <slot name="headerFirst" :row="row" />
    </template>
    <template v-if="rowCom">
      <component
        :is="rowCom"
        v-bind="{
          cells: cells,
          headKeys: spec.head,
          rowData: rows,
          rowKeys: spec.row,
        }"
      />
    </template>
    <template v-else>
      <GenericTableRow
        @row="(row) => emit('row', row)"
        :firstCol="props.firstCol"
        :lastCol="props.lastCol"
        :head-keys="spec.head"
        :row-data="rows"
        :row-keys="spec.row"
        :cells="cells"
      >
        <template v-if="firstCol" #select="{ row }">
          {{ console.log("kkk") }}
          <slot name="select" :row="row" />
        </template>
        <template v-if="lastCol" #lastCol="{ row }">
          <slot name="lastCol" :row="row" />
        </template>

        <template #actions="{ row }">
          <slot name="actions" :row="row" />
        </template>
      </GenericTableRow>
      <tr v-if="!rows?.length && !pending">
        <td :colspan="spec.head.length + 1">
          <slot name="placeholder">
            <div class="flex flex-col gap-2 items-center">
              <div
                class="flex-1 w-full flex justify-center py-5 h-full size-28 *:h-56"
                v-html="icons.no_data"
              />
              <p class="text-xl">
                {{ placeholder ? placeholder : "No Data Found" }}
              </p>
            </div>
          </slot>
        </td>
      </tr>
    </template>
    <template v-if="pending">
      <component
        :cols="spec.head.length + 1"
        :key="num"
        v-for="num in 25"
        :is="Fallback"
      />
    </template>
  </DataTable>
  <div
    v-if="!pending && showPagination"
    class="flex justify-between p-4 items-center"
  >
    <div class="flex gap-5 items-center">
      <span class="text-base-clr">Showing</span>
      <select
        @change="send(parseInt($event.target.value))"
        class="px-3 py-2 rounded-md bg-base-clr3"
        v-model="selectedValue"
      >
        <option selected value="25">25</option>
        <option value="50">50</option>
        <option value="75">75</option>
        <option value="100">100</option>
      </select>
    </div>
    <div class="text-base-clr">
      Showing {{ selectedValue - 24 }} to {{ perPage }} out of records
    </div>
    <div class="flex gap-[10px] items-center justify-between">
      <i @click="" class="px-3" v-html="icons.chevron_left"></i>
      <div
        @click="active > key ? nextPage : previousPage"
        v-for="key in 4"
        class="font-semibold rounded py-1 px-3 cursor-pointer"
        :class="[active === key ? 'border border-base-clr' : ' ']"
      >
        {{ key }}
      </div>
      <i
        @click="nextPage"
        class="px-3 cursor-pointer"
        v-html="icons.chevron_right"
      ></i>
    </div>
  </div>
</template>
