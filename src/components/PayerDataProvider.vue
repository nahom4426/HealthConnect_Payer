<script setup>
import { usePagination } from "@/composables/usePagination";
import { getAllPayers } from "@/features/customer Services/api/payerApi";
import { useAuthStore } from "@/stores/auth";
import { usePayer } from "@/stores/payerStore";
import { watch } from "vue";

const props = defineProps({
  search: String,
});
const authStore = useAuthStore();
const payerStore = usePayer();
const pagination = usePagination({
  store: payerStore,
  cb: () => getAllPayers(authStore.auth?.user?.providerUuid),
});

if (!payerStore.payers.length) {
  pagination.send();
}

watch(
  () => props.search,
  () => {
    pagination.send();
  }
);
</script>

<template>
  <slot
    :payers="payerStore.payers"
    :pending="pagination.pending.value"
    :error="pagination.error.value"
  />
</template>
