<script setup>
import InputParent from "../new_form_builder/InputParent.vue";
import NewInputLayout from "./NewInputLayout.vue";

const props = defineProps({
  focus: {
    type: Boolean,
    default: false
  },
  label: String,
  attributes: [String, Object]
})
</script>
<template>
  <InputParent :attributes="attributes" v-slot="{ setRef, error, value, changeValue }">
    <NewInputLayout :error="error"  :label="label">
      <div class="flex w-full ">
        <slot class="" name="left" />
        <input
          v-focus="focus"
          :ref="setRef"
          v-bind="$attrs"
          :value="value"
          @input="changeValue($event.target.value)"
        />
      </div>
    </NewInputLayout>
  </InputParent>
</template>
