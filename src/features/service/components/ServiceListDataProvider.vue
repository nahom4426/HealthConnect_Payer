<script setup>
import { usePagination } from "@/composables/usePagination";
import { watch } from "vue";
import { useServiceListStore } from "../store/serviceListStore";
import { getAllServices } from "../api/serviceApi.js";
import { useAuthStore } from "@/stores/auth";
import { removeUndefined } from "@/utils/utils";

const props = defineProps({
  prePage: {
    type: Number,
    default: 25,
  },
  search: {
    type: String,
    default: "",
  },
});
watch(
  () => props.search,
  () => {
    pagination.send();
  }
);
const authStore = useAuthStore();

const serviceListStore = useServiceListStore();

const pagination = usePagination({
  store: serviceListStore,
  cb: (data) =>
    getAllServices(
      authStore.auth?.user?.providerUuid,
      removeUndefined({ searchKey: props.search, ...data })
    ),
});

if (serviceListStore.serviceList.length == 0) {
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
