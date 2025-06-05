<script setup>
import { usePagination } from "@/composables/usePagination";
import { getClaimById } from "../api/claimApi";

const pagination = usePagination({
  cb: getClaimById,
});
pagination.send();
</script>
<template>
  <slot
    :pending="pagination.pending.value"
    :error="pagination.error.value"
    :privileges="pagination.data"
  />
</template>
