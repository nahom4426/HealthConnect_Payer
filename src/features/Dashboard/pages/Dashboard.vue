<script setup>
import icons from "@/utils/icons";
import { ref, onMounted } from "vue";
import Cards from "../components/Cards.vue";
import Button from "@/components/Button.vue";
import ChartCard from "@/components/charts/ChartCard.vue";
import { useChartData } from "@/composables/useChartData";
import BarChart from "@/components/charts/BarChart.vue";
import LoopChart from "@/components/charts/LoopChart.vue";
import Table from "@/components/Table.vue";
import Progress_row from "../components/Progress_row.vue";
import StackedBarChart from "@/components/charts/StackedBarChart.vue";
import CardDashboard from "../components/CardDashboard.vue";
import { useAuthStore } from "@/stores/auth";
import { getReports } from "../api/dashboardApi"; 

const dashboardData = ref(null);
const loading = ref(true);
const error = ref(null);

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    loading.value = true;
    const response = await getReports();
    dashboardData.value = response.data;
    
    // Update your data structures with the API response
    updateDataStructures();
  } catch (err) {
    error.value = err.message || "Failed to fetch dashboard data";
    console.error("Error fetching dashboard data:", err);
  } finally {
    loading.value = false;
  }
};

const updateDataStructures = () => {
  if (!dashboardData.value) return;

  // Update cards data
  data.value = [
    {
      title: "Number of Employee",
      Image: icons.no_emolpoyee,
      amount: dashboardData.value.totalInsured.toString(),
      today: icons.no_emolpoyee,
      percent: "8.5%", // You might want to calculate this
      customClass: "bg-[#FFE2E5]",
    },
    // {
    //   title: "Group of Employee",
    //   Image: icons.product_sold,
    //   amount: dashboardData.value.totalGroups.toString(),
    //   today: icons.product_sold,
    //   percent: "8.5%",
    //   customClass: "bg-[#D2FFDA]",
    // },
    {
      title: "Total Payers",
      Image: icons.policy2,
      amount: dashboardData.value.totalPayers.toString(),
      today: icons.new_customer,
      percent: "8.5%",
      customClass: "bg-[#F3E8FF]",
    },
    {
      title: "Total Providers",
      Image: icons.policy2,
      amount: dashboardData.value.totalProviders.toString(),
      today: icons.product_sold,
      percent: "8.5%",
      customClass: "bg-[#D2FFDA]",
    },
  ];

  // Update claim statuses for the table
  claimStatuses.value = dashboardData.value.providerSummaries.map(provider => ({
    status: provider.providerName,
    count: provider.totalClaims,
    total: provider.totalClaims, // Adjust as needed
    percentage: 100, // Calculate based on your needs
    color: "#02676B",
  }));

  // If you need to show top payers instead of providers in the table
  // claimStatuses.value = dashboardData.value.payerSummaries
  //   .filter(payer => payer.totalClaims > 0)
  //   .slice(0, 4) // Take top 4
  //   .map(payer => ({
  //     status: payer.payerName,
  //     count: payer.totalClaims,
  //     total: payer.totalClaims,
  //     percentage: 100,
  //     color: "#02676B",
  //   }));
};

const claimStatuses = ref([]);
const data = ref([]);

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
  fetchDashboardData();
  fetchChartData();
});

// Helper function to format monthly claim data for charts
const getMonthlyClaimData = () => {
  if (!dashboardData.value?.monthlyClaimTotals) return { labels: [], data: [] };
  
  const months = Object.keys(dashboardData.value.monthlyClaimTotals);
  const claims = Object.values(dashboardData.value.monthlyClaimTotals);
  
  return {
    labels: months,
    data: claims
  };
};
</script>

<template>
  <div class="flex flex-col gap-6 w-full overflow-x-hidden scrollbar-hide">
    <CardDashboard />
    
    <div v-if="loading" class="flex justify-center items-center h-64">
      Loading dashboard data...
    </div>
    
    <div v-else-if="error" class="flex justify-center items-center h-64 text-red-500">
      {{ error }}
    </div>
    
    <template v-else>
      <div class="grid grid-cols-5 gap-5">
        <div class="flex flex-col col-span-3 gap-6 bg-white px-5 py-4 rounded-2xl">
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-2">
              <p class="font-semibold">Total Report</p>
              <p class="text-xs">Sales Summary</p>
            </div>
            <Button class="border flex gap-2 font-medium items-center" type="">
              <i v-html="icons.export"></i>
              Export
            </Button>
          </div>
          <div class="grid grid-cols-3 gap-6">
            <Cards :data="data" />
          </div>
        </div>
        
        <div class="col-span-2 h-f">
          <LoopChart
            title="Monthly Claims"
            :labels="getMonthlyClaimData().labels"
            :datasets="[
              {
                label: 'Claims',
                data: getMonthlyClaimData().data,
                borderColor: '#EF4444',
              }
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
            title="Claim Status"
            :labels="['Pending', 'Approved', 'Rejected', 'Under Review']"
            :datasets="[
              {
                label: 'Claims',
                data: [
                  dashboardData.claimStatistics.pendingClaims,
                  dashboardData.claimStatistics.approvedClaims,
                  dashboardData.claimStatistics.rejectedClaims,
                  dashboardData.claimStatistics.underReviewClaims
                ],
                borderColor: '#FFD665',
                backgroundColor: 'rgba(255, 214, 101, 0.3)',
              }
            ]"
          />
        </div>
      </div>
      
      <div class="grid grid-cols-7 gap-6">
        <div class="bg-white col-span-3 rounded-2xl px-5 py-4 border border-[#F8F9FA]">
          <div class="space-y-2 flex flex-col gap-4">
            <p class="font-semibold text-[#373946]">Top Providers</p>
            <Table
              :showPagination="false"
              :headers="{
                head: ['Name', 'Total Claims', 'Sales'],
                row: ['status', 'totalClaim', 'sales'],
              }"
              :row-com="Progress_row"
              :rows="claimStatuses"
            />
          </div>
        </div>
        
        <div class="col-span-2">
          <LoopChart
            title="Payer Distribution"
            :labels="['With Groups', 'Without Groups']"
            :datasets="[
              {
                label: 'Payers',
                data: [
                  dashboardData.payerSummaries.filter(p => p.totalGroups > 0).length,
                  dashboardData.payerSummaries.filter(p => p.totalGroups === 0).length
                ],
                borderColor: '#FFD665',
                backgroundColor: 'rgba(255, 214, 101, 0.3)',
              }
            ]"
          />
        </div>
        
        <div class="col-span-2">
          <StackedBarChart
            :labels="['Providers', 'Payers', 'Insured']"
            :datasets="[
              {
                label: 'Count',
                data: [
                  dashboardData.totalProviders,
                  dashboardData.totalPayers,
                  dashboardData.totalInsured
                ],
                backgroundColor: '#02676B',
                borderRadius: 1,
              }
            ]"
            title="Entity Distribution"
            :show-values="true"
            :border-radius="8"
          />
        </div>
      </div>
    </template>
  </div>
</template>