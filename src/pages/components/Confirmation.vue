<script setup>
import NewFormLayout from "@/components/NewFormLayout.vue";
import FormSubmitButton from "@/components/FormSubmitButton.vue";
import { ref, onMounted } from "vue";
import { toasted } from "@/utils/utils";

const emit = defineEmits(["user", "previous"]);
const digits = ref(Array(6).fill(""));
const inputRefs = ref([]);

onMounted(() => {
  inputRefs.value[0]?.focus();
});

function handleInput(e, index) {
  const value = e.target.value.replace(/\D/g, "").slice(0, 1);
  digits.value[index] = value;

  // Move to next input if digit entered
  if (value && index < 5) {
    inputRefs.value[index + 1]?.focus();
  }
}

function handlePaste(e, index) {
  const pasteData = e.clipboardData.getData("text").replace(/\D/g, "");
  if (pasteData) {
    // Fill all inputs with pasted data
    pasteData
      .split("")
      .slice(0, 6)
      .forEach((char, i) => {
        if (i < 6) {
          digits.value[i] = char;
        }
      });

    const lastFilledIndex = Math.min(pasteData.length - 1, 5);
    inputRefs.value[lastFilledIndex]?.focus();
    e.preventDefault();
  }
}

function handleKeyDown(e, index) {
  if (e.key === "Backspace" && !digits.value[index] && index > 0) {
    inputRefs.value[index - 1]?.focus();
  }
}

function handleConfirmCode() {
  const code = digits.value.join("");
  if (code.length !== 6) {
    toasted(false, "", "Please enter all 6 digits");
    return;
  }
  emit("user", code);
}
</script>

<template>
  <NewFormLayout v-slot="{ submit }" id="confirmation-code-form">
    <div class="space-y-5 px-4">
      <div class="flex flex-col items-center justify-center gap-4">
        <h1 class="font-semibold text-xl">Confirm your email.</h1>
        <h2 class="w-[360px] text-center">
          Please confirm your email using the 6-digit code we sent to
          ekelle@gmail.com.
        </h2>
      </div>
      <label class="block text-sm font-medium text-base-clr">
        Confirmation <span class="text-red-500">*</span>
      </label>
      <div class="flex justify-center gap-4 px-8">
        <input
          v-for="(digit, index) in digits"
          :key="index"
          v-model="digits[index]"
          :ref="(el) => (inputRefs[index] = el)"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="1"
          class="w-12 h-[60px] text-center text-xl bg-base-clr3 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
          @input="handleInput($event, index)"
          @paste="handlePaste($event, index)"
          @keydown="handleKeyDown($event, index)"
        />
      </div>

      <div class="pt-4 border-t border-gray-200">
        <div class="flex justify-center">
          <FormSubmitButton
            class="text-white bg-primary font-medium py-2 px-10 rounded-md w-full"
            @click.prevent="submit(handleConfirmCode)"
            btn-text="Verify Code"
          />
        </div>
      </div>
      <div class="flex flex-col gap-4 items-center">
        <h1 class="text-base-clr text-xs">©HealthConnect 2025</h1>
      </div>
    </div>
  </NewFormLayout>
</template>

<!-- <script setup>
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
</template> -->
