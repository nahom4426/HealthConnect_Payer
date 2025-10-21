<script setup>
import { ref } from "vue";
import icons from "@/utils/icons";
import { toasted } from "@/utils/utils";
import Drugs from "../components/Drugs.vue";
import ServiceList from "../components/ServiceList.vue";
import Button from "@/components/Button.vue";
import { openModal } from "@customizer/modal-x";

const items = ["Services", "Drugs"];
const active = ref(0);

const setActive = (item) => {
  active.value = item;
};
const components = [
  {
    name: "Services",
    component: ServiceList,
  },
  {
    name: "Drugs",
    component: Drugs,
  },
];
const search = ref("");

// Add function to download sample file
const downloadSample = (type = 'service') => {
  const filename = type === 'service' ? 'service-sample.xlsx' : 'drug-sample.xlsx';
  const filePath = `/src/assets/${filename}`;
  
  // Create a temporary link to download the file
  const link = document.createElement('a');
  link.href = filePath;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Optional: Show success message
  toasted("Downloading ${filename} sample file",`Downloading ${filename} sample file`,"Downloading ${filename} sample file");
};
</script>

<template>
  <div class="flex flex-col gap-6 p-6 bg-white rounded-lg">
    <div class="flex justify-between items-center">
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
              : '',
          ]"
        >
          {{ item.name }}
        </div>
      </div>
      <div class="flex gap-3">
        <div
          tabindex="0"
          class="w-full md:m bg-base-clr3 focus-within:border-primary flex items-center rounded-lg overflow-hidden"
        >
          <span
            class="w-10 h-full text-base-clr grid place-items-center"
            v-html="icons.search"
          />
          <input
            v-model="search"
            :placeholder="active === 0 ? 'Search Services' : 'Search Drugs'"
            class="flex-1 bg-transparent px- py-2 h-full outline-none"
          />
        </div>
        <div v-if="active === 0" class="flex gap-2">
          <button
            class="flex gap-2 bg-primary items-center px-6 py-4 rounded-md whitespace-nowrap text-white"
            @click="openModal('AddService')"
          >
            <i v-html="icons.plus_circle" class=""></i>
            Add Service
          </button>
          <div class="flex gap-2">
            <button
              class="flex gap-2 bg-primary items-center px-6 py-4 rounded-md whitespace-nowrap text-white"
              @click="openModal('Import')"
            >
              <i v-html="icons.plus_circle" class=""></i>
              Import Service
            </button>
            <!-- Add download sample button -->
            <button
            class="flex gap-2 items-center px-6 py-4 rounded-md whitespace-nowrap font-semibold text-white bg-gradient-to-r from-gray-700 via-gray-600 to-gray-500 hover:from-gray-800 hover:to-gray-600 transition-all shadow-md border border-gray-400"
            @click="downloadSample('service')"
            title="Download sample Excel file"
          >
            <i v-html="icons.download" class="text-lg"></i>
            Download Sample
          </button>
          </div>
        </div>
        <div v-else class="flex gap-2">
          <button
            class="flex gap-2 bg-primary items-center px-6 py-4 rounded-md whitespace-nowrap text-white"
            @click="openModal('AddDrug')"
          >
            <i v-html="icons.plus_circle" class=""></i>
            Add Drug
          </button>
          <div class="flex gap-2">
            <button
              class="flex gap-2 bg-primary items-center px-6 py-4 rounded-md whitespace-nowrap text-white"
              @click="openModal('Import', 'drug')"
            >
              <i v-html="icons.plus_circle" class=""></i>
              Import Drug
            </button>
            <!-- Add download sample button for drugs -->
            <button
              class="flex gap-2 bg-gray-600 items-center px-4 py-4 rounded-md whitespace-nowrap text-white text-sm"
              @click="downloadSample('drug')"
              title="Download sample Excel file"
            >
              <i v-html="icons.download" class=""></i>
              Sample
            </button>
          </div>
        </div>
      </div>
    </div>
    <component :search="search" :is="components[active].component"></component>
  </div>
</template>