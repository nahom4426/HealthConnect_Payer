<script setup>
import Button from "@/components/Button.vue";
import icons from "@/utils/icons";
import { useAddedServices } from "../store/addServicesStore";
const addedServiceStore = useAddedServices();
const props = defineProps({
  headers: {
    type: [Array, Object],
    required: true,
  },
  rows: {
    type: Array,
    default: [],
  },
  addedServices: {
    type: Object,
    required: true,
  },
  removeService: {
    type: Function,
  },
});
</script>
<template>
  <table class="max-w-[70%] border-separate border-spacing-0">
    {{
      console.log(addedServiceStore.addedServices)
    }}
    <thead class="sticky top-0 rounded-t-lg">
      <tr class="px-3 divide-gray-200 bg-gray-200">
        <th
          scope="col"
          class="py-2 pl-4 pr-4 px-6 text-left text-xs font-normal text-gray-900 sm:pl-0"
        >
          <span class="ml-3"> # </span>
        </th>
        <th
          scope="col"
          class="py-2 pl-4 pr-4 px-6 text-left text-xs font-normal text-gray-900 sm:pl-0"
        >
          <span class="ml-3"> Service Date </span>
        </th>
        <th
          scope="col"
          class="px-4 py-2 text-left text-xs font-normal text-gray-900"
        >
          Service Category
        </th>
        <th
          scope="col"
          class="px-3 py-2 text-left text-xs font-normal text-gray-900"
        >
          Item Code
        </th>
        <th
          scope="col"
          class="px-3 py-2 text-left text-xs font-normal text-gray-900"
        >
          Item Description
        </th>
        <th
          scope="col"
          class="px-2 py-2 text-left text-xs font-normal text-gray-900"
        >
          Quantity
        </th>
        <th
          scope="col"
          class="px-4 py-2 text-left text-xs font-normal text-gray-900"
        >
          Unit Price
        </th>
        <th
          scope="col"
          class="px-4 py-2 text-left text-xs font-normal text-gray-900"
        >
          Total Price
        </th>
        <th
          scope="col"
          class="px-4 py-2 text-left text-xs font-normal text-gray-900"
        >
          Attachments
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200 bg-section-bg">
      <tr
        v-for="(person, idx) in addedServiceStore.addedServices"
        :key="idx.serviceProvidedUuid"
      >
        <td
          :class="[
            'whitespace-nowrap py-2 pl-1 pr-1 text-sm font-base text sm:pl-2 lg:pl-3',
          ]"
        >
          {{ idx + 1 }}
        </td>
        <td
          :class="[
            'whitespace-nowrap py-2 pl-1 pr-1 text-sm font-base text sm:pl-2 lg:pl-3',
          ]"
        >
          {{ person.providedDate }}
        </td>
        <td
          :class="[
            'whitespace-nowrap py-2 hidden px-3 text-sm text sm:table-cell',
          ]"
        >
          {{ person?.packageName }}
        </td>
        <td
          :class="[
            'whitespace-nowrap py-2 hidden px-3 text-sm text sm:table-cell',
          ]"
        >
          {{ person.itemCode }}
        </td>
        <td :class="['whitespace-nowrap py-2 px-3 text-sm text']">
          {{ person.item }}
        </td>
        <td :class="['whitespace-nowrap py-2 pl-4 text-sm text']">
          {{ person.qty }}
        </td>
        <td :class="['whitespace-nowrap py-2 px-3 text-sm text']">
          {{ person.unitPrice }}
        </td>
        <td :class="['whitespace-nowrap py-2 px-3 text-sm text']">
          {{ person.unitPrice * person.qty }}
        </td>
        <td :class="['whitespace-nowrap py-2 px-3 flex gap-2 text-sm text']">
          <button
            class="flex p-2 rounded justify-start gap-2 items-center bg-red-500 cursor-pointer"
            @click="removeService(person.packageUuid)"
          >
            <i v-html="icons.delete" />
          </button>
          <button
            class="flex rounded text-white bg-primary p-2 justify-start gap-2 items-center cursor-pointer"
            @click="removeService(person.packageUuid)"
          >
            View
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
