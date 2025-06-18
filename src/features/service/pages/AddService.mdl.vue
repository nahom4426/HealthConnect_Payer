<script setup>
import Button from "@/components/Button.vue";
import { useForm } from "@/components/new_form_builder/useForm";
import NewFormParent from "@/components/NewFormParent.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import icons from "@/utils/icons";
import ServiceForm from "../components/form/ServiceForm.vue";
import { createService } from "../api/serviceApi.ts";
import { useService } from "../store/serviceStore";
import { useAuthStore } from "@/stores/auth";
import { toasted } from "@/utils/utils";
import { closeModal } from "@customizer/modal-x";

const { submit } = useForm("serviceForm");
const req = useApiRequest();
const serviceStore = useService();
const authStore = useAuthStore();
function create({ values, reset }) {
  values.status = "ACTIVE";
  req.send(
    () =>
      createService(
        { providerUuid: authStore.auth?.user?.providerUuid },
        values
      ),
    (res) => {
      if (res.success) {
        serviceStore.add(res.data);
        reset();
        closeModal();
      }
      toasted(res.success, "Serivice Created Successfully", res.error);
    }
  );
}
</script>
<template>
  <div class="bg-black/50 min-h-full p-4 grid place-items-center">
    <NewFormParent
      size="md"
      class="flex justify-center bg-white"
      title="Add Service"
    >
      <ServiceForm />

      <template #bottom>
        <div class="flex items-center w-full">
          <Button
            :pending="req.pending.value"
            @click.prevent="submit(create)"
            type="primary"
            class="gap-2 m-2 w-full flex items-center text-white"
            btn-text="Add Service"
          >
            <i class="pb-1" v-html="icons.plus" />
            Add Service
          </Button>
        </div>
      </template>
    </NewFormParent>
  </div>
</template>
