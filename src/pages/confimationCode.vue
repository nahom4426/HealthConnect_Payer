<template>
  <div class="flex justify-between">
    <input
      v-for="(digit, index) in 6"
      :key="index"
      type="text"
      :ref="el => inputRefs[index] = el"
      v-model="code[index]"
      @input="onInput(index)"
      @keydown="onKeyDown(index, $event)"
      class="w-14 h-20 text-center text-xl border rounded-md bg-[#F9F9FD] focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
      maxlength="1"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps(['modelValue']);
const emit = defineEmits(['update:modelValue']);

const code = ref(Array(6).fill(''));
const inputRefs = ref([]);

watch(code, (newCode) => {
  emit('update:modelValue', newCode.join(''));
}, { deep: true });

const onInput = (index) => {
  if (code.value[index].length === 1 && index < 5) {
    inputRefs.value[index + 1].focus();
  }
};

const onKeyDown = (index, event) => {
  if (event.key === 'Backspace' && !code.value[index] && index > 0) {
    inputRefs.value[index - 1].focus();
  }
};
</script>