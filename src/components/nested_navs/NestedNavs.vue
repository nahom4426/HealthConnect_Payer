<script setup>
import Navs from './Navs.vue';

	const props = defineProps({
		navs: {
			type: Array,
			required: true
		}
	})
</script>
<template>
	<Navs :nav="nav" v-for="nav in navs" />
</template>