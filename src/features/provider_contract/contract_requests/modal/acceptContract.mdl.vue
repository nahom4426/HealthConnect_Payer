<script setup>
import { ref } from "vue";
import Button from "@/components/Button.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import ModalParent from "@/components/ModalParent.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { toasted } from "@/utils/utils";
import { closeModal } from "@customizer/modal-x";
import { approveContract } from "../api/contractRequestApi";
import { useRoute, useRouter } from "vue-router";
import Textarea from "@/components/new_form_elements/Textarea.vue";
import ModalFormSubmitButton from "@/components/new_form_builder/ModalFormSubmitButton.vue";

const router = useRouter();
const props = defineProps({
  contractId: {
    type: String,
    required: true
  }
});

const req = useApiRequest();
const remark = ref("");
const termsAccepted = ref(false);
const accepting = ref(false);
const route = useRoute();
const contractHeaderUuid = route.params.id;

// const acceptContract = async () => {
//   if (!termsAccepted.value) {
//     toasted(false, "", "Please accept the terms and conditions");
//     return;
//   }

//   accepting.value = true;
  
//   try {
//     const result = await req.send(() => 
//       approveContract(contractHeaderUuid, remark.value)
//     );

//     if (result?.success) {
//       toasted(res.success, "Contract approved successfully",res.error);
      
//       try {
//         // First try to close the modal
//         await closeModal();
//       } catch (modalError) {
//         console.error("Error closing modal:", modalError);
//         // Even if modal fails to close, proceed with navigation
//       }
      
//       // Navigate after modal close attempt
//       router.push("/provider_contracts");
//     } else {
//       // toasted(false, "", result?.message || "Failed to approve contract");
//     }
//   } catch (error) {
//     console.error("Acceptance error:", error);
//     toasted(false, "", error.message || "An error occurred during acceptance.");
//   } finally {
//     accepting.value = false;
//   }
// };
const acceptContract = async () => {
  if (!termsAccepted.value) {
    toasted(false, "", "Please accept the terms and conditions");
    return;
  }

  accepting.value = true;
  
  await req.send(
    () =>  approveContract(contractHeaderUuid, remark.value),
    (res) => {
      if (res.success) {
          toasted(res.success, "Contract approved successfully",res.error);
        closeModal();
        router.push("/contract_requests");
      } else {
        // toasted(false,"", res.error || "Failed to reject contract");
      }
       accepting.value
    },
    (error) => {
      console.error("Rejection error:", error);
      toasted(false,"", "An error occurred during rejection.");
       accepting.value
    }
  );
};

const handleButtonClick = (e) => {
  e.stopPropagation();
};
</script>

<template>
  <div class="bg-black/50 min-h-full p-6 grid place-items-center">
    <ModalParent>
      <NewFormParent
        size="lg"
        class="flex justify-center bg-white rounded-lg shadow-xl"
        title="Accept Contract"
        subtitle="Are you sure you want to accept this contract?"
      >
        <div class="p-6 w-full">
          <div class="mb-6">
            <p class="text-sm text-gray-600">
              By accepting this contract, you agree to all terms and conditions.
            </p>
          </div>

       <div class="mb-6">
    <h3 class="font-medium text-gray-700 mb-2">Terms and Conditions</h3>
    <div class="bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto text-sm text-gray-600">
      <p class="mb-4">
        This agreement outlines the terms under which services are provided by Medco. By agreeing to these terms, you acknowledge understanding and acceptance of all conditions stated herein.
      </p>
      
      <ul class="list-disc pl-5 space-y-2 mb-4">
        <li>Services will be provided as per the agreed schedule.</li>
        <li>Payment is due within 30 days of receipt of the invoice.</li>
        <li>Confidentiality of all client information is maintained.</li>
        <li>Any disputes will be resolved through mediation.</li>
      </ul>

      <p>
        Medco reserves the right to modify these terms with prior notice. Clients will be informed of any significant changes or updates to the terms and conditions.
      </p>
    </div>
  </div>

          <div class="flex items-start mb-6">
            <input
              id="accept-terms"
              v-model="termsAccepted"
              type="checkbox"
              class="mt-1 h-4 w-4 text-Primary rounded border-gray-300 focus:ring-Primary"
            />
            <label for="accept-terms" class="ml-2 block text-sm text-gray-700">
              We agree to the terms and policies
            </label>
          </div>

          <div class="mb-4">
            <Textarea
              id="remark"
              v-model="remark"
              label="Remark (Optional)"
              rows="4"
              :attributes="{
                placeholder: 'Write your remarks here...',
              }"
            />
          </div>
        </div>

        <template #bottom>
          <div class="flex gap-3 justify-between items-center w-full p-4 border-t">
            <Button
              @click.prevent="handleButtonClick"
              @click="closeModal"
              class="flex items-center border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              size="md"
            >
              Cancel
            </Button>
          
            <ModalFormSubmitButton
              @click.prevent="handleButtonClick"
              @click="acceptContract"
              :pending="accepting"
              :disabled="!termsAccepted"
              btnText="Confirm Acceptance"
              size="md"
              class="flex items-center bg-primary text-white font-medium hover:bg-[#014F4F] disabled:opacity-50"
            />
          </div>
        </template>
      </NewFormParent>
    </ModalParent>
  </div>
</template>