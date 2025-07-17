<script setup>
import DataTable from "./DataTable.vue";
import { inject, ref, useAttrs, watch, computed } from "vue";
import GenericTableRow from "./GenericTableRow.vue";
import TableRowSkeleton from "./TableRowSkeleton.vue";
import icons from "@/utils/icons";
import Button from "./Button.vue";

const emit = defineEmits([
  "row",
  "action:certificate",
  "action:delete",
  "action:review",
  "action:suspend",
  "action:edit",
  "bottom",
  "select-payer",
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
    default: () => [],
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
  customActions: Boolean,
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

const nextPage = inject("next", () => {});
const previousPage = inject("previous", () => {});
const sendPagination = inject("sendPagination", () => {});
const page = inject("page", 1);
const searchTotalPages = inject("searchTotalPages", null);
const totalPages = inject("totalPages", 1);
const perPage = inject("perPage", 25);
const totalElements = inject("totalElements", null);
const pageChanger = inject("pageChanger", (page) => {
  sendPagination(perPage, page - 1);
});

const selectedValue = ref(25);
const active = ref(1);

function handleRowSelection(payerUuid) {
  emit('select-payer', payerUuid);
}

function handlePageChange(newPage) {
  active.value = newPage;
  pageChanger(newPage);
}

// Computed property to check if we have data to display
const hasData = computed(() => {
  return props.rows && props.rows.length > 0;
});

// Computed property to check if we should show the empty state
const showEmptyState = computed(() => {
  return !props.pending && !hasData.value;
});

// Range utility for pagination numbers
const range = (start, end) => {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};
</script>

<template>
  <div class="space-y-6 bg-white">
    <DataTable
      :lastCol="props.lastCol"
      :firstCol="props.firstCol"
      class="bg-white border border-white/10"
      :headers="spec.head"
    >
      <template v-if="lastCol" #lastColHeader="{ row }">
        <slot name="lastColHeader" :row="row" />
      </template>
      <template v-if="firstCol" #headerFirst="{ row }">
        <slot name="headerFirst" :row="row" />
      </template>
      
      <!-- Show row component if we have data -->
      <template v-if="hasData">
        <template v-if="rowCom">
          <component
            :is="rowCom"
            v-bind="{
              cells: cells,
              headKeys: spec.head,
              rowData: rows,
              rowKeys: spec.row,
              pending: pending,
            }"
            @select-payer="handleRowSelection"
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
              <slot name="select" :row="row" />
            </template>
            <template v-if="lastCol" #lastCol="{ row }">
              <slot name="lastCol" :row="row" />
            </template>
  
            <template #actions="{ row }">
              <slot name="actions" :row="row" />
            </template>
          </GenericTableRow>
        </template>
      </template>
      
      <!-- Empty state - show when no data and not loading -->
      <tr v-if="showEmptyState">
        <td :colspan="spec.head.length + 1">
          <slot name="placeholder">
            <div class="flex flex-col gap-2 items-center py-8">
              <div class="flex-1 w-full flex justify-center py-5 h-full">
                <img src="../assets/img/noData.gif" alt="No Data" class="h-56" />
              </div>
              <p class="text-xl text-gray-600">
                {{ placeholder ? placeholder : "No Data Found" }}
              </p>
            </div>
          </slot>
        </td>
      </tr>
      
      <!-- Loading state -->
      <template v-if="pending">
        <component
          :cols="spec.head.length + 1"
          :key="num"
          v-for="num in 25"
          :is="Fallback"
        />
      </template>
    </DataTable>

    <!-- Pagination -->
    <div
      v-if="!pending && showPagination && hasData"
      class="flex justify-between p-4 items-center flex-wrap gap-4"
    >
      <div class="flex gap-5 items-center">
        <span class="text-gray-600">Show</span>
        <select
          @change="sendPagination(parseInt($event.target.value), 0)"
          class="px-3 py-2 rounded-md bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          v-model="selectedValue"
        >
          <option selected value="25">25</option>
          <option value="50">50</option>
          <option value="75">75</option>
          <option value="100">100</option>
        </select>
        <span class="text-gray-600">entries</span>
      </div>
      
      <div class="text-gray-600">
        Showing {{ rows?.length || 0 }} of {{ totalElements || 0 }} records
      </div>
      
      <div class="flex gap-2 items-center justify-center flex-wrap">
        <button
          @click="previousPage"
          class="pagination-button"
          :disabled="page === 1 || pending"
        >
          <i v-html="icons.chevron_left"></i>
        </button>
        
        <template v-if="totalPages <= 7">
          <button
            v-for="pageNum in totalPages"
            :key="pageNum"
            @click="handlePageChange(pageNum)"
            class="pagination-button"
            :class="{ 'active-page': page === pageNum }"
          >
            {{ pageNum }}
          </button>
        </template>
        
        <template v-else>
          <button
            @click="handlePageChange(1)"
            class="pagination-button"
            :class="{ 'active-page': page === 1 }"
          >
            1
          </button>
          
          <template v-if="page < 4">
            <button
              v-for="pageNum in range(2, 4)"
              :key="pageNum"
              @click="handlePageChange(pageNum)"
              class="pagination-button"
              :class="{ 'active-page': page === pageNum }"
            >
              {{ pageNum }}
            </button>
            <span class="px-2">...</span>
          </template>
          
          <template v-else-if="page > totalPages - 3">
            <span class="px-2">...</span>
            <button
              v-for="pageNum in range(totalPages - 3, totalPages - 1)"
              :key="pageNum"
              @click="handlePageChange(pageNum)"
              class="pagination-button"
              :class="{ 'active-page': page === pageNum }"
            >
              {{ pageNum }}
            </button>
          </template>
          
          <template v-else>
            <span class="px-2">...</span>
            <button
              v-for="pageNum in [page - 1, page, page + 1]"
              :key="pageNum"
              @click="handlePageChange(pageNum)"
              class="pagination-button"
              :class="{ 'active-page': page === pageNum }"
            >
              {{ pageNum }}
            </button>
            <span class="px-2">...</span>
          </template>
          
          <button
            @click="handlePageChange(totalPages)"
            class="pagination-button"
            :class="{ 'active-page': page === totalPages }"
          >
            {{ totalPages }}
          </button>
        </template>
        
        <button
          @click="nextPage"
          class="pagination-button"
          :disabled="page === totalPages || pending"
        >
          <i v-html="icons.chevron_right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pagination-button {
  min-width: 2.5rem;
  height: 2.5rem;
  padding: 0 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  color: #4a5568;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-button:hover:not(:disabled) {
  background-color: #f7fafc;
  border-color: #cbd5e0;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.active-page {
  background-color: #4299e1;
  color: white;
  border-color: #4299e1;
}

@media (max-width: 768px) {
  .pagination-wrapper {
    flex-direction: column;
    gap: 1rem;
  }
  
  .pagination-controls {
    order: 3;
    margin-top: 1rem;
  }
  
  .pagination-info {
    order: 2;
  }
  
  .pagination-button {
    min-width: 2.25rem;
    height: 2.25rem;
    font-size: 0.875rem;
  }
}
</style>