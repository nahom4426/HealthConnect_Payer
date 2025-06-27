<script setup>
import { usePagination } from "@/composables/usePagination";
import { useProviders } from "../store/providersStore";
import { getContaractedProviders, getProviders } from "../api/providerApi";
import { watch, computed, onMounted } from "vue";
import { removeUndefined } from "@/utils/utils";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  auto: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
  },
  search: {
    type: String,
    default: "",
  },
});
const authStore = useAuthStore();

// const store = useProviders();

const pagination = usePagination({
  //   store: store,
  cb: () =>
    getContaractedProviders(
      authStore.auth?.user?.payerUuid,
      removeUndefined({
        status: props.status,
        search: props.search.trim(),
      })
    ),
});

watch(
  () => props.search,
  () => {
    console.log("hhhh");

    pagination.send();
  }
);
</script>
<template>
  <slot
    :providers="pagination.data.value?.content"
    :pending="pagination.pending.value"
    :error="pagination.error.value"
  />
</template>
