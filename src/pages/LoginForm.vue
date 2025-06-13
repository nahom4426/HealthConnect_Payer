<script setup>
import FormSubmitButton from "@/components/FormSubmitButton.vue";
import Input from "@/components/new_form_elements/Input.vue";
import InputPassword from "@/components/new_form_elements/InputPassword.vue";
import NewFormLayout from "@/components/NewFormLayout.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { useAuthStore } from "@/stores/auth";
import { useRoute, useRouter } from "vue-router";
import { toasted } from "@/utils/utils";
import { login, forgotPassword, resetPassword } from "./api/LoginApi";
import { ref } from "vue";
import InputEmail from "@/components/new_form_elements/InputEmail.vue";
import ConfirmationCodeInput from "./confimationCode.vue";

const confirmationCode = ref('');
const showForgotPassword = ref(false);
const confirmationCodeSent = ref(false);
const showNewPasswordForm = ref(false);
const showSuccessForm = ref(false);
const userEmail = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');

const forgotReq = useApiRequest();
const resetReq = useApiRequest();

function toggleForgotPassword() {
  showForgotPassword.value = !showForgotPassword.value;
  confirmationCodeSent.value = false;
  showNewPasswordForm.value = false;
  showSuccessForm.value = false;
}

// Step 1: Send confirmation code
function handleForgotPassword({ values }) {
  if (forgotReq.pending.value) return;
  userEmail.value = values.email;
  forgotReq.send(
    () => forgotPassword({ email: values.email }),
    (res) => {
      toasted(res.success, "Confirmation code sent", res.error);
      if (res.success) {
        confirmationCodeSent.value = true;
      }
    }
  );
}

// Step 2: Submit code and go to password form
function handleConfirmCode() {
  console.log("Confirmation code:", confirmationCode.value);
  if (!confirmationCode.value || confirmationCode.value.length < 6) {
    return toasted(false, "Please enter the confirmation code.");
  }
  confirmationCodeSent.value = false;
  showNewPasswordForm.value = true;
}

// Step 3: Submit new password
function handleNewPassword({ values }) {
  if (resetReq.pending.value) return;

  resetReq.send(
    () =>
      resetPassword({
        passwordResetCode: confirmationCode.value,
        newPassword: values.newPassword,
        confirmPassword: values.confirmNewPassword,
      }),
    (res) => {
      if (res.success) {
        showForgotPassword.value = false;
        showNewPasswordForm.value = false;
        confirmationCodeSent.value = false;
        showSuccessForm.value = true;
      } else {
        toasted(false, res.error || "Failed to reset password. Please try again.");
      }
    }
  );
}

// Login
const router = useRouter();
const route = useRoute();
const redirecting = ref(true);
const auth = useAuthStore();
let detiail = localStorage.getItem("userDetail");

function reRoute() {
  if (route.query.redirect && route.query?.from == "other")
    location.href = route.query.redirect;
  else if (route.query.redirect)
    router.replace(route.query.redirect);
  else router.replace("/");
}

if (detiail) {
  detiail = JSON.parse(detiail);
  auth.setAuth({
    user: detiail,
    accessToken: detiail.token,
  });
  reRoute();
} else {
  redirecting.value = false;
}

const loginReq = useApiRequest();
function handleLogin({ values }) {
  if (loginReq.pending.value) return;
  loginReq.send(
    () => login(values),
    (res) => {
      if (res.success) {
        auth.setAuth({
          user: res.data,
          accessToken: res.data?.token,
        });
        localStorage.setItem("userDetail", JSON.stringify(res.data));
        reRoute();
      }
      toasted(res.success, "Successfully Loggedin", res.error);
    }
  );
}
</script>

