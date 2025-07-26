<script setup>
import icons from "@/utils/icons";
import { ref, computed, onMounted } from "vue";
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

const authStore = useAuthStore();
const dashboardData = ref(null);
const loading = ref(true);
const error = ref(null);

// Computed property to get filtered data based on user's role
const filteredData = computed(() => {
  if (!dashboardData.value) return null;
  
  // If user has payerUuid, filter payer-specific data
  if (authStore.payerUuid) {
    const payer = dashboardData.value.payerSummaries.find(
      p => p.payerUuid === authStore.payerUuid
    );
    
    return {
      ...dashboardData.value,
      totalInsured: payer?.totalInsured || 0,
      totalClaims: payer?.totalClaims || 0,
      totalGroups: payer?.totalGroups || 0,
      payerSummaries: [payer].filter(Boolean),
      providerSummaries: dashboardData.value.providerSummaries,
      claimStatistics: dashboardData.value.claimStatistics,
      monthlyClaimTotals: dashboardData.value.monthlyClaimTotals
    };
  }
  
  // If user has providerUuid, filter provider-specific data
  if (authStore.providerUuid) {
    const provider = dashboardData.value.providerSummaries.find(
      p => p.providerUuid === authStore.providerUuid
    );
    
    return {
      ...dashboardData.value,
      totalClaims: provider?.totalClaims || 0,
      providerSummaries: [provider].filter(Boolean),
      claimStatistics: dashboardData.value.claimStatistics,
      monthlyClaimTotals: dashboardData.value.monthlyClaimTotals
    };
  }
  
  // Otherwise return all data (for super admin)
  return dashboardData.value;
});

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    loading.value = true;
    const response = await getReports();
    dashboardData.value = response.data;
    updateDataStructures();
  } catch (err) {
    error.value = err.message || "Failed to fetch dashboard data";
    console.error("Error fetching dashboard data:", err);
  } finally {
    loading.value = false;
  }
};

