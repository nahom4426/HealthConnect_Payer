<script setup lang="ts">
import Button from "@/components/Button.vue";
import ModalParent from "@/components/ModalParent.vue";
import { closeModal } from "@customizer/modal-x";
import { useAwashFailedStore } from "../store/awashFailedStore";
import { toasted } from "@/utils/utils";
import { useApiRequest } from "@/composables/useApiRequest";

// modal-x passes payload under a single 'data' prop
const props = defineProps<{ data: { type: "service" | "claim"; logUuid: string | number } }>();
const store = useAwashFailedStore();
console.log(props.data);
const req = useApiRequest();
function onConfirm() {
  req.send(
    () => {
      if (props.data.type === "service") {
        return store.retryService(props.data.logUuid);
      } else {
        return store.retryClaim(props.data.logUuid);
      }
    },
    (res) => {
      if (res.success) {
        // toasted(res.success, "Retry successful", res.error);
        console.log("aaa",res);
        
        closeModal();
      } 
    }
  );
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
        <Button class="border" @click="closeModal">Cancel</Button>
        <Button type="primary" class="!text-white" @click="onConfirm">Retry</Button>
      </div>
    </div>
  </ModalParent>
</template>
