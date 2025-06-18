<script setup>
import Button from "@/components/Button.vue";
import { useForm } from "@/components/new_form_builder/useForm";
import NewFormParent from "@/components/NewFormParent.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { toasted } from "@/utils/utils";
import { useRoute } from "vue-router";
import ServiceForm from "../components/form/ServiceForm.vue";
import { useService } from "../store/serviceStore";
import { getServiceByid, updateService } from "../api/serviceApi.ts";

import { ref } from "vue";
const props = defineProps({
  data: String,
});

const { submit } = useForm("serviceForm");
const serviceStore = useService();

const service = ref(
  serviceStore.services.find((el) => el.serviceUuid == props.data) || {}
);
const req = useApiRequest();

if (!Object.keys(service.value).length) {
  req.send(
    () => getServiceByid(props.data),
    (res) => {
      if (res.success) {
        service.value = res.data;
      }
    }
  );
}

function update({ values }) {
  values.status = "ACTIVE";
  req.send(
    () => updateService(props.data, values),
    (res) => {
      toasted(res.success, "Successfully Updated", res.error);
      if (res.success) {
        serviceStore.update(props.data, { ...service, ...values });
      }
    }
  );
}
</script>
<template>
  <div class="bg-black/50 min-h-full p-4 grid place-items-center">
    <NewFormParent
      size="md"
      class="flex justify-center bg-white"
      title="Update Service"
    >
      <ServiceForm :services="service" />

      <template #bottom>
        <div class="flex justify- w-full p-2 px-4">
          <Button
            class="flex w-full items-center gap-3 bg-primary"
            :pending="req.pending.value"
            type="primary"
            @click.prevent="submit(update)"
            >Update Service</Button
          >
        </div>
      </template>
    </NewFormParent>
  </div>
</template>
