<script setup>
import Button from "@/components/Button.vue";
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import DetailForm from "./DetailForm.vue";
import { closeModal } from "@customizer/modal-x";
const props = defineProps({
  data: {
    type: Object,
  },
});
</script>
<template>
  <ModalParent class="flex inset-0 backdrop-blur-sm bg-black/20" title="Detail">
    <div @click="closeModal()" class="w-[18rem]"></div>

    <NewFormParent class="" size="xl" title="Detail">
      <DetailForm :data="props.data" />
    </NewFormParent>
  </ModalParent>
</template>
