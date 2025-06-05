<script setup>
import { closeModal } from "@customizer/modal-x";
import { useModal } from "../../node_modules/@customizer/modal-x/store/modal";
import { watch, ref, getCurrentInstance, onMounted, onUnmounted } from "vue";

const props = defineProps({
  autoClose: {
    type: Boolean,
    default: true,
  },
  name: {
    type: String,
    default: "",
  },
});

const { modals, getModal } = useModal();
const name =
  props.name ||
  (getCurrentInstance().parent?.type?.__name
    ? getCurrentInstance().parent.type.__name.split(".")[0]
    : props.name);

const modal = ref();
watch(
  modals,
  (modals) => {
    modal.value = getModal(name);
  },
  { immediate: true }
);

function escListener(e) {
  if (e.key === "Escape" && modals?.length && props.autoClose) {
    closeModal();
  }
}

onMounted(() => {
  document.addEventListener("keydown", escListener);
});

onUnmounted(() => {
  document.removeEventListener("keydown", escListener);
});
</script>

<template>
  <div
    @click.self="autoClose && closeModal()"
    :class="[!modal?.active ? '__inactive' : '__active']"
    class="modal-parent p-4 grid place-items-center min-h-full bg-primary/10"
  >
    <div class="modal-content">
      <slot v-bind="modal || {}"></slot>
    </div>
  </div>
</template>

<style scoped>
.modal-parent {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  overflow-y: auto;
}

.modal-content {
  animation: slideDown 0.3s ease-out forwards;
  transform: translateY(-100%);
  opacity: 0;
}

.__active .modal-content {
  transform: translateY(0);
  opacity: 1;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>