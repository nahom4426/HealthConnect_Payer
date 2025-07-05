<script setup>
import FormSubmitButton from "@/components/FormSubmitButton.vue";
import InputPassword from "@/components/new_form_elements/InputPassword.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { useAuthStore } from "@/stores/auth";
import { changePassword } from "../api/profileApi";
import { toasted } from "@/utils/utils";
import Form from "@/components/new_form_builder/Form.vue";

const api = useApiRequest();
const authStore = useAuthStore();
function handleChangePassword({ values }) {
console.log('gggg');

  api.send(
    () => changePassword(authStore.auth?.user?.userUuid, values),
    (res) => {
      if (res.success) {
      }
      toasted(res.success, "Password Changed Successfully", res.error);
    }
  );
}
</script>

<template>
  <div class="w-full flex justify-center">
    <Form
    v-slot="{submit}"
      class="flex flex-col w-[33rem] rounded-md border px-5 py-8 border-base-clr/20 gap-6"
      id="SecurityForm"
    >
      <div class="flex-col flex gap-4 text-center w-full">
        <span class="font-semibold text-lg text-base-clr"
          >Change Login Password</span
        >
        <span class="text-base-clr">
          Enter your new password in the provided field. After creating a strong
          password, confirm it by entering it again. Keep your password
          confidential and avoid using easily guessable information.</span
        >
      </div>
      <InputPassword
        name="oldPassword"
        label="Password"
        validation="required"
        :attributes="{
          placeholder: 'Enter your current password',
        }"
      />
      <InputPassword
        name="newPassword"
        label="New Password"
        validation="required"
        :attributes="{
          placeholder: 'Enter new password',
        }"
      />
      <InputPassword
        name="confirmPassword"
        label="Confirm Password"
        validation="required|equalTo-newPassword"
        :attributes="{
          placeholder: 'Reenter your new password',
        }"
      />
      <FormSubmitButton
        class="w-[31rem] h-14"
        @click.prevent="submit(handleChangePassword)"
        btn-text="Create Password"
      />

    </Form>
  </div>
</template>
