<script setup>
import { useColorStore } from "@/stores/colorStore";
import { ref } from "vue";

const colorStore = useColorStore();

function setTheme(color) {
  colorStore.set(color);
  activeColor.value = localStorage.getItem("userColor")
    ? JSON.parse(localStorage.getItem("userColor"))
    : "";
}

// Correctly define the colors array using ref
const colors = ref([
  { color: "orange" },
  { color: "brown" },
  { color: "violet" },
  { color: "forestGreen" },
  { color: "deepskyblue" },
  { color: "root" },
  { color: "indigo" },
  { color: "#02676B" },
]);
const activeColor = ref(
  localStorage.getItem("userColor")
    ? JSON.parse(localStorage.getItem("userColor"))
    : ""
);
</script>
<template>
  <div class="flex-1 flex gap-10 p-10">
    <template v-for="(color, idx) in colors" :key="idx">
      <div
        :class="[
          activeColor == color.color ? ' p-4 rounded-md bg-gray-200' : '',
        ]"
      >
        <div
          :class="color.color"
          @click="setTheme(color.color)"
          class="h-16 w-20 rounded-md hover: ring-4 flex items-center p-2 gap-2 ring-primary cursor-pointer"
        >
          <div class="w-6 h-6 bg-primary rounded-full"></div>
          <div class="flex flex-col gap-2">
            <div class="h-2 w-10 rounded bg-primary"></div>
            <div class="h-2 w-10 rounded bg-primary"></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
