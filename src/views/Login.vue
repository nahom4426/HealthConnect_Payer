<script setup>
import Button from "@/components/Button.vue";
import Form from "@/components/new_form_builder/Form.vue";
import Input from "@/components/new_form_elements/Input.vue";
import InputPassword from "@/components/new_form_elements/InputPassword.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { login } from "@/features/auth/authApi";
import { useAuthStore } from "@/stores/auth";
import { toasted } from "@/utils/utils";
import { useRouter } from "vue-router";

const req = useApiRequest();
const auth = useAuthStore();
const router = useRouter();

function loginUser({ values }) {
  req.send(
    () => login(values),
    (res) => {
      if (res.success) {
        auth.setAuth(res.data);
        router.replace("/");
      }
      toasted(res.success, "Loggedin Successfully", res.error);
    }
  );
}
</script>
<template>
  <div class="size-full grid grid-cols-3">
    <div
      class="grid place-content-center relative col-span-2 bg-gradient-to-br from-blue-900 to-blue-600"
    >
      <img class="absolute bottom-0 z-0" src="/src/assets/img/bg-arts.svg" />
      <h1 class="text-5xl font-bold text-white">
        HealthConnect <span class="font-light">™</span>
      </h1>
      <h1 class="text-3xl text-white">Insurance</h1>
    </div>
    <div class="grid place-items-center">
      <Form
        v-slot="{ submit }"
        id="login-form"
        class="w-[75%] flex flex-col gap-5"
      >
        <p class="text-3xl uppercase">Welcome to Insurance login</p>
        <Input
          :focus="true"
          validation="required|email"
          label="Email"
          name="email"
          :attributes="{
            placeholder: 'Email',
          }"
        />
        <InputPassword
          validation="required"
          label="Password"
          name="password"
          :attributes="{
            placeholder: 'Password',
          }"
        />
        <Button
          :pending="req.pending.value"
          @click.prevent="submit(loginUser)"
          type="primary"
        >
          Login
        </Button>
      </Form>
    </div>
  </div>
</template>
