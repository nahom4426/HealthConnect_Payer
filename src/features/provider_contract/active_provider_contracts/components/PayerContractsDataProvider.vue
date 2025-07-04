<script setup lang="ts">
import { usePagination } from "@/composables/usePagination";
import { payerContracts } from "../store/payerContractStore";
import { getPayerContracts } from "../api/providerContractApi";
import { watch } from "vue";
import { removeUndefined } from "@/utils/utils";

const props = defineProps({
  auto: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
  },
  search: {
    type: String,
    default: ""
  }
});

const store = payerContracts();

const pagination = usePagination({
  store,
  cb: (data) => 
    getPayerContracts(
      removeUndefined({
        ...data,
        status: props.status,
        search: props.search.trim()
      })
    )
});

watch(
  () => props.search,
  () => {
    pagination.send();
  }
);
</script>

<template>
  <slot
    :contracts="store.payerContracts"
    :pending="pagination.pending.value"
    :error="pagination.error.value"
  />
</template>