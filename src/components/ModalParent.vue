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
const isClosing = ref(false);

watch(
  modals,
  (modals) => {
    modal.value = getModal(name);
    // Reset closing state when modal becomes active
    if (modal.value?.active) {
      isClosing.value = false;
    }
  },
  { immediate: true }
);

function escListener(e) {
  if (e.key === "Escape" && modals?.length && props.autoClose) {
    handleClose();
  }
}

function handleClose() {
  if (isClosing.value) return;
  
  isClosing.value = true;
  // Wait for the animation to complete before actually closing
  setTimeout(() => {
    closeModal();
    isClosing.value = false;
  }, 300); // Match this duration with your CSS animation duration
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
    @click.self="autoClose && handleClose()"
    :class="[
      !modal?.active ? '__inactive' : '__active',
      isClosing ? '__closing' : ''
    ]"
    class="modal-parent p-4 grid place-items-center min-h-full bg-[#292A36]/60"
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
  /* Add transition for the background */
  transition: background-color 0.3s ease;
}

.modal-parent.__closing {
  background-color: transparent;
}

.modal-content {
  animation: slideDown 0.3s ease-out forwards;
}

.__active .modal-content {
  animation: slideDown 0.3s ease-out forwards;
}

.__closing .modal-content {
  animation: slideUp 0.3s ease-in forwards;
}

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-20px);
    opacity: 0;
  }
}
</style>