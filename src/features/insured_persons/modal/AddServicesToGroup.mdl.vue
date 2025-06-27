<script setup>
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import { closeModal } from "@customizer/modal-x";
import { ref } from "vue";
import GroupForm from "../form/GroupForm.vue";
import ServiceDataProvider from "@/features/service/components/ServiceDataProvider.vue";
import GroupService from "../components/GroupComponents/GroupService.vue";
import GroupDrug from "../components/GroupComponents/GroupDrug.vue";
import ActiveProvidersDataProvider from "@/features/providers/components/ActiveProvidersDataProvider.vue";
import Form from "@/components/new_form_builder/Form.vue";
import Input from "@/components/new_form_elements/Input.vue";
import Button from "@/components/Button.vue";
import { useSelectedServicesStore } from "../store/selectedServicesStore";
import { toasted } from "@/utils/utils";
import { useApiRequest } from "@/composables/useApiRequest";
import { addServiceToGroup, createGroup } from "../api/groupServiceApi";
const active = ref(0);

const setActive = (item) => {
  active.value = item;
};
const components = [
  {
    name: "Services",
    component: GroupService,
  },
  {
    name: "Drugs",
    component: GroupDrug,
  },
];
const useSelectedServices = useSelectedServicesStore();

const selectedProvider = ref("");
const serviceApi = useApiRequest();
function createGroups() {
  if (useSelectedServices.selectedValues.length === 0) {
    return toasted(false, "", "Please select a service");
  } else {
    serviceApi.send(
      () => addServiceToGroup(),
      (res) => {
        if (res?.success) {
        }
        toasted(res.success, "Group created successfully", res.error);
      }
    );
  }
}
</script>

<template>
  <ModalParent>
    <NewFormParent
      class=""
      size="lg"
      title="New Employee / Family Group"
      subtitle="Create a new group for employees or their families."
    >
      <ActiveProvidersDataProvider v-slot="{ providers, pending }">
        <div class="flex flex-col gap-10">
          <div class="flex flex-col gap-6 bg-base-clr3 w-full p-6 rounded-lg">
            <div class="grid grid-cols-2 gap-4">
              <div
                class="grid grid-cols-2 border border-base-clr rounded w-full"
              >
                <div
                  v-for="(item, index) in components"
                  :key="index"
                  @click="setActive(index)"
                  :class="[
                    'px-4 py-3 transition-colors text-center cursor-pointer duration-300',
                    active === index
                      ? index === 0
                        ? 'bg-base-clr  text-white rounded-l font-medium'
                        : 'bg-base-clr text-white rounded-r  font-medium'
                      : '',
                  ]"
                >
                  {{ item.name }}
                </div>
              </div>

              <select
                v-model="selectedProvider"
                class="rounded-md bg-white px-4"
                name=""
                id=""
              >
                <option disabled selected value="">Select Provider</option>
                <option
                  v-for="data in providers"
                  :key="data.providerName"
                  :value="data.providerUuid"
                >
                  {{ data.providerName }}
                </option>
              </select>
            </div>

            <component
              :id="selectedProvider"
              :search="search"
              :is="components[active].component"
            ></component>
          </div>
          <div class="flex justify-end gap-4">
            <Button
              @click.prevent="closeModal()"
              class="border border-base-clr"
            >
              Cancel
            </Button>

            <Button
              size="md"
              class="!text-white"
              type="primary"
              @click.prevent="createGroups"
            >
              Create Group
            </Button>
          </div>
        </div>
      </ActiveProvidersDataProvider>
    </NewFormParent>
  </ModalParent>
</template>
