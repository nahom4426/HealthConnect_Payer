<script setup lang="ts">
import { useApiRequest } from "@/composables/useApiRequest";
import { usePayerContracts } from "../store/payerContractStore";
import { getPayerContracts } from "../api/payerContractApi";
import { usePagination } from "@/composables/usePagination";
import type { PropType } from "vue";
import { Status } from "@/types/interface";

const props = defineProps({
	auto: {
		type: Boolean,
		default: true
	},
	status: {
		type: String as PropType<Status>,
		default: Status.ACTIVE
	}
})
const payerContractStore = usePayerContracts();

const providerReq = useApiRequest()

const pagination = usePagination({
	auto: false,
	cb: (data: any) => getPayerContracts({
		...data,
		status: props.status
	})
})

if(!payerContractStore.payerContract.length) {
	if(props.auto) {
		pagination.send()
	}
}
</script>
<template>
  <slot
    :payerContract="payerContractStore.payerContract"
    :pending="providerReq.pending.value"
    :error="providerReq.error.value"
		:search="pagination.search"
  />
</template>
