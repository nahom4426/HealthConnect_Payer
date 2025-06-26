<script setup>
import { usePagination } from "@/composables/usePagination";
import { watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { removeUndefined } from "@/utils/utils";
import { useSubmittedClaimStore } from "@/features/claim/store/submittedClaimStore";
import { getSubmittedClaims } from "@/features/claim/api/submittedClaimApi";

const props = defineProps({
  auto: {
    type: Boolean,
    default: true,
  },

  search: {
    type: String,
    default: "",
  },
  id: {
    type: String,
  },
});

const submittedClaimStore = useSubmittedClaimStore();

const pagination = usePagination({
  store: submittedClaimStore,
  auto: false,
  cb: (data) =>
    getSubmittedClaims(
      props.id,
      removeUndefined({ searchKey: props.search, ...data })
    ),
});
watch(
  () => props.search,
  () => {
    pagination.send();
  }
);

if (submittedClaimStore.submittedClaims.length == 0) {
  pagination.send();
}
</script>
<template>
  <slot
    :pending="pagination.pending.value"
    :error="pagination.error.value"
    :submittedClaims="submittedClaimStore.submittedClaims"
  />
</template>