<template>
 <div class="w-full max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-10 md:p-12 lg:p-16 overflow-y-auto">
     <!-- Logo -->
    <div class="flex items-center justify-center mb-8 border-b border-gray-300 pb-8">
      <img src="../assets/logo.svg" alt="HealthConnect Logo" class="h-10 mr-2" />
      <h1 class="text-2xl md:text-3xl font-bold text-[#02676B]">HealthConnect</h1>
    </div>
    

    <!-- Header text -->
    <div class="text-center text-[#373946] m-8 px-6 gap-4">
      <h2 class="text-lg md:text-xl mb-2 pb-4 font-semibold">
        <template v-if="showSuccessForm">
          Congratulations!
        </template>
        <template v-else-if="showNewPasswordForm">
          Reset your password
        </template>
        <template v-else-if="showForgotPassword && confirmationCodeSent">
          Confirm your email.
        </template>
        <template v-else-if="showForgotPassword">
          You forgot your password?
        </template>
        <template v-else>
          Nice to see you again 👋
        </template>
      </h2>
      <p class="text-sm ">
        <template v-if="showSuccessForm">
          You have successfully reset your password. Now, log in to the system using your new password.
        </template>
        <template v-else-if="showNewPasswordForm">
          Enter and confirm your new password.
        </template>
        <template v-else-if="showForgotPassword && confirmationCodeSent">
          Please confirm your email using the 6-digit code we sent to {{ userEmail }}.
        </template>
        <template v-else-if="showForgotPassword">
          Please enter your email address to receive a confirmation code.
        </template>
        <template v-else>
          Upon successful authentication, access your role-specific dashboard within the platform.
        </template>
      </p>
    </div>

    <!-- Success Form -->
    <NewFormLayout v-if="showSuccessForm" v-slot="{ submit }" id="success-form">
      <div class="space-y-5 px-4">
        <div class="pt-4 border-t border-gray-200">
          <div class="flex justify-center">
            <FormSubmitButton
              class="bg-[#008080] w-full h-10 hover:bg-[#006666] text-white font-medium py-2 px-10 rounded-md w-full"
              @click.prevent="toggleForgotPassword"
              btn-text="Login"
            />
          </div>
        </div>
      </div>
    </NewFormLayout>

    <!-- New Password Form -->
    <NewFormLayout v-else-if="showNewPasswordForm" v-slot="{ submit }" id="new-password-form">
      <div class="space-y-5 px-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <InputPassword
            name="newPassword"
            validation="required|min:8"
            :attributes="{ placeholder: 'Enter new password' }"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <InputPassword
            name="confirmNewPassword"
            validation="required|confirmed:@newPassword"
            :attributes="{ placeholder: 'Reenter your new password' }"
          />
        </div>
        <div class="pt-4 border-t border-gray-200">
          <div class="flex justify-center">
            <FormSubmitButton
              class="bg-[#008080] hover:bg-[#006666] text-white font-medium py-2 px-10 rounded-md w-full"
              @click.prevent="submit(handleNewPassword)"
              btn-text="Create Password"
            />
          </div>
        </div>
      </div>
    </NewFormLayout>

    <!-- Confirmation Code Form -->
    <NewFormLayout v-else-if="showForgotPassword && confirmationCodeSent" v-slot="{ submit }" id="confirmation-code-form">
      <div class="space-y-5 px-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirmation Code</label>
          <ConfirmationCodeInput
            v-model="confirmationCode"
            name="confirmationCode"
          />
        </div>
        <div class="pt-4 border-t border-gray-200">
          <div class="flex justify-center">
            <FormSubmitButton
              class="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-medium py-2 px-10 rounded-md w-full"
              @click.prevent="submit(handleConfirmCode)"
              btn-text="Verify Code"
            />
          </div>
        </div>
      </div>
    </NewFormLayout>

    <!-- Forgot Password Form -->
    <NewFormLayout v-else-if="showForgotPassword" v-slot="{ submit }" id="forgot-password-form">
      <div class="space-y-5 px-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <InputEmail
            name="email"
            validation="required|email"
            :attributes="{ placeholder: 'Enter your email' }"
          />
        </div>
        <div class="pt-4 border-t border-gray-200">
          <div class="flex justify-center">
            <FormSubmitButton
              class="bg-[#02676B] hover:bg-[#0d5254] text-white font-medium py-2 px-10 rounded-md w-full"
              @click.prevent="submit(handleForgotPassword)"
              btn-text="Get Confirmation Code"
            />
          </div>
        </div>
      </div>
    </NewFormLayout>

    <!-- Login Form -->
    <NewFormLayout v-else v-slot="{ submit }" id="login-form">
      <div class="space-y-5   my-6 gap-6">
        <div class="pb-3">
          <label class="block text-sm font-medium pb-2 text-gray-700 mb-1">Email</label>
          <InputEmail
            name="email"
            validation="required|email"
            :attributes="{ placeholder: 'Enter your email' }"
          />
        </div>
        <div class="pb-3">
          <label class="block text-sm pb-2 font-medium text-gray-700 mb-1">Password</label>
          <InputPassword
            name="password"
            validation="required"
            :attributes="{ placeholder: 'Enter your password' }"
          />
        </div>
        <div class="mt-6 text-right text-sm text-gray-600 ">
          <a href="#" @click.prevent="toggleForgotPassword" class="text-[#64748B] hover:underline">
            Forgot password?
          </a>
        </div>
        <div class="py-8 border-b border-[#DFDEF2]">
          <div class="flex justify-center">
            <FormSubmitButton
              class="bg-[#02676B] hover:bg-[#0d5254] text-white font-medium py-2 px-10 rounded-md"
              @click.prevent="submit(handleLogin)"
              btn-text="Login"
            />
          </div>
        </div>
      </div>
    </NewFormLayout>

    <!-- Footer Link -->
    <div v-if="showForgotPassword || showNewPasswordForm" class="mt-6 text-center text-sm text-gray-600">
      <a href="#" @click.prevent="toggleForgotPassword" class="text-blue-600 hover:underline">
        Remember your password? Login now
      </a>
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center text-xs text-gray-400">
      ©HealthConnect 2025
    </div>
  </div>
</template>


<style scoped>
/* Improve scroll behavior on small screens */
@media (max-width: 768px) {
  .overflow-y-auto {
    max-height: 100vh;
  }
}
</style>
