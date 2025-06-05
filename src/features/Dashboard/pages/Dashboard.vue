<script setup>
import icons from "@/utils/icons";
import { ref } from "vue";
import Cards from "../components/Cards.vue";

const data = ref([
  {
    title: "Total Claims",
    Image: icons.premium,
    amount: "10,293 Birr",
    today: icons.todays,
    percent: "8.5%",
  },
  {
    title: "Services",
    Image: icons.policy,
    amount: "8,293",
    today: icons.todays,
    percent: "8.5%",
  },
  {
    title: "Payers",
    Image: icons.policy2,
    amount: "10",
    today: icons.todays,
    percent: "8.5%",
  },
]);
</script>
<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-3 gap-4">
      <Cards :data="data" />
    </div>
  </div>
</template>