const updateDataStructures = () => {
  if (!filteredData.value) return;

  // Update cards data based on user type
  if (authStore.providerUuid) {
    // Provider-specific cards
    data.value = [
      {
        title: "Total Claims",
        Image: icons.policy2,
        amount: filteredData.value.totalClaims.toString(),
        today: icons.policy2,
        percent: "N/A",
        customClass: "bg-[#F3E8FF]",
      }
    ];
  } else {
    // Default cards (for payer or super admin)
    data.value = [
      // {
      //   title: "Number of Insured",
      //   Image: icons.no_emolpoyee,
      //   amount: filteredData.value.totalInsured.toString(),
      //   today: icons.no_emolpoyee,
      //   percent: "8.5%",
      //   customClass: "bg-[#FFE2E5]",
      // },
      {
        title: "Number of Groups",
        Image: icons.product_sold,
        amount: filteredData.value.totalGroups.toString(),
        today: icons.product_sold,
        percent: "8.5%",
        customClass: "bg-[#D2FFDA]",
      },
       {
        title: "Number Of Payers With Insured",
        Image: icons.policy2,
        amount: filteredData.value.numberOfPayersWithInsured.toString(),
        today: icons.new_customer,
        percent: "2.5%",
        customClass: "bg-[#F3E8EF]",
      },
      {
        title: "Total Claims",
        Image: icons.policy2,
        amount: filteredData.value.totalClaims.toString(),
        today: icons.new_customer,
        percent: "8.5%",
        customClass: "bg-[#F3E8FF]",
      }
    ];
    
    // Add payers card only for super admin
    if (!authStore.payerUuid) {
      data.value.push({
        title: "Number of Payers",
        Image: icons.policy2,
        amount: filteredData.value.totalPayers.toString(),
        today: icons.new_customer,
        percent: "8.5%",
        customClass: "bg-[#E0F2FE]",
      }),
        data.value.push({
        title: "Number Of Payers With Insured",
        Image: icons.policy2,
        amount: filteredData.value.numberOfPayersWithInsured.toString(),
        today: icons.new_customer,
        percent: "8.5%",
        customClass: "bg-[#E0F2FE]",
      });
    }
  }

  // Update claim statuses for the table
  claimStatuses.value = filteredData.value.providerSummaries.map(provider => ({
    status: provider.providerName,
    count: provider.totalClaims,
    total: provider.totalClaims,
    percentage: 100,
    color: "#02676B",
  }));

  // If user is a payer, show their groups in the table
  if (authStore.payerUuid && filteredData.value.payerSummaries[0]?.groupSummaries?.length) {
    claimStatuses.value = filteredData.value.payerSummaries[0].groupSummaries.map(group => ({
      status: group.groupName,
      count: group.totalInsured,
      total: group.totalInsured,
      percentage: 100,
      color: "#02676B",
    }));
  }
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
  if (!filteredData.value?.monthlyClaimTotals) return { labels: [], data: [] };
  
  const months = Object.keys(filteredData.value.monthlyClaimTotals);
  const claims = Object.values(filteredData.value.monthlyClaimTotals);
  
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
    
    <template v-else-if="filteredData">
      <div class="grid grid-cols-5 gap-5">
        <div class="flex flex-col col-span-3 gap-6 bg-white px-5 py-4 rounded-2xl">
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-2">
              <p class="font-semibold">Summary Report</p>
              <p class="text-xs">
                {{ authStore.providerUuid ? 'Provider' : authStore.payerUuid ? 'Payer' : 'System' }} Overview
              </p>
            </div>
            <Button class="border flex gap-2 font-medium items-center" type="">
              <i v-html="icons.export"></i>
              Export
            </Button>
          </div>
          <div class="grid gap-6" :class="authStore.providerUuid ? 'grid-cols-1' : 'grid-cols-3'">
            <Cards :data="data" />
          </div>
        </div>
        
        <div class="col-span-2 h-f">
          <LoopChart
            :title="authStore.providerUuid ? 'Your Monthly Claims' : 'Monthly Claims'"
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
                  filteredData.claimStatistics.pendingClaims,
                  filteredData.claimStatistics.approvedClaims,
                  filteredData.claimStatistics.rejectedClaims,
                  filteredData.claimStatistics.underReviewClaims
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
            <p class="font-semibold text-[#373946]">
              {{ authStore.payerUuid ? 'Your Groups' : 'Top Providers' }}
            </p>
            <Table
              :showPagination="false"
              :headers="{
                head: ['Name', 'Total', 'Percentage'],
                row: ['status', 'total', 'percentage'],
              }"
              :row-com="Progress_row"
              :rows="claimStatuses"
            />
          </div>
        </div>
        
        <div class="col-span-2" v-if="!authStore.providerUuid">
          <LoopChart
            :title="authStore.payerUuid ? 'Your Insured Distribution' : 'Payer Distribution'"
            :labels="authStore.payerUuid ? 
              ['Active', 'Inactive'] : 
              ['With Groups', 'Without Groups']"
            :datasets="[
              {
                label: authStore.payerUuid ? 'Insured' : 'Payers',
                data: authStore.payerUuid ? 
                  [filteredData.totalInsured, 0] : // Adjust with actual active/inactive data if available
                  [
                    filteredData.payerSummaries.filter(p => p.totalGroups > 0).length,
                    filteredData.payerSummaries.filter(p => p.totalGroups === 0).length
                  ],
                borderColor: '#FFD665',
                backgroundColor: 'rgba(255, 214, 101, 0.3)',
              }
            ]"
          />
        </div>
        
        <div class="col-span-2" v-if="!authStore.providerUuid">
          <StackedBarChart
            :labels="authStore.payerUuid ? 
              ['Insured', 'Groups', 'Claims'] : 
              ['Providers', 'Payers', 'Insured']"
            :datasets="[
              {
                label: 'Count',
                data: authStore.payerUuid ? 
                  [filteredData.totalInsured, filteredData.totalGroups, filteredData.totalClaims] :
                  [filteredData.totalProviders, filteredData.totalPayers, filteredData.totalInsured],
                backgroundColor: '#02676B',
                borderRadius: 1,
              }
            ]"
            :title="authStore.payerUuid ? 'Your Coverage' : 'Entity Distribution'"
            :show-values="true"
            :border-radius="8"
          />
        </div>
      </div>
    </template>
  </div>
</template>