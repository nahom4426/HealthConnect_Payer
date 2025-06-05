<script setup>
import PayerDataProvider from "@/components/PayerDataProvider.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { getInstitutions } from "@/features/customer Services/api/institutionApi";
import { useAuthStore } from "@/stores/auth";
import { computed, reactive, watch } from "vue";
import { useActivePage } from "../store/activepageStore";
const api = useApiRequest();
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  submit: {
    type: Function,
  },
});
const authStore = useAuthStore();

const emit = defineEmits(["update:modelValue"]);
const localUser = reactive({ ...props.modelValue });

const submitForm = () => {
  emit("update:modelValue", localUser);
  props.submit();
};
function fetchInstitutions() {
  api.send(
    () =>
      getInstitutions({
        providerUuid: authStore.auth?.user?.providerUuid,
        payerUuid: localUser?.payerUuid,
      }),
    (res) => {
      if (res.success) {
        console.log(res);
      }
    }
  );
}
watch(localUser?.insuranceUuid, () => {
  fetchInstitutions();
  emit("update:modelValue", localUser);
});
const isFormValid = computed(() => {
  return (
    localUser.from &&
    localUser.to &&
    localUser.payerUuid &&
    localUser.institutionUuid
  );
});
const activeStore = useActivePage();
watch(isFormValid, (newVal) => {
  if (newVal) {
    submitForm();
    activeStore.setPayer(localUser?.payerUuid);
  }
});
</script>
<template>
  <PayerDataProvider v-slot="{ payers, pending }">
    <div class="grid grid-cols-5 gap-4 flex-1">
      <div class="flex flex-col gap-2">
        <label class="opacity-30" for="">From</label>
        <input
          type="date"
          v-model="localUser.from"
          class="bg-transparent border border-[#C8C8C8] bg-[#F6F6F6] h-10 rounded px-2"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label class="opacity-30" for="">To</label>
        <input
          type="date"
          v-model="localUser.to"
          class="h-10 bg-transparent border-[#C8C8C8] bg-[#F6F6F6] border rounded px-2"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label class="opacity-30" for="">Insurance Name</label>
        <select
          v-if="!pending"
          class="h-10 w-40 bg-transparent border px-2 rounded"
          v-model="localUser.payerUuid"
          @change="fetchInstitutions"
        >
          <option selected value="">Select Insurance</option>
          <option
            v-for="payer in payers"
            :key="payer.payerUuid"
            :value="payer.payerUuid"
          >
            {{ payer.payerName }}
          </option>
        </select>
      </div>
      <div v-if="localUser.payerUuid" class="flex flex-col gap-2">
        <label class="opacity-30" for="">Institution Name</label>
        <select
          class="h-10 w-40 bg-transparent border rounded px-2"
          v-model="localUser.institutionUuid"
          @change="getMembers"
        >
          <option selected value="">Select Institution</option>

          <option
            v-for="institution in api.response.value"
            :key="institution.institutionUuid"
            :value="institution.institutionUuid"
          >
            {{ institution.institutionName }}
          </option>
        </select>
      </div>
      <!-- <div v-if="localUser.institutionUuid" class="flex items-end">
        <Button
          class="h-8 bg-primary w-full text-white font-bold"
          @click="submitForm"
          >Submit</Button
        >
      </div> -->
    </div>
  </PayerDataProvider>
</template>
