<script setup lang="ts">
import { ref } from "vue";
import AwashServices from "./AwashServices.vue";
import AwashClaims from "./AwashClaims.vue";
import icons from "@/utils/icons";
import { useAwashFailedStore } from "../store/awashFailedStore";

const active = ref(0);
const setActive = (i: number) => (active.value = i);
const components = [
  { name: "Services", component: AwashServices },
  { name: "Claims", component: AwashClaims },
];

// Optional search (reserved for future filtering if needed)
const search = ref("");
const store = useAwashFailedStore();
</script>

<template>
  <div class="flex flex-col gap-6 p-6 bg-white rounded-lg">
    <div class="flex justify-between items-center">
      <!-- Segmented Tabs -->
      <div class="flex border border-base-clr rounded w-fit">
        <div
          v-for="(item, index) in components"
          :key="index"
          @click="setActive(index)"
          :class="[
            'px-4 py-3 transition-colors cursor-pointer duration-300',
            active === index
              ? index === 0
                ? 'bg-base-clr w-fit text-white rounded-l font-medium'
                : 'bg-base-clr text-white rounded-r  font-medium'
              : ''
          ]"
        >
          {{ item.name }}
        </div>
      </div>

      <!-- Right controls: Search + Status selector -->
      <div class="flex gap-3 items-center">
        <!-- <div
          tabindex="0"
          class="w-full md:m bg-base-clr3 focus-within:border-primary flex items-center rounded-lg overflow-hidden"
        >
          <span class="w-10 h-full text-base-clr grid place-items-center" v-html="icons.search" />
          <input
            v-model="search"
            placeholder="Search"
            class="flex-1 bg-transparent px- py-2 h-full outline-none"
          />
        </div> -->

        <div class="mb-4 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600">Status</span>
        <div class="inline-flex rounded-lg overflow-hidden border border-gray-200">
          <button
            class="px-3 py-1.5 text-sm"
            :class="store.status === 'INACTIVE' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
            @click="store.status = 'INACTIVE'"
          >
            Inactive
          </button>
          <button
            class="px-3 py-1.5 text-sm border-l border-gray-200"
            :class="store.status === 'ACTIVE' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'"
            @click="store.status = 'ACTIVE'"
          >
            Active
          </button>
        </div>
      </div>
    </div>
      </div>
    </div>

    <component :is="components[active].component" />
  </div>
</template>

