<script setup lang="ts">
import Button from "@/components/Button.vue";
import { getColumnValue, formatDateToYYMMDD } from "@/utils/utils";
import { useAwashFailedStore } from "../store/awashFailedStore";
import { openModal } from "@customizer/modal-x";

const props = defineProps<{ rowData: any[]; rowKeys: string[]; headKeys: string[] }>();
const store = useAwashFailedStore();

function onRetry(logUuid: string | number) {
  // @ts-ignore - modal registry accepts string keys
  openModal("RetryConfirm", { type: "claim", logUuid });
}

function onInfo(row: any) {
  // @ts-ignore - modal registry accepts string keys
  openModal("AttemptDetails", { type: "claim", row });
}

function truncate(text: string, length = 100) {
  if (!text) return "";
  return text.length > length ? text.slice(0, length) + "…" : text;
}
</script>

<template>
  <tr class="bg-white" v-for="(row, idx) in props.rowData" :key="row.id ?? idx">
    <td class="p-3">{{ idx + 1 }}</td>
    <td class="p-3" v-for="key in props.rowKeys" :key="key">
      <template v-if="key === 'claimFromDate' || key === 'claimToDate' || key === 'createdAt' || key === 'lastAttemptAt'">
        <span>{{ row[key] ? formatDateToYYMMDD(new Date(row[key])) : '' }}</span>
      </template>
      <template v-else-if="key === 'status'">
        <span
          class="px-2 py-1 text-xs font-medium rounded"
          :class="row.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
        >
          {{ row.status }}
        </span>
      </template>
      <template v-else-if="key === 'errorMessage'">
        <span :title="row.errorMessage">{{ truncate(row.errorMessage, 100) }}</span>
      </template>
      <template v-else>
        <span>{{ getColumnValue(key, row) }}</span>
      </template>
    </td>
    <td class="p-3" v-if="props.headKeys.includes('Actions')">
      <div class="flex items-center gap-2">
        <Button v-if="store.status === 'INACTIVE'" type="primary" class="!text-white" @click="onRetry(row.logUuid)">
          Retry
        </Button>
        <Button v-else type="secondary" @click="onInfo(row)">
          Info
        </Button>
      </div>
    </td>
  </tr>
</template>

