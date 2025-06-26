<script setup>
import { usePagination } from "@/composables/usePagination";
import { watch } from "vue";
import { removeUndefined } from "@/utils/utils";
import { useFamily } from "../store/FamilyStore";
import { getGroup } from "../api/groupServiceApi";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },

  search: {
    type: String,
    default: "",
  },
});
const authStore = useAuthStore();
const familyStore = useFamily();

const pagination = usePagination({
  store: familyStore,
  cb: (data) =>
    getGroup(
      authStore.auth?.user?.payerUuid,

      removeUndefined({
        ...data,
        search: props.search,
      })
    ),
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
    :group="familyStore.family"
    :pending="pagination.pending.value"
    :error="pagination.error.value"
  />
</template>
