<script setup>
import Button from "@/components/Button.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { getColumnValue, toasted } from "@/utils/utils";
import { ref } from "vue";
import { createClaim, createDependantClaim } from "../api/claimApi";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { openModal } from "@customizer/modal-x";
const props = defineProps({
  rowData: {
    type: Array,
    required: true,
  },
  headKeys: {
    type: Array,
  },
  cells: {},
  rowKeys: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["row"]);
console.log(props?.rowData);
const selected = ref("");
function add(id) {
  if (selected.value == id) {
    selected.value = "";
  } else {
    selected.value = id;
  }
}
const router = useRouter();
const api = useApiRequest();
const authStore = useAuthStore();

function create(row) {
  let data;
  if (row?.dependantUuid) {
    data = {
      insuredPersonUuid: row?.insuredPersonUuid,
      providerUuid: authStore.auth?.user?.providerUuid,
      userUuid: authStore.auth?.user?.userUuid,
      dependantUuid: row?.dependantUuid,
    };
    api.send(
      () => createDependantClaim(data),
      (res) => {
        if (res.success) {
          router.push(`claim/${res.data}`);
        }
      }
    );
  } else {
    data = {
      insuredPersonUuid: row?.insuredPersonUuid,
      providerUuid: authStore.auth?.user?.providerUuid,
      userUuid: authStore.auth?.user?.userUuid,
      payerUuid: row?.payerUuid,
    };
    api.send(
      () => createClaim(data),
      (res) => {
        if (res.success) {
          router.push(`claim/${res.data}`);
        }
      }
    );
  }
}
</script>

<template>
  <template :key="idx" v-for="(row, idx) in rowData">
    <tr @click.self="emit('row', row)" class="bg-white border-b-[0.2px]">
      <td class="p-3">{{ idx + 1 }}</td>
      <td class="p-3" :key="key" v-for="key in rowKeys">
        <span>
          {{ getColumnValue(key, row) }}
        </span>
      </td>
      <td
        class="p-3 flex gap-3"
        v-if="headKeys.find((head) => head.toLowerCase() == 'actions')"
      >
        <div class="flex gap-4 items-center">
          <Button
            class="text-primary font-bold rounded-md border border-primary"
            @click="create(row)"
            >Proceed to Services</Button
          >
          <Button
            @click="openModal('Detail', row)"
            class="bg-secondary text-white"
            >Details</Button
          >
        </div>
      </td>
    </tr>
    <tr
      v-for="(dependent, index) in row.dependants"
      :key="dependent.dependentUuid"
      @click.self="emit('row', row)"
      class="bg-white border-b-[0.2px]"
    >
      <td class="p-3">{{ idx + 1 }}.{{ index + 1 }}</td>
      <td class="p-3">
        {{ dependent?.dependantFirstName }} {{ dependent?.dependantFatherName }}
      </td>
      <td class="p-3">
        {{ row?.insuranceId }}
      </td>
      <td class="p-3">
        {{ dependent?.relationship }}
      </td>
      <td class="p-3">
        {{ row?.institutionName }}
      </td>
      <td class="p-3">
        {{ row?.payerName }}
      </td>
      <td class="p-3">{{ dependent?.dependantStatus }}</td>
      <td
        class="p-3 flex gap-3"
        v-if="headKeys.find((head) => head.toLowerCase() == 'actions')"
      >
        <div class="flex gap-4 items-center">
          <Button
            class="text-primary font-bold rounded-md border border-primary"
            @click="create({ ...dependent, payerUuid: row.payerUuid })"
            >Proceed to Services</Button
          >
          <Button
            @click="openModal('dependent', dependent)"
            class="bg-secondary text-white"
            >Details</Button
          >
        </div>
      </td>
    </tr>
  </template>
</template>
