<script setup>
import { computed, ref, shallowRef } from "vue";
import ActiveService from "./ActiveService.vue";
import CompletedService from "./CompletedService.vue";
import ApprovedPayment from "./ApprovedPayment.vue";
import PaidService from "./PaidService.vue";
import Button from "@/components/Button.vue";
import RequestedPayment from "./RequestedPayment.vue";
import { useActivePage } from "../store/activepageStore";
import icons from "@/utils/icons";
const activePageStore = useActivePage();

const active = ref(activePageStore.getActivePage() || "Active Service");
const activeComponent = computed(() => {
  return compos.value.find((el) => el.name == active.value);
});

const compos = shallowRef([
  {
    name: "Active Service",
    component: ActiveService,
  },
  {
    name: "Completed Service",
    component: CompletedService,
  },
  {
    name: "Rquested Payment",
    component: RequestedPayment,
  },
  {
    name: "Approved Payment",
    component: ApprovedPayment,
  },
  {
    name: "Paid Service",
    component: PaidService,
  },
]);
function changePage(name) {
  compos.value.find((el) => {
    if (el.name == name) {
      active.value = el.name;
      activePageStore.set(active.value);
    }
  });
}
</script>
<template>
  <div class="flex flex-col gap-4 bg-white p-2">
    <div class="flex-1 h-full gap-3 flex justify-start items-center">
      <template :key="com.name" v-for="(com, idx) in compos">
        <div
          @click="changePage(com.name)"
          :class="[
            active == com.name
              ? 'bg-primary  text-white rounded px-4 py-2 font-bold'
              : 'bg-white border border-text-clr py-1 text-text-clr rounded',
          ]"
          class="px-4 py-2 cursor-pointer whitespace-nowrap"
        >
          {{ com.name }}
        </div>
        <div
          v-if="idx < compos.length - 1"
          class="flex justify-center items-center"
        >
          <div class="bg-primary h-[1px] w-6 border-primary"></div>
          <div class="w-2 h-2 rounded-full bg-primary"></div>
          <!-- <i v-html="icons.line" /> -->
        </div>
      </template>
    </div>
    <KeepAlive>
      <component :is="activeComponent.component" />
    </KeepAlive>
  </div>
</template>
