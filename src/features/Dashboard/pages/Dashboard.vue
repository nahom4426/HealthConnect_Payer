<script setup>
import icons from "@/utils/icons";
import { ref } from "vue";
import Cards from "../components/Cards.vue";
import Button from "@/components/Button.vue";
import ChartCard from "@/components/charts/ChartCard.vue";
import { onMounted } from "vue";
import { useChartData } from "@/composables/useChartData";
import BarChart from "@/components/charts/BarChart.vue";
import ProgressBar from "../components/ProgressBar.vue";

const claimStatuses = ref([
  {
    status: "Home Decor Range",
    count: 45,
    total: 7,
    percentage: 30,
    color: "",
  },
  {
    status: "Disney Princess Pink Bag 18'",
    count: 32,
    total: 7,
    percentage: 21,
    color: "#02676B",
  },
  {
    status: "Bathroom Essentials",
    count: 28,
    total: 7,
    percentage: 19,
    color: "#884DFF",
  },
  {
    status: "Apple Smartwatches",
    count: 25,
    total: 7,
    percentage: 17,
    color: "#FF8F0D",
  },
]);
const data = ref([
  {
    title: "Number of Employee",
    Image: icons.no_emolpoyee,
    amount: "450",
    today: icons.no_emolpoyee,
    percent: "8.5%",
    customClass: "bg-[#FFE2E5]",
  },
  {
    title: "Group of Employee",
    Image: icons.product_sold,
    amount: "3",
    today: icons.product_sold,
    percent: "8.5%",
    customClass: "bg-[#D2FFDA]",
  },
  {
    title: "Payers",
    Image: icons.policy2,
    amount: "12",
    today: icons.new_customer,
    percent: "8.5%",
    customClass: "bg-[#F3E8FF]",
  },
]);
const barChartOptions = {
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Count",
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      position: "top",
    },
  },
};

const { policyVsClaimData, fetchChartData } = useChartData();

onMounted(() => {
  fetchChartData();
});
</script>
<template>
  <div class="flex flex-col gap-6">
    <div class="grid grid-cols-5 gap-5">
      <div
        class="flex flex-col col-span-3 gap-6 bg-white px-5 py-4 rounded-2xl"
      >
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-2">
            <p class="font-semibold">Total Report</p>
            <p class="text-xs">Sales Summery</p>
          </div>
          <Button class="border flex gap-2 font-medium items-center" type="">
            <i v-html="icons.export"></i>
            Export</Button
          >
        </div>
        <div class="grid grid-cols-3 gap-6">
          <Cards :data="data" />
        </div>
      </div>
      <div class="col-span-2">
        <ChartCard title="Services vs Drugs (ETB)">
          <BarChart
            :chart-data="policyVsClaimData"
            :options="barChartOptions"
            :barThickness="20"
            :maxBarThickness="30"
            height="250px"
          />
        </ChartCard>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl px-5 py-4 border border-[#F8F9FA]">
        <div class="space-y-2 flex flex-col gap-4">
          <p class="font-semibold text-[#373946]">Top Products</p>
          <div
            v-for="(item, index) in claimStatuses"
            :key="index"
            :class="[index < 4 ? 'border-b-2' : '']"
            class="pb-4"
          >
            <div class="flex justify-between items-center text-sm">
              <span class="font-medium">{{ item.status }}</span>
              <div class="flex-1 mx-4">
                <ProgressBar
                  :color="item.color"
                  :percentage="item.percentage"
                  height="0.3rem"
                />
              </div>
              <div
                class="border border-orangebg p-1 rounded-lg text-xs font-bold"
              >
                <span class="text-right w-24 text-orangebg">
                  {{ item.count }} / {{ item.total }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- <div class="flex flex-col gap-4">
    <div class="grid grid-cols-3 gap-4">
      <Cards :data="data" />
    </div>
  </div> -->
</template>
