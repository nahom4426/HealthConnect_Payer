<script setup>
import Button from "@/components/Button.vue";
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import DetailForm from "./DetailForm.vue";
import { closeModal } from "@customizer/modal-x";
import DependentForm from "./DependentForm.vue";
const props = defineProps({
  data: {
    type: Object,
  },
});
</script>
<template>
  <ModalParent
    class="flex inset-0 backdrop-blur-sm justify-center items-center bg-black/20"
    title="dependent"
    >{{ console.log(props.data) }}

    <NewFormParent class="" title="Dependant">
      <DependentForm :data="props.data" />
    </NewFormParent>
  </ModalParent>
</template>
