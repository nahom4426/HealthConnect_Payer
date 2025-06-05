<script setup>
import { usePagination } from "@/composables/usePagination";
import { watch } from "vue";
import { useActiveServiceStore } from "../store/activeServicestore";
import { getActiveServices } from "../api/activeServiceApi";
import { useAuthStore } from "@/stores/auth";
import { removeUndefined } from "@/utils/utils";

const props = defineProps({
  search: String,
});
const authStore = useAuthStore();
const activeServiceStore = useActiveServiceStore();

const pagination = usePagination({
  store: activeServiceStore,
  cb: (data) =>
    getActiveServices({
      ...data,
      ...removeUndefined({
        providerUuid: authStore.auth?.user.providerUuid,
        search: props.search,
      }),
    }),
});

if (!activeServiceStore.activeService.length) {
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
    :ActiveService="activeServiceStore.activeService"
    :pending="pagination.pending.value"
    :error="pagination.error.value"
  />
</template>
