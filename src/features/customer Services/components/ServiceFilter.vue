<script setup>
import Button from "@/components/Button.vue";
import Form from "@/components/new_form_builder/Form.vue";
import Input from "@/components/new_form_elements/Input.vue";
import InputFile from "@/components/new_form_elements/InputFile.vue";
import Select from "@/components/new_form_elements/Select.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import icons from "@/utils/icons";
import { formatCurrency } from "@/utils/utils";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
const props = defineProps({
  addService: {
    type: Function,
  },
  addedServices: {
    type: Array,
  },

  coverage: {
    type: Array,
  },
  services: {
    type: Array,
  },
});
const route = useRoute();
const eligibleServiceUuid = ref("");
const amount = ref("");
const qty = ref("");
const todayDate = new Date();
const formattedDate = todayDate.toISOString().split("T")[0];
const date = ref(formattedDate);
const totalValue = computed(() => {
  return props.addedServices.reduce((ac, sm) => {
    return ac + (sm.totalPrice || 0);
  }, 0);
});

watch(eligibleServiceUuid, () => {
  let ser = props.services.find(
    (el) => el?.eligibleServiceUuid == eligibleServiceUuid.value
  );
  amount.value = ser?.unitPrice;
});

const isNavigatedFromClaimBatchDetails = ref(false);

const router = useRouter();

onMounted(() => {
  const previousRoute = router.options.history.state.back;
  if (previousRoute && previousRoute.includes("/claim-batch-details/")) {
    isNavigatedFromClaimBatchDetails.value = true;
  }
});
console.log(isNavigatedFromClaimBatchDetails.value);
const totalPrice = computed(() => {
  return amount.value * qty.value;
});
</script>
<template>
  <NewFormParent
    class="!p-0 bg-gray-100 flex flex-col"
    size="xl"
    title="Services"
  >
    <Form class="grid grid-cols-12 gap-4" id="Serives" v-slot="{ submit }">
      <div class="col-span-2">
        <Input
          name="providedDate"
          validation="required"
          :value="date || ''"
          label="Service Date"
          :attributes="{
            type: 'date',
            disabled: true,
          }"
        />
      </div>
      <Select
        class="h-8 col-span-2"
        :obj="true"
        name="packageUuid"
        label="Service Category"
        :options="
          props.coverage.map((el) => ({
            label: `${el?.packageName}`,
            value: `${el?.packageUuid}`,
          }))
        "
        :attributes="{
          placeholder: 'Service Category',
        }"
      />
      <Input
        name="itemCode"
        validation="required"
        label="Item Code"
        :attributes="{
          placeholder: 'Item Code',
        }"
      />
      <Select
        class="h-8 col-span-2"
        :obj="true"
        v-model="eligibleServiceUuid"
        name="eligibleServiceUuid"
        label="Item Description"
        :options="
          props.services.map((el) => ({
            label: `${el?.item}`,
            value: `${el?.eligibleServiceUuid}`,
          }))
        "
        :attributes="{
          placeholder: 'Item Description',
        }"
      />
      <div class="">
        <Input
          name="qty"
          v-model="qty"
          validation="required"
          label="Quantity"
          :attributes="{
            placeholder: 'Quantity',
          }"
        />
      </div>
      <div class="">
        <Input
          name="unitPrice"
          validation="required"
          :value="amount || ''"
          label="Unit Price"
          :attributes="{
            disabled: true,
            placeholder: 'Unit Price',
          }"
        />
      </div>
      <Input
        name="totalPrice"
        validation="required"
        :value="totalPrice || ''"
        label="Total price"
        :attributes="{
          placeholder: 'Total price',
          disabled: true,
        }"
        v-model="total"
      />
      <InputFile
        name="attachment"
        :attributes="{
          type: 'file',
          placeholder: 'Attachment',
        }"
        label="Attachment"
      />
      <div
        v-if="!isNavigatedFromClaimBatchDetails"
        class="flex h-full items-end"
      >
        <Button
          @click.prevent="submit(props.addService)"
          class="flex gap-2 bg-primary h-8 justify-end w-8 text-white"
        >
          <i v-html="icons.plus" /> Add
        </Button>
      </div>
    </Form>
    <div class="flex justify-end pt-4">
      <div class="flex gap-2">
        <p class="font-bold">Total</p>
        <p>{{ formatCurrency(totalValue) }}</p>
      </div>
    </div>
  </NewFormParent>
</template>
