<script setup>
import { ref } from "vue";
import AuthLogin from "./AuthLogin.vue";
import Confirmation from "./Confirmation.vue";
import ForgetPassword from "./ForgetPassword.vue";
import NewPasswordConfirm from "./NewPasswordConfirm.vue";
import Congratulation from "./Congratulation.vue";
import icons from "@/utils/icons";

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
    class="flex flex-col rounded-2xl max-h-[32rem] scrollbar-hide bg-white  p-9"
  >
    <div
      class="flex gap-2 items-center justify-center mb-6 border-b border-base-clr3 pb-6"
    >
    <span class=" text-primary" v-html="icons.logo"></span>
      <h1 class="text-3xl font-bold text-primary">HealthConnect</h1>
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
