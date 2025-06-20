<script setup>
import { usePagination } from "@/composables/usePagination";
import { watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useDrugStore } from "../store/drugStore";
import { getAllDrugs } from "../api/drugApi";
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

const drugStore = useDrugStore();

const pagination = usePagination({
  store: drugStore,
  cb: (data) =>
    getAllDrugs(
      authStore.auth?.user?.providerUuid,
      removeUndefined({ searchKey: props.search, ...data })
    ),
});

if (drugStore.drugs.length == 0) {
  pagination.send();
}

watch(pagination.data, console.log, { immediate: true });
</script>
<template>
  <slot
    :pending="pagination.pending.value"
    :error="pagination.error.value"
    :drugs="drugStore.drugs"
  />
</template>
