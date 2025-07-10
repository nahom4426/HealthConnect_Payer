<script setup>
import { usePagination } from "@/composables/usePagination";
import { watch } from "vue";
import { usePrivilege } from "../store/privilegeStore";
import { getAllPrivilege } from "../Api/PrivilegeApi";
import { removeUndefined } from "@/utils/utils";

const props = defineProps({
  prePage: {
    type: Number,
    default: 25,
  },
   search:String
});
const privilegesStore = usePrivilege();

const pagination = usePagination({
  auto: false,
  perPage: props.prePage,
  store: privilegesStore,
  cb: ()=> getAllPrivilege(removeUndefined({
    search:props.search
  })),
});

if (privilegesStore.privilege.length == 0) {
  pagination.send();
}
watch(()=> props.search,()=>{
  pagination.send()
})
</script>
<template>
  <slot
    :pending="pagination.pending.value"
    :error="pagination.error.value"
    :privileges="privilegesStore.privilege"
  />
</template>
