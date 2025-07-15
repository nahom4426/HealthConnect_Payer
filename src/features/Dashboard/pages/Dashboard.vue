<script setup>
import icons from "@/utils/icons";
import { ref } from "vue";
import Cards from "../components/Cards.vue";
import Button from "@/components/Button.vue";
import ChartCard from "@/components/charts/ChartCard.vue";
import { onMounted } from "vue";
import { useChartData } from "@/composables/useChartData";
import BarChart from "@/components/charts/BarChart.vue";
import LoopChart from "@/components/charts/LoopChart.vue";
import Table from "@/components/Table.vue";
import Progress_row from "../components/Progress_row.vue";
import StackedBarChart from "@/components/charts/StackedBarChart.vue";
import CardDashboard from "../components/CardDashboard.vue";
import { useAuthStore } from "@/stores/auth";


const claimStatuses = ref([
  {
    status: "Home Decor Range",
    count: 45,
    total: 7,
    percentage: 85,
    color: "#02676B",
  },
  {
    status: "Disney Princess Pink Bag 18'",
    count: 32,
    total: 7,
    percentage: 65,
    color: "#02676B",
  },
  {
    status: "Bathroom Essentials",
    count: 28,
    total: 7,
    percentage: 45,
    color: "#02676B",
  },
  {
    status: "Apple Smartwatches",
    count: 25,
    total: 7,
    percentage: 35,
    color: "#02676B",
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

const { policyVsClaimData, revenueChartData, fetchChartData } = useChartData();

onMounted(() => {
  fetchChartData();
});
</script>
<template>
  <div class="flex flex-col gap-6 w-full  overflow-x-hidden scrollbar-hide">
    <CardDashboard />
    <div class="grid grid-cols-5 gap-5">
      <div
        class="flex flex-col col-span-3 gap-6 bg-white px-5 py-4 rounded-2xl"
      >
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-2">
            <p class="font-semibold">Total Report</p>
            <p class="text-xs">Sales Summary</p>
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
      <div class="col-span-2 h-f">
        <LoopChart
          title="Claim Requests (ETB)"
          :labels="['Jan', 'Feb', 'Mar', 'Apr']"
          :datasets="[
            {
              label: 'Pharmacy Claim',
              data: [2000, 6000, 500, 5000, 3000],
              borderColor: '#EF4444',
            },
            {
              label: 'Hospitals',
              data: [3000, 5000, 1000, 6000, 4000],
              borderColor: '#A700FF',
            },
            {
              label: 'Clinics',
              data: [1000, 3000, 2000, 1000],
              borderColor: '#3CD856',
            },
          ]"
          :tension="0.3"
        />
      </div>
    </div>
    <div class="grid grid-cols-7 gap-6">
      <div class="col-span-5">
        <ChartCard title="Services vs Drugs (ETB)">
          <BarChart
            :chart-data="policyVsClaimData"
            :options="barChartOptions"
            :barThickness="20"
            :maxBarThickness="30"
            height="262px"
          />
        </ChartCard>
      </div>
      <div class="col-span-2">
        <LoopChart
          title="Volume vs Service Level"
          :labels="['Jan', 'Feb', 'Mar']"
          :datasets="[
            {
              label: 'Sales',
              data: [100, 200, 150],
              borderColor: '#FFD665',
              backgroundColor: 'rgba(255, 214, 101, 0.3)',
            },
            // {
            //   label: 'Expenses',
            //   data: [50, 100, 75],
            //   borderColor: '#02676B',
            //   backgroundColor: 'rgba(2, 103, 107, 0.3)',
            // },
          ]"
        />
      </div>
    </div>
    <div class="grid grid-cols-7 gap-6">
      <div
        class="bg-white col-span-3 rounded-2xl px-5 py-4 border border-[#F8F9FA]"
      >
        <div class="space-y-2 flex flex-col gap-4">
          <p class="font-semibold text-[#373946]">Top Providers</p>
          <Table
            :showPagination="false"
            :headers="{
              head: ['Name', 'TotalClaims', 'Sales'],
              row: ['status', 'totalClaim', 'sales'],
            }"
            :row-com="Progress_row"
            :rows="claimStatuses"
          >
          </Table>
        </div>
      </div>
      <div class="col-span-2">
        <LoopChart
          title="Volume vs Service Level"
          :labels="['Jan', 'Feb', 'Mar']"
          :datasets="[
            {
              label: 'Sales',
              data: [100, 200, 150],
              borderColor: '#FFD665',
              backgroundColor: 'rgba(255, 214, 101, 0.3)',
            },
            // {
            //   label: 'Expenses',
            //   data: [50, 100, 75],
            //   borderColor: '#02676B',
            //   backgroundColor: 'rgba(2, 103, 107, 0.3)',
            // },
          ]"
        />
      </div>
      <div class="col-span-2">
        <StackedBarChart
          :labels="['Jan', 'Feb', 'Mar', 'Apr']"
          :datasets="[
            {
              label: 'Volume',
              data: [100, 600, 500, 800],
              backgroundColor: '#FFD665',
              borderRadius: 1,
            },
            {
              label: 'Services',
              data: [300, 350, 320, 380],
              backgroundColor: '#02676B',
              borderRadius: 1,
            },
          ]"
          title="Quarterly Financials"
          :show-values="true"
          :border-radius="8"
        />
      </div>
    </div>
  </div>
</template>
