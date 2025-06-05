<script setup>
import { usePagination } from "@/composables/usePagination";
import { useAuthStore } from "@/stores/auth";
import { watch } from "vue";
import { fetchRequestedForPayment } from "../api/batchDetailApi";

const props = defineProps({
  search: String,
  tempClaimNumber: String,
  payerUuid: String,
});
const authStore = useAuthStore();
const pagination = usePagination({
  cb: (data) =>
    fetchRequestedForPayment({
      tempClaimNumber: props.tempClaimNumber,
      providerUuid: authStore.auth?.user?.providerUuid,
      payerUuid: props.payerUuid,
      ...data,
    }),
});

pagination.send();

watch(
  () => props.search,
  () => {
    pagination.send();
  }
);
</script>

<template>
  <slot
    :claims="pagination.data.value"
    :pending="pagination.pending.value"
    :error="pagination.error.value"
  />
</template>
