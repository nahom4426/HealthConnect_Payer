<script setup>
import { ref } from "vue";
import Button from "@/components/Button.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import ModalParent from "@/components/ModalParent.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { toasted } from "@/utils/utils";
import { closeModal } from "@customizer/modal-x";
import { approveContract } from "../api/contractRequestApi";
import { useRoute } from "vue-router";
import Textarea from "@/components/new_form_elements/Textarea.vue";

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
const acceptContract = async () => {
  if (!termsAccepted.value) {
    toasted(false, "Please accept the terms and conditions");
    return;
  }

  accepting.value = true;
  
  try {
    await req.send(
      () => approveContract(contractHeaderUuid, remark.value),
      () => {
        if (req.success) {
          toasted(true, "Contract approved successfully");
          closeModal();
        } else {
          toasted(false, req.response.value?.message || "Failed to approve contract");
        }
      }
    );
  } finally {
    accepting.value = false;
  }
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
                Lorem ipsum dolor sit amet consectetur. Enim eget aliquam aliquet nisi cursus leo non orci. 
                Sodales aliquam dui et eget pulvinar. Sed praesent arcu felis sed purus in nulla cras turpis. 
                Diam aliquam et sit nisi lectus vestibulum cursus non.
              </p>
              
              <ul class="list-disc pl-5 space-y-2 mb-4">
                <li>Massa fames volutpat facilisis pellentesque nunc eu ut cras.</li>
                <li>Vitae diam ultrices quam non porta vitae metus felis dignissim.</li>
                <li>Eu pharetra massa consequat sed enim condimentum egestas.</li>
                <li>Eu ut ligula vestibulum nibh aliquet eu.</li>
              </ul>

              <p>
                Nec lobortis viverra pretium arcu sed. Congue porta augue id massa eget tempus ipsum etiam. 
                In quam massa dapibus auctor in in id. Faudibus nibh nunc sit vitae venenatis egestas lobortis. 
                Quam tincidunt tellus quis sed.
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
            placeholder:
              'Write your remarks here...',
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
              @click.prevent="acceptContract"
              :disabled="accepting || !termsAccepted"
              class="flex items-center bg-primary text-white font-medium  hover:bg-[#014F4F] disabled:opacity-50"
              size="md"
            >
              <span v-if="accepting">Processing...</span>
              <span v-else>Confirm Acceptance</span>
            </Button>
          </div>
        </template>
      </NewFormParent>
    </ModalParent>
  </div>
</template>