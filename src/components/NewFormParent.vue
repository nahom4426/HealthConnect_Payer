<script setup>
import { closeModal } from "@customizer/modal-x";
import Button from "./Button.vue";
import ResponseError from "./ResponseError.vue";
import icons from "@/utils/icons";
const props = defineProps({
  size: {
    type: String,
    default: "md",
  },
  title: {
    required: true,
    type: String,
  },
  subtitle: {
    type: String,
  },
  goBack: {
    type: Boolean,
    default: false,
  },
  onGoBack: {
    type: Function,
  },
  error: {
    type: String,
  },
});
</script>
<template>
  <div
    :class="[$style[size]]"
    class="overflow-hidden flex flex-col justify-between bg-white p-6 gap-11 rounded-2xl"
  >
    <div class="flex justify-between border-text-secondary-clr/30 items-center">
      <div
        class="flex justify-between p-4 bg-[#F6F7FA] rounded-lg w-full items-center gap-4"
      >
        <div>
          <button
            @click="onGoBack"
            v-if="goBack"
            class="grid place-items-center rounded-lg border border-text-clr"
          ></button>
          <p class="font-bold text-lg">{{ title }}</p>
          <p class="font-normal text-[#75778B] text-sm">{{ subtitle }}</p>
        </div>
        <div
          @click="closeModal()"
          class="flex items-center text-center cursor-pointer justify-center"
        >
          <i v-html="icons.closes"></i>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <slot name="right-actions"></slot>
        <button class="rounded-full" @click="closeModal()"></button>
      </div>
    </div>
    <div class="flex flex-col gap-4 form-scrollbar flex-1 overflow-auto">
      <slot />
      <ResponseError :error="error" />
    </div>
    <slot name="bottom" />
  </div>
</template>

<style module>
.md {
  width: 40rem;
  height: 100%;
}
.mdd {
  width: 45rem;
  height: auto;
}

.lg {
  width: 65rem;
  height: 100%;
}
.xlg {
  width: 95rem;
  height: 100%;
}
.xl {
  width: 100%;
  height: 100%;
}

.xs {
  width: auto;
  height: auto;
}
</style>

<style>
.form-layout {
  display: grid;
}
.form-scrollbar::-webkit-scrollbar {
  display: block;
  width: 5px;
}

.form-scrollbar::-webkit-scrollbar-thumb {
  background-color: #d1c9c9;
  /* border-radius: 50px; */
}
</style>
