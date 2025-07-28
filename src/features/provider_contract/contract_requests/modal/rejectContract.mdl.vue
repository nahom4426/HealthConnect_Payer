<script setup>
import { ref } from "vue";
import Button from "@/components/Button.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import ModalParent from "@/components/ModalParent.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { toasted } from "@/utils/utils";
import { closeModal } from "@customizer/modal-x";
import { rejectContract } from "../api/contractRequestApi";
import Textarea from "@/components/new_form_elements/Textarea.vue";
import { useRoute, useRouter } from "vue-router";
const router = useRouter(); // Added router import
const props = defineProps({
  contractId: {
    type: String,
    required: true
  }
});

const req = useApiRequest();
const rejectionReason = ref("");
const remark = ref("");
const rejecting = ref(false);
const route = useRoute();
const rejectionReasons = [
  { value: "PRICING_ISSUE", label: "Pricing Issue" },
  { value: "TERMS_UNACCEPTABLE", label: "Unacceptable Terms" },
  { value: "SERVICE_EXCLUSION", label: "Service Exclusion" },
  { value: "OTHER", label: "Other Reason" }
];

const rejectContractRequest = async () => {
  if (!rejectionReason.value) {
    toasted(false, "Please select a reason for rejection");
    return;
  }

  rejecting.value = true;

  try {
    const result = await req.send(() =>
      rejectContract(props.contractId || route.params.id, rejectionReason.value, remark.value)
    );

    if (result) {
      toasted(true, "Contract rejected successfully");
      closeModal();
      router.push("/provider/contracts");
    } else {
    }
  } catch (error) {
    toasted(false, "An error occurred during rejection.");
  } finally {
    rejecting.value = false;
  }
};

</script>

<template>
  <div class="bg-black/50 min-h-full p-6 grid place-items-center">
    <ModalParent>
      <NewFormParent
        size="md"
        class="flex justify-center bg-white rounded-lg shadow-xl"
        title="Reject Contract"
        subtitle="Are you considering rejecting this agreement?"
      >
        <div class="p-6 w-full">

          <div class="mb-4 gap-4 ">
            <label for="rejection-reason" class="block text-sm  mb-4 font-medium text-gray-700">
              Reason for rejection *
            </label>
            <select
              id="rejection-reason"
              v-model="rejectionReason"
              class="w-full focus-within:border focus-within:border-primary bg-[#F9F9FD] p-2 overflow-hidden text-base rounded-md min-h-9 flex"
            >
              <option value="" disabled selected>Select reason for rejecting contract</option>
              <option v-for="reason in rejectionReasons" :key="reason.value" :value="reason.value">
                {{ reason.label }}
              </option>
            </select>
          </div>

          <div class="my-4">
             <Textarea
           id="rejection-message"
              v-model="remark"
              label="  Message for payer"
             
          :attributes="{
            placeholder:
              'Please provide a detailed explanation for the rejection, and feel free to include specific pricing details...',
          }"
        />
           
          </div>
        </div>

        <template #bottom>
          <div class="flex gap-3 justify-between items-center w-full p-4 border-t">
            <Button
              @click.prevent="closeModal"
              class="flex items-center border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              size="md"
            >
              Cancel
            </Button>
           <Button
  @click.prevent="rejectContractRequest"
  :disabled="rejecting || !rejectionReason"
  class="flex items-center bg-[#DB2E48] text-white font-medium hover:bg-red-700 disabled:opacity-50"
  size="md"
>
  <svg
    v-if="rejecting"
    class="animate-spin h-4 w-4 mr-2 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
    <path
      class="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v8H4z"
    />
  </svg>
  <span v-if="!rejecting">Confirm Rejection</span>
  <span v-else>Processing...</span>
</Button>

          </div>
        </template>
      </NewFormParent>
    </ModalParent>
  </div>
</template>