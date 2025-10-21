<script setup lang="ts">
import Button from "@/components/Button.vue";
import ModalParent from "@/components/ModalParent.vue";
import { closeModal } from "@customizer/modal-x";
import { useAwashFailedStore } from "../store/awashFailedStore";
import { toasted } from "@/utils/utils";
import { useApiRequest } from "@/composables/useApiRequest";
import { ref } from "vue";

// modal-x passes payload under a single 'data' prop
const props = defineProps<{ data: { type: "service" | "claim"; logUuid: string | number } }>();
const store = useAwashFailedStore();
console.log(props.data);
const req = useApiRequest();
const isLoading = ref(false);

async function onConfirm() {
  isLoading.value = true;
  
  try {
    await req.send(
      () => {
        if (props.data.type === "service") {
          return store.retryService(props.data.logUuid);
        } else {
          return store.retryClaim(props.data.logUuid);
        }
      },
      (res) => {
        if (res.success) {
          console.log("aaa", res);
          toasted(res.success, "Manual retry initiated successfully.", res.error);
          closeModal();
        }
      }
    );
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <ModalParent>
    <div class="p-6 bg-white rounded-lg w-[420px]">
      <h3 class="text-lg font-semibold mb-2">Confirm Retry</h3>
      <p class="text-gray-600 mb-6">
        Are you sure you want to retry this failed {{ props.data.type }} integration?
      </p>
      <div class="flex justify-end gap-3">
        <Button class="border" @click="closeModal" :disabled="isLoading">Cancel</Button>
        <Button 
          type="primary" 
          class="!text-white" 
          @click="onConfirm"
          :pending="isLoading"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Retrying...' : 'Retry' }}
        </Button>
      </div>
    </div>
  </ModalParent>
</template>