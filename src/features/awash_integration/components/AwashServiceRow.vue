<script setup>
import Button from "@/components/Button.vue";
import { getColumnValue, formatDateToYYMMDD } from "@/utils/utils";
import { useAwashFailedStore } from "../store/awashFailedStore";
import { openModal } from "@customizer/modal-x";

const props = defineProps({
  rowData: {
    type: Array,
    default: () => []
  },
  rowKeys: {
    type: Array,
    default: () => []
  },
  headKeys: {
    type: Array,
    default: () => []
  }
});

const store = useAwashFailedStore();

function onRetry(logUuid) {
  openModal("RetryConfirm", { type: "service", logUuid });
}

function onInfo(row) {
  openModal("AttemptDetails", { type: "service", row }     
  );
  console.log(row);
}

function truncate(text, length = 80) {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "…" : text;
}
</script>

<template>
  <tr class="bg-white" v-for="(row, idx) in props.rowData" :key="row.id ?? idx">
    <td class="p-3">{{ idx + 1 }}</td>

    <td class="p-3" v-for="key in props.rowKeys" :key="key">
      <!-- Dates -->
      <template v-if="key === 'providedDate' || key === 'createdAt' || key === 'lastAttemptAt'">
        <span>{{ row[key] ? formatDateToYYMMDD(new Date(row[key])) : "" }}</span>
      </template>

      <!-- Status -->
      <template v-else-if="key === 'status'">
        <span
          class="px-2 py-1 text-xs font-medium rounded"
          :class="row.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
        >
          {{ row.status }}
        </span>
      </template>

      <!-- Error Message -->
      <template v-else-if="key === 'errorMessage'">
        <span :title="row.errorMessage">{{ truncate(row.errorMessage, 100) }}</span>
      </template>

      <!-- Default -->
      <template v-else>
        <span>{{ getColumnValue(key, row) }}</span>
      </template>
    </td>

    <!-- Actions -->
    <td class="p-3" v-if="props.headKeys.includes('Actions')">
      <div class="flex items-center gap-2">
        <Button
          v-if="store.status === 'INACTIVE'"
          type="primary"
          class="!text-white"
          @click="onRetry(row.logUuid)"
        >
          Retry
        </Button>
        <Button
          v-else
          type="secondary"
          @click="onInfo(row)"
        >
          Info
        </Button>
      </div>
    </td>
  </tr>
</template>
