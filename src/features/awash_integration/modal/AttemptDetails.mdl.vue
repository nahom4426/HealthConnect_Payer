<script setup>
import ModalParent from "@/components/ModalParent.vue";
import Button from "@/components/Button.vue";
import { closeModal } from "@customizer/modal-x";
import { secondDateFormatWithTime } from "@/utils/utils";

// modal-x passes payload under a single 'data' prop
const props = defineProps({
  data: {
    type: String, // "service" | "claim"
    row: Object
  }
});

const row = props.data?.row || {};

function formatTs(v) {
  if (!v) return "-";
  try {
    return secondDateFormatWithTime(v);
  } catch (e) {
    return v;
  }
}
</script>

<template>
  <ModalParent name="AttemptDetails">
    <div class="p-6 bg-white rounded-xl w-[660px] max-w-[92vw]">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold">
            {{ props.data.type === "service" ? "Service" : "Claim" }} Attempt Details
          </h3>
          <p class="text-sm text-gray-500">
            Log UUID:
            <span class="font-mono break-all">{{ row.logUuid || "-" }}</span>
          </p>
        </div>
        <Button class="border" @click="closeModal">Close</Button>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <!-- Status & Counters -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium mb-2">Status & Counters</h4>
          <ul class="text-sm space-y-1 text-gray-700">
            <li>
              <span class="text-gray-500">Status:</span>
              <span
                class="ml-2 px-2 py-0.5 rounded text-xs"
                :class="
                  row.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                "
                >{{ row.status || "-" }}</span
              >
            </li>
            <li>
              <span class="text-gray-500">Retry Count:</span>
              <span class="ml-2">{{ row.retryCount ?? "-" }}</span>
            </li>
            <li>
              <span class="text-gray-500">Max Retries:</span>
              <span class="ml-2">{{ row.maxRetries ?? "-" }}</span>
            </li>
          </ul>
        </div>

        <!-- Identifiers -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium mb-2">Identifiers</h4>
          <ul class="text-sm space-y-1 text-gray-700">
            <li v-if="row.serviceId">
              <span class="text-gray-500">Service ID:</span>
              <span class="ml-2">{{ row.serviceId }}</span>
            </li>
            <li v-if="row.batchCode">
              <span class="text-gray-500">Batch Code:</span>
              <span class="ml-2">{{ row.batchCode }}</span>
            </li>
            <li>
              <span class="text-gray-500">Provider UUID:</span>
              <span class="ml-2 break-all">{{ row.providerUuid || "-" }}</span>
            </li>
            <li>
              <span class="text-gray-500">Insured UUID:</span>
              <span class="ml-2 break-all">{{ row.insuredUuid || "-" }}</span>
            </li>
          </ul>
        </div>

        <!-- Timing -->
        <div class="bg-gray-50 rounded-lg p-4 col-span-2">
          <h4 class="font-medium mb-2">Timing</h4>
          <div class="grid grid-cols-2 gap-3 text-sm text-gray-700">
            <div>
              <span class="text-gray-500">Created At:</span>
              <span class="ml-2">{{ formatTs(row.createdAt) }}</span>
            </div>
            <div>
              <span class="text-gray-500">Updated At:</span>
              <span class="ml-2">{{ formatTs(row.updatedAt) }}</span>
            </div>
            <div>
              <span class="text-gray-500">First Failed At:</span>
              <span class="ml-2">{{ formatTs(row.firstFailedAt) }}</span>
            </div>
            <div>
              <span class="text-gray-500">Last Attempt At:</span>
              <span class="ml-2">{{ formatTs(row.lastAttemptAt) }}</span>
            </div>
            <div>
              <span class="text-gray-500">Next Retry At:</span>
              <span class="ml-2">{{ formatTs(row.nextRetryAt) }}</span>
            </div>
            <div>
              <span class="text-gray-500">Succeeded At:</span>
              <span class="ml-2">{{ formatTs(row.succeededAt) }}</span>
            </div>
          </div>
        </div>

        <!-- External API -->
        <div class="bg-gray-50 rounded-lg p-4 col-span-2">
          <h4 class="font-medium mb-2">External API</h4>
          <p class="text-sm text-blue-700 break-all underline">
            <a
              :href="row.externalApiUrl"
              target="_blank"
              rel="noopener noreferrer"
              >{{ row.externalApiUrl || "-" }}</a
            >
          </p>
        </div>

        <!-- Error Message -->
        <div class="bg-gray-50 rounded-lg p-4 col-span-2">
          <h4 class="font-medium mb-2">Error Message</h4>
          <pre
            class="text-sm whitespace-pre-wrap break-words text-red-700 bg-red-50 p-3 rounded"
            >{{ row.errorMessage || "-" }}</pre
          >
        </div>

        <!-- Last Response -->
        <div v-if="row.lastResponse" class="bg-gray-50 rounded-lg p-4 col-span-2">
          <h4 class="font-medium mb-2">Last Response</h4>
          <pre class="text-sm whitespace-pre-wrap break-words">{{
            typeof row.lastResponse === "string"
              ? row.lastResponse
              : JSON.stringify(row.lastResponse, null, 2)
          }}</pre>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end mt-6">
        <Button type="primary" class="!text-white" @click="closeModal">
          Done
        </Button>
      </div>
    </div>
  </ModalParent>
</template>
