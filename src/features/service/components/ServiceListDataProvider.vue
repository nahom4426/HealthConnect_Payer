<script setup>
import { usePagination } from "@/composables/usePagination";
import { watch } from "vue";
import { useServiceListStore } from "../store/serviceListStore";
import { getAllServices } from "../api/serviceApi.js";
import { useAuthStore } from "@/stores/auth";
import { removeUndefined } from "@/utils/utils";

const props = defineProps({
  auto: {
    type: Boolean,
    default: true,
  },
  prePage: {
    type: Number,
    default: 25,
  },
  search: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: "",
  },
});
watch(
  () => props.search,
  () => {
    if (props.id || authStore.auth?.user?.providerUuid) pagination.send();
  }
);
watch(
  () => props.id,
  () => {
    pagination.send();
  }
);
const authStore = useAuthStore();

const serviceListStore = useServiceListStore();

const pagination = usePagination({
  store: serviceListStore,
  auto: props.auto,
  cb: (data) =>
    getAllServices(
      props.id || authStore.auth?.user?.providerUuid,
      removeUndefined({ searchKey: props.search, ...data })
    ),
});

if (
  serviceListStore.serviceList.length == 0 &&
  authStore.auth?.user?.providerUuid
) {
  pagination.send();
}

watch(pagination.data, console.log, { immediate: true });
</script>
<template>
  <slot
    :pending="pagination.pending.value"
    :error="pagination.error.value"
    :serviceList="serviceListStore.serviceList"
  />
</template>
