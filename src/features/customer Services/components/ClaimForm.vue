<script setup>
import { Input } from "@/components/new_form_elements";
import { Form } from "@/components/new_form_builder";
import { ref } from "vue";

const props = defineProps({
  attachments: {
    type: Array,
  },

  services: {
    type: Array,
    required: true,
  },

  claims: {
    type: Object,
  },
});
const data = ref();
if (!props.claims?.dependantUuid) {
  data.value = [
    {
      title: "Patient Name",
      value: `${props.claims?.title} ${props.claims?.firstName} ${props.claims?.fatherName} ${props.claims?.grandFatherName}`,
    },
    {
      title: "Membership Id",
      value: props.claims?.insuranceId,
    },
    {
      title: "Phone Number",
      value: props.claims?.providerPhone,
    },
  ];
} else {
  data.value = [
    {
      title: "Main Member",
      value: `${props.claims?.title} ${props.claims?.firstName} ${props.claims?.fatherName} ${props.claims?.grandFatherName}`,
    },
    {
      title: "Patient Name",
      value: `${props.claims?.title} ${props.claims?.dependantFirstName} ${props.claims?.dependantFatherName} ${props.claims?.dependantGrandFatherName}`,
    },
    {
      title: "Relationship",
      value: props.claims?.relationship,
    },
    {
      title: "Membership Id",
      value: props.claims?.insuranceId,
    },
    {
      title: "Date of Birth",
      value: props.claims?.dependantBirthDate,
    },
  ];
}
</script>
<template>
  <Form
    class="grid grid-cols-3 gap-10"
    :inner="false"
    id="claimForm"
    v-slot="{}"
  >
    <div class="flex-1 bg-white rounded-lg p-8 flex flex-col gap-4 col-span-2">
      <div class="font-bold">Policy Holder info</div>
      <div
        v-for="claim in data"
        :key="claim.title"
        class="flex gap-4 items-center"
      >
        <p>{{ claim.title }}</p>
        <div class="flex-1 flex px-2 rounded bg-gray-100 items-center h-8">
          {{ claim.value }}
        </div>
      </div>
    </div>
    <div class="flex-1 flex flex-col bg-white rounded-lg p-8 gap-4 col-span-1">
      <div class="font-bold">Group info</div>
      <div class="grid grid-cols-3 gap-4 items-center">
        <p class="col-span-1">Group Name</p>
        <div
          class="bg-gray-100 col-span-2 flex-1 py-1 rounded flex items-center px-4"
        >
          {{ claims?.institutionName }}
        </div>
        <p class="flex-1 col-span-1">Group Policy Number</p>
        <div
          class="bg-gray-100 col-span-2 flex-1 py-1 rounded flex items-center px-4"
        >
          {{ claims?.payerInstitutionContractCode }}
        </div>
      </div>

      <p>Effective Date</p>

      <div class="flex gap-4">
        <Input
          name="from"
          validation="required"
          label="From"
          :value="claims?.beginDate || ''"
          :attributes="{
            type: 'date',
          }"
        />
        <Input
          name="to"
          validation="required"
          label="To"
          :value="claims?.endDate || ''"
          :attributes="{
            type: 'date',
          }"
        />
      </div>
    </div>
  </Form>
</template>
