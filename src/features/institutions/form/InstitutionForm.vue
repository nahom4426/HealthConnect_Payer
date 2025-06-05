<script setup lang="ts">
import Form from '@/components/new_form_builder/Form.vue';
import Input from '@/components/new_form_elements/Input.vue';
import Select from '@/components/new_form_elements/Select.vue';
import { ref } from 'vue';

// Create refs for form values
const institutionName = ref('');
const tinNumber = ref('');
const email = ref('');
const telephone = ref('');
const category = ref('General');
const country = ref('Ethiopia');
const state = ref('');
const address3 = ref('');
const address2 = ref('');
const address1 = ref('');
</script>
<template>
	<Form :inner="false" id="institution-form" class="grid gap-4 grid-cols-3">
		<Input
			v-model="institutionName"
			label="Institution Name"
			name="institutionName"
			validation="required|max-25"
			:attributes="{
				placeholder: 'Institution Name'
			}"
		/>
		<Input
			v-model="tinNumber"
			label="Tin Number"
			name="tinNumber"
			validation="required|num|max-25"
			:attributes="{
				placeholder: 'Tin Number'
			}"
		/>
		<Input
			v-model="email"
			label="Email"
			name="email"
			validation="required|email"
			:attributes="{
				placeholder: 'Email'
			}"
		/>
		<Input
			v-model="telephone"
			label="Phone"
			name="telephone"
			validation="required|phone"
			:attributes="{
				placeholder: 'Mobile Phone'
			}"
		/>
		<Input
			v-model="category"
			label="Category"
			name="category"
			validation="required"
			:attributes="{
				placeholder: 'Category'
			}"
		/>
		<p class="font-semibold col-span-3 text-base">Address</p>
		<div class="col-span-3 grid grid-cols-5 gap-4">
			<Input
				v-model="country"
				label="Country"
				name="country"
				validation="required|max-25"
				:attributes="{
					placeholder: 'Country',
					disabled: true
				}"
				:value="'Ethiopia'"
			/>
			<Input
				v-model="state"
				label="Region"
				name="state"
				validation="required|max-25"
				:attributes="{
					placeholder: 'Region',
				}"
			/>
			<Input
				v-model="address3"
				label="City"
				name="address3"
				validation="required|max-25"
				:attributes="{
					placeholder: 'CIty',
				}"
			/>
			<Input
				v-model="address2"
				label="Sub City"
				name="address2"
				validation="required|max-25"
				:attributes="{
					placeholder: 'Sub City',
				}"
			/>
			<Input
				v-model="address1"
				label="Woreda"
				name="address1"
				validation="required|max-25"
				:attributes="{
					placeholder: 'Woreda',
				}"
			/>
		</div>
	</Form>
</template>
