<script setup>
import icons from "@/utils/icons";
import InputParent from "../new_form_builder/InputParent.vue";
//import Icon from "../Icon.vue";
import InputLayout from "./NewInputLayout.vue";

const props = defineProps({
  obj: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Array,
    required: true,
  },
});
</script>
<template>
  <InputParent v-slot="{ setRef, error, value, attributes, changeValue }">
    <InputLayout
      :class="$attrs.class + ' relative'"
      :error="error"
      :label="$attrs.label"
    >
      <div class="flex items-center h-full flex-1">
        <slot name="left"></slot>
        <select
          :style="{
            opacity: attributes?.placeholder && !value ? 0.6 : 1,
          }"
          :ref="setRef"
          class="appearance-none flex-1 text-text-clr h-full text-sm"
        >
          <option selected value="" disabled>
            {{ attributes?.placeholder }}
          </option>
          <template v-if="!obj">
            <option
              class="text-sm px-4"
              :selected="value == option"
              :key="option"
              v-for="option in options"
            >
              {{ option }}
            </option>
          </template>
          <template v-else>
            <option
              :selected="value == option.value"
              :value="option.value"
              :key="option.value"
              v-for="option in options"
            >
              {{ option.label }}
            </option>
          </template>
        </select>
        <div class="absolute pointer-events-none top-0 right-0 h-full">
          <slot name="right">
            <div class="h-full ml-auto w-8  flex items-center justify-center">
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M0.234314 0.834314C0.546734 0.521895 1.05327 0.521895 1.36569 0.834314L4 3.46863L6.63431 0.834314C6.94673 0.521895 7.45327 0.521895 7.76569 0.834314C8.0781 1.14673 8.0781 1.65327 7.76569 1.96568L4.56569 5.16568C4.25327 5.4781 3.74673 5.4781 3.43431 5.16568L0.234314 1.96569C-0.078105 1.65327 -0.0781051 1.14673 0.234314 0.834314Z" fill="#75778B"/>
</svg>

            </div>
          </slot>
        </div>
      </div>
    </InputLayout>
  </InputParent>
</template>
