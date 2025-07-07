<script setup>
import NewFormLayout from "@/components/NewFormLayout.vue";
import InputEmail from "@/components/new_form_elements/InputEmail.vue";
import InputPassword from "@/components/new_form_elements/InputPassword.vue";
import FormSubmitButton from "@/components/FormSubmitButton.vue";
import Input from "@/components/new_form_elements/Input.vue";
import { useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useApiRequest } from "@/composables/useApiRequest";
import { login } from "../api/LoginApi";
import { toasted } from "@/utils/utils";
import { openModal } from "@customizer/modal-x";

const router = useRouter();
const route = useRoute();
const redirecting = ref(true);
const auth = useAuthStore();
let detiail = localStorage.getItem("userDetail");
function reRoute() {
  if (route.query.redirect && route.query?.from == "other")
    location.href = route.query.redirect;
  else if (route.query.redirect) router.replace(route.query.redirect);
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
          imageData:res.data?.imageData,
          accessToken: res.data?.token,
        });
        if(!auth.auth?.user?.firstTimeLogin){
          openModal('ChangePassword')
        }
        localStorage.setItem("userDetail", JSON.stringify(res.data));
        reRoute();
      }
      toasted(res.success, "Successfully Logged In", res.error);
    }
  );
}
const emit = defineEmits(["user"]);
</script>
<template>
  <NewFormLayout v-slot="{ submit }" id="login-form">
    <div class="space-y-6">
      <div class="flex flex-col items-center justify-center gap-4">
        <h1 class="font-semibold text-xl">Nice to see you again 👋</h1>
        <h2 class="w-[332px] text-center">
          Upon successful authentication, access your role-specific dashboard
          within the platform.
        </h2>
      </div>
      <Input
        label="Email"
        name="email"
        validation="required|email"
        :attributes="{ placeholder: 'Enter your email' }"
      />

      <InputPassword
        label="Password"
        name="password"
        validation="required"
        :attributes="{ placeholder: 'Enter your password' }"
      />
      <div class="text-right text-sm">
        <a href="#" @click.prevent="emit('user')" class="hover:underline">
          Forgot password?
        </a>
      </div>
      <div class="">
        <div class="flex justify-center">
          <FormSubmitButton
            @click.prevent="submit(handleLogin)"
            btn-text="Login"
          />
        </div>
      </div>
    </div>
  </NewFormLayout>
</template>
