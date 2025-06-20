<script setup>
import NewFormLayout from "@/components/NewFormLayout.vue";
import FormSubmitButton from "@/components/FormSubmitButton.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { resetPassword } from "../api/LoginApi";
import { toasted } from "@/utils/utils";
import InputPassword from "@/components/new_form_elements/InputPassword.vue";
const resetReq = useApiRequest();
const emit = defineEmits(["user", "previous"]);
const props = defineProps({
  confirmationCode: String,
});

function handleNewPassword({ values }) {
  if (resetReq.pending.value) return;
  values.passwordResetCode = props.confirmationCode;
  console.log(props.confirmationCode);

  resetReq.send(
    () => resetPassword(values),
    (res) => {
      if (res.success) {
        emit("user");
      } else {
        toasted(
          false,
          res.error || "Failed to reset password. Please try again."
        );
      }
    }
  );
}
</script>
<template>
  <NewFormLayout v-slot="{ submit }" id="forgot-password-form">
    <div class="flex flex-col items-center justify-center gap-4">
      <h1 class="font-semibold text-xl">Provide your new password</h1>
      <h2 class="w-[360px] text-center">
        Enter your new password in the provided field. After creating a strong
        password, confirm it by entering it again. Keep your password
        confidential and avoid using easily guessable information.
      </h2>
    </div>
    <!-- <div @click="emit('previous')">Back</div> -->
    <div class="space-y-5 px-4">
      <InputPassword
        name="newPassword"
        label="New Password"
        validation="required"
        :attributes="{
          placeholder: 'New Password',
        }"
      />
      <InputPassword
        name="confirmPassword"
        label="Confirm Password"
        validation="required|equalTo-newPassword"
        :attributes="{
          placeholder: 'Confirm Password',
        }"
      />
      <div class="pt-4 border-t border-gray-200">
        <div class="flex justify-center">
          <FormSubmitButton
            class="hover:bg-primary/80 text-white font-medium py-2 px-10 rounded-xl w-full"
            @click.prevent="submit(handleNewPassword)"
            btn-text="Create Password"
          />
        </div>
      </div>
      <div class="flex flex-col gap-4 items-center">
        <h1 class="flex gap-2">
          Remember your password?
          <p
            class="text-base-clr cursor-pointer"
            @click.prevent="emit('previous')"
          >
            Login now
          </p>
        </h1>
        <h1 class="text-base-clr text-xs">©HealthConnect 2025</h1>
      </div>
    </div>
  </NewFormLayout>
</template>
