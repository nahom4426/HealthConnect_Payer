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
    required: true,
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
    class="overflow-hidden flex flex-col justify-between bg-white m-6 p-6 rounded-md"
  >
    <div
      class="flex justify-between  border-text-secondary-clr/30 items-center"
    >
      <div class="flex justify-between mx-4 pb-4  bg-[#F6F7FA] w-full px-4 items-center gap-4">
        <div>
          <button
            @click="onGoBack"
            v-if="goBack"
            class="grid place-items-center rounded-md border border-text-clr"
          ></button>
          <p class="font-bold text-lg px-4 p-3">{{ title }}</p>
          <p class="font-normal text-[#75778B] text-sm px-4 ">{{ subtitle }}</p>
        </div>
        <div
          @click="closeModal()"
          class="flex items-center text-center  mt-4 cursor-pointer justify-center   p-2"
        >
          <i v-html="icons.closes"></i>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <slot name="right-actions"></slot>
        <button class=" rounded-full" @click="closeModal()"></button>
      </div>
    </div>
    <div
      class="flex flex-col gap-4 form-scrollbar flex-1 overflow-auto p-2  "
    >
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

.lg {
  width: 60rem;
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
