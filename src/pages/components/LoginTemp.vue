<script setup>
import { ref } from "vue";
import AuthLogin from "./AuthLogin.vue";
import Confirmation from "./Confirmation.vue";
import ForgetPassword from "./ForgetPassword.vue";
import NewPasswordConfirm from "./NewPasswordConfirm.vue";
import Congratulation from "./Congratulation.vue";

const activeForm = ref(0);

const form = [
  {
    name: "authLogin",
    component: AuthLogin,
  },
  {
    name: "forgotPassword",
    component: ForgetPassword,
  },

  {
    name: "confirmation",
    component: Confirmation,
  },

  {
    name: "newPasswordConfirm",
    component: NewPasswordConfirm,
  },
  {
    name: "congratulation",
    component: Congratulation,
  },
];
const values = ref(new Array(form.length));
const confirmationCode = ref("");
const next = (value) => {
  console.log(activeForm.value);

  if (activeForm.value == 2) {
    confirmationCode.value = value;
  }

  if (activeForm.value + 1 != form.length) activeForm.value++;
  else {
    activeForm.value = 0;
  }
};
function prevous() {
  if (activeForm.value > 0) activeForm.value = 0;
}
</script>
<template>
  <div
    class="flex flex-col rounded-2xl max-h-[32rem] scrollbar-hide overflow-auto bg-white p-9"
  >
    <div
      class="flex gap-2 items-center justify-center mb-6 border-b border-base-clr3 pb-6"
    >
      <img src="../../assets/logo.svg" alt="HealthConnect Logo" />
      <h1 class="text-xl font-semibold text-primary">HealthConnect</h1>
    </div>

    <component
      v-bind="{ [form[activeForm].name]: values[activeForm] }"
      @user="next"
      @previous="prevous"
      :values="values"
      :activeForm="activeForm"
      :is="form[activeForm].component"
      :confirmationCode="confirmationCode"
    >
    </component>
  </div>
</template>
