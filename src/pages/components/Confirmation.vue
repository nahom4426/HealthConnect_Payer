<script setup>
import NewFormLayout from "@/components/NewFormLayout.vue";
import FormSubmitButton from "@/components/FormSubmitButton.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import Input from "@/components/new_form_elements/Input.vue";
import { ref } from "vue";
import { toasted } from "@/utils/utils";
const resetReq = useApiRequest();
const confirmationCode = ref("");
const emit = defineEmits("user", "prevous");
function handleConfirmCode() {
  if (!confirmationCode.value || confirmationCode.value.length < 6) {
    return toasted(false, "", "Please enter the correct confirmation code.");
  } else {
    emit("user", confirmationCode.value);
  }
}
</script>
<template>
  <NewFormLayout v-slot="{ submit }" id="confirmation-code-form">
    <div @click="emit('previous')">Back</div>
    <div class="space-y-5 px-4">
      <Input
        v-model="confirmationCode"
        label="Confirmation Code"
        validation="required"
        :attributes="{ placeholder: 'Enter Your Confirmation Code' }"
        name="confirmationCode"
      />
      <div class="pt-4 border-t border-gray-200">
        <div class="flex justify-center">
          <FormSubmitButton
            class="text-white bg-primary font-medium py-2 px-10 rounded-md w-full"
            @click.prevent="submit(handleConfirmCode)"
            btn-text="Verify Code"
          />
        </div>
      </div>
    </div>
  </NewFormLayout>
</template>
