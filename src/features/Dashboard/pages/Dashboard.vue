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
  if (authStore.auth?.user?.payerUuid) {
    const payer = dashboardData.value.payerSummaries?.find(
      p => p.payerUuid === authStore.auth?.user?.payerUuid
    );

    return {
      ...dashboardData.value,
      totalInsured: payer?.totalInsured || 0,
      totalClaims: payer?.totalClaims || 0,
      totalGroups: payer?.totalGroups || 0,
      payerSummaries: payer ? [payer] : [],
      providerSummaries: dashboardData.value.providerSummaries || [],
      claimStatistics: dashboardData.value.claimStatistics || {
        pendingClaims: 0,
        approvedClaims: 0,
        rejectedClaims: 0,
        underReviewClaims: 0
      },
      monthlyClaimTotals: dashboardData.value.monthlyClaimTotals || {}
    };
  }

  // If user has providerUuid, filter provider-specific data
  if (authStore.auth?.user?.providerUuid) {
    const provider = dashboardData.value.providerSummaries?.find(
      p => p.providerUuid === authStore.auth?.user?.providerUuid
    );

    return {
      ...dashboardData.value,
      totalClaims: provider?.totalClaims || 0,
      providerSummaries: provider ? [provider] : [],
      claimStatistics: dashboardData.value.claimStatistics || {
        pendingClaims: 0,
        approvedClaims: 0,
        rejectedClaims: 0,
        underReviewClaims: 0
      },
      monthlyClaimTotals: dashboardData.value.monthlyClaimTotals || {}
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
  if (authStore.auth?.user?.providerUuid) {
    // Provider-specific cards
    data.value = [
      {
        title: "Total Claims",
        Image: icons.policy2,
        amount: filteredData.value.totalClaims.toString(),
        today: icons.policy2,
        percent: calculateClaimGrowth(),
        customClass: "bg-[#F3E8FF]",
        trend: getTrendIcon(filteredData.value.totalClaims, 0) // Placeholder, replace 0 with actual previous value
      },
      {
        title: "Pending Claims",
        Image: icons.clock,
        amount: filteredData.value.claimStatistics.pendingClaims.toString(),
        today: icons.clock,
        percent: "",
        customClass: "bg-[#FFF4E5]",
        trend: "neutral"
      },
      {
        title: "Approved Claims",
        Image: icons.check_circle,
        amount: filteredData.value.claimStatistics.approvedClaims.toString(),
        today: icons.check_circle,
        percent: "",
        customClass: "bg-[#E5F9F0]",
        trend: "up"
      },
      {
        title: "Rejected Claims",
        Image: icons.x_circle,
        amount: filteredData.value.claimStatistics.rejectedClaims.toString(),
        today: icons.x_circle,
        percent: "",
        customClass: "bg-[#FFE2E5]",
        trend: "down"
      }
    ];
  } else if (authStore.auth?.user?.payerUuid) {
    // Payer-specific cards
    data.value = [
      {
        title: "Total Insured",
        Image: icons.no_emolpoyee,
        amount: filteredData.value.totalInsured.toString(),
        today: icons.no_emolpoyee,
        percent: calculateInsuredGrowth(),
        customClass: "bg-[#E0F2FE]",
        trend: getTrendIcon(filteredData.value.totalInsured, 0) // Placeholder, replace 0 with actual previous value
      },
      {
        title: "Total Groups",
        Image: icons.group,
        amount: filteredData.value.totalGroups.toString(),
        today: icons.group,
        percent: "",
        customClass: "bg-[#E5F9F0]",
        trend: "neutral"
      },
      {
        title: "Total Claims",
        Image: icons.policy2,
        amount: filteredData.value.totalClaims.toString(),
        today: icons.policy2,
        percent: calculateClaimGrowth(),
        customClass: "bg-[#F3E8FF]",
        trend: getTrendIcon(filteredData.value.totalClaims, 0) // Placeholder, replace 0 with actual previous value
      },
      {
        title: "Active Contracts",
        Image: icons.contract,
        amount: filteredData.value.totalContracts.toString(),
        today: icons.contract,
        percent: "",
        customClass: "bg-[#FFF4E5]",
        trend: "neutral"
      }
    ];
  } else {
    // Admin cards
    data.value = [
      {
        title: "Total Payers",
        Image: icons.building,
        amount: filteredData.value.totalPayers.toString(),
        today: icons.building,
        percent: "",
        customClass: "bg-[#E0F2FE]",
        trend: "neutral"
      },
      {
        title: "Payers With Employee",
        Image: icons.building_active,
        amount: filteredData.value.numberOfPayersWithInsured.toString(),
        today: icons.building_active,
        percent: calculateActivePayerPercentage(),
        customClass: "bg-[#E5F9F0]",
        trend: "up"
      },
      {
        title: "Total Providers",
        Image: icons.hospital,
        amount: filteredData.value.totalProviders.toString(),
        today: icons.hospital,
        percent: "",
        customClass: "bg-[#F3E8FF]",
        trend: "neutral"
      },
      {
        title: "Total Insured",
        Image: icons.no_emolpoyee,
        amount: filteredData.value.totalInsured.toString(),
        today: icons.no_emolpoyee,
        percent: calculateInsuredGrowth(),
        customClass: "bg-[#FFF4E5]",
        trend: getTrendIcon(filteredData.value.totalInsured, 0) // Placeholder, replace 0 with actual previous value
      },
      {
        title: "Total Claims",
        Image: icons.policy2,
        amount: filteredData.value.totalClaims.toString(),
        today: icons.policy2,
        percent: calculateClaimGrowth(),
        customClass: "bg-[#FFE2E5]",
        trend: getTrendIcon(filteredData.value.totalClaims, 0) // Placeholder, replace 0 with actual previous value
      }
    ];
  }

  // Update claim statuses for the table
  if (authStore.auth?.user?.providerUuid) {
    claimStatuses.value = []; // Providers don't see this table in this context
  } else if (authStore.auth?.user?.payerUuid) {
    // Show groups for payer
    claimStatuses.value = (filteredData.value.payerSummaries[0]?.groupSummaries || []).map(group => ({
      status: group.groupName,
      count: group.totalInsured,
      total: group.totalInsured,
      percentage: 100, // Assuming each group's totalInsured is 100% of itself
      color: "#02676B",
    }));

    // If no groups, show payer summary as a fallback
    if (claimStatuses.value.length === 0 && filteredData.value.payerSummaries.length > 0) {
      const payer = filteredData.value.payerSummaries[0];
      claimStatuses.value = [{
        status: payer.payerName,
        count: payer.totalInsured,
        total: payer.totalInsured,
        percentage: 100,
        color: "#02676B",
      }];
    }
  } else {
    // Show top providers for admin
    claimStatuses.value = (filteredData.value.providerSummaries || [])
      .sort((a, b) => b.totalClaims - a.totalClaims)
      .slice(0, 5)
      .map(provider => ({
        status: provider.providerName,
        count: provider.totalClaims,
        total: provider.totalClaims,
        percentage: filteredData.value.totalClaims > 0
          ? Math.round((provider.totalClaims / filteredData.value.totalClaims) * 100)
          : 0,
        color: "#02676B",
      }));
  }
};

// Helper functions for KPIs
const calculateActivePayerPercentage = () => {
  if (!filteredData.value || filteredData.value.totalPayers === 0) return "0%";
  return `${Math.round((filteredData.value.numberOfPayersWithInsured / filteredData.value.totalPayers) * 100)}%`;
};

const calculateInsuredGrowth = () => {
  // This is placeholder data. In a real app, you'd compare current totalInsured with previous period data.
  // Example: return ((currentInsured - previousInsured) / previousInsured * 100).toFixed(1) + '%';
  return filteredData.value.totalInsured > 0 ? "8.5%" : "0%";
};

const calculateClaimGrowth = () => {
  // This is placeholder data. In a real app, you'd compare current totalClaims with previous period data.
  // Example: return ((currentClaims - previousClaims) / previousClaims * 100).toFixed(1) + '%';
  return filteredData.value.totalClaims > 0 ? "5.2%" : "0%";
};

const getTrendIcon = (currentValue, previousValue) => {
  if (currentValue > previousValue) return "up";
  if (currentValue < previousValue) return "down";
  return "neutral";
};

const claimStatuses = ref([]);
const data = ref([]);

const barChartOptions = {
  responsive: true,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Count",
        font: {
          weight: 'bold'
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  },
  plugins: {
    legend: {
      position: "top",
      labels: {
        boxWidth: 12,
        padding: 20,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleFont: {
        size: 14,
        weight: 'bold'
      },
      bodyFont: {
        size: 12
      },
      padding: 12,
      cornerRadius: 8
    }
  }
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

// Format contract data for chart
const getContractDistributionData = () => {
  if (!filteredData.value?.contractSummaries) return { labels: [], data: [] };

  const labels = Object.keys(filteredData.value.contractSummaries);
  const data = Object.values(filteredData.value.contractSummaries);

  // Sort by count and take top 5
  const sorted = labels
    .map((label, index) => ({ label, count: data[index] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Limiting to top 5 for better readability

  return {
    labels: sorted.map(item => item.label),
    data: sorted.map(item => item.count)
  };
};
</script>

<template>
  <div class="flex flex-col gap-6 w-full overflow-x-hidden scrollbar-custom  mx-auto py-6">
    <CardDashboard />

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
    </div>

    <div v-else-if="error" class="flex justify-center items-center h-64">
      <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md max-w-md text-center">
        <p class="font-bold text-lg mb-2">Oops! Something went wrong.</p>
        <p class="text-sm mb-4">{{ error }}</p>
        <button
          @click="fetchDashboardData"
          class="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
        >
          Retry
        </button>
      </div>
    </div>

    <template v-else-if="filteredData">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div class="flex flex-col col-span-3 gap-6 bg-white px-6 py-5 rounded-2xl shadow-lg border border-gray-100">
          <div class="flex items-center justify-between pb-4 border-b border-gray-100">
            <div class="flex flex-col gap-1">
              <p class="font-semibold text-xl text-gray-800">Summary Report</p>
              <p class="text-sm text-gray-500">
                {{ authStore.auth?.user?.providerUuid ? 'Provider' : authStore.auth?.user?.payerUuid ? 'Payer' : 'System' }} Overview
              </p>
            </div>
            <Button class="border flex gap-2 font-medium items-center text-sm hover:bg-gray-50 px-4 py-2 rounded-lg transition duration-200">
              <i v-html="icons.export" class="w-4 h-4 text-gray-600"></i>
              Export
            </Button>
          </div>
          <div class="grid gap-4"
            :class="{
              'grid-cols-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-4': authStore.auth?.user?.providerUuid || authStore.auth?.user?.payerUuid,
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5': !authStore.auth?.user?.payerUuid && !authStore.auth?.user?.providerUuid
            }">
            <Cards :data="data" />
          </div>
        </div>

        <div class="col-span-2">
          <ChartCard
            class="h-full flex flex-col"
          >
            <div class="relative flex-grow flex items-center justify-center">
              <div class="relative w-full h-full">
                 <LoopChart
            :title="authStore.auth?.user?.providerUuid ? 'Your Monthly Claims' : authStore.auth?.user?.payerUuid ? 'Your Monthly Claims' : 'System Monthly Claims'"
                  
                  :labels="getMonthlyClaimData().labels"
                  :datasets="[
                    {
                      label: 'Claims',
                      data: getMonthlyClaimData().data,
                      borderColor: '#3B82F6',
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      fill: true,
                      tension: 0.4,
                      pointRadius: 5,
                      pointHoverRadius: 8,
                      pointBackgroundColor: '#FFFFFF',
                      pointBorderColor: '#3B82F6',
                      pointBorderWidth: 2,
                      cubicInterpolationMode: 'monotone', // Smoother curves
                    }
                  ]"
               
                />
              </div>

              <div v-if="getMonthlyClaimData().data.length > 0"
                   class="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-gray-200 animate-fade-in">
                <p class="text-xs text-gray-500">Current Month</p>
                <p class="font-bold text-blue-600 text-lg">
                  {{ getMonthlyClaimData().data[getMonthlyClaimData().data.length - 1] }} claims
                </p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div class="col-span-1 lg:col-span-5">
          <ChartCard
            :title="authStore.auth?.user?.providerUuid ? 'Your Services Utilization' : authStore.auth?.user?.payerUuid ? 'Your Services vs Drugs (ETB)' : 'Services vs Drugs (ETB)'"
            class="h-full"
          >
            <div class="relative h-full">
              <div class="group relative h-full">
                <div class="absolute inset-0 bg-blue-50 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

                <BarChart
                  :chart-data="policyVsClaimData"
                  :options="{
                    ...barChartOptions,
                    animation: {
                      duration: 1500,
                      easing: 'easeInOutQuad'
                    }
                  }"
                  :barThickness="24"
                  :maxBarThickness="30"
                />

                <div v-if="policyVsClaimData?.datasets?.length > 1 && policyVsClaimData.datasets[0].data[0] && policyVsClaimData.datasets[1].data[0]"
                     class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200 animate-fade-in">
                  <span class="text-sm font-medium">
                    <span class="text-green-600">↑</span>
                    {{ Math.round((policyVsClaimData.datasets[0].data[0] / policyVsClaimData.datasets[1].data[0] - 1) * 100) }}%
                    higher
                  </span>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        <div class="col-span-1 lg:col-span-2">
          <ChartCard  class="h-full">
            <div class="relative flex-grow flex items-center justify-center">
              <LoopChart
              :title="'Claim Status Distribution'"
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
                    backgroundColor: [
                      'rgba(255, 159, 64, 0.8)', // Orange
                      'rgba(54, 162, 235, 0.8)', // Blue
                      'rgba(255, 99, 132, 0.8)', // Red
                      'rgba(75, 192, 192, 0.8)'  // Green-ish
                    ],
                    borderColor: [
                      'rgba(255, 159, 64, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 99, 132, 1)',
                      'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1.5,
                    hoverOffset: 15, // Increased hover offset
                    cutout: '70%',
                    radius: '90%',
                    animation: {
                      animateScale: true,
                      animateRotate: true
                    }
                  }
                ]"
                type="doughnut"
              />

              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
               
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div class="bg-white col-span-1 lg:col-span-3 rounded-2xl px-6 py-5 border border-gray-100 shadow-lg">
          <div class="space-y-4">
            <div class="flex justify-between items-center pb-2 border-b border-gray-100">
              <p class="font-semibold text-xl text-gray-800">
                {{ authStore.auth?.user?.payerUuid ? 'Your Groups' : 'Top Providers' }}
              </p>
              <button class="text-sm text-blue-600 hover:text-blue-800 font-medium transition duration-200">View All &rarr;</button>
            </div>
            <Table
              :showPagination="false"
              :headers="{
                head: ['Name', 'Total', 'Percentage'],
                row: ['status', 'total', 'percentage'],
              }"
              :row-com="Progress_row"
              :rows="claimStatuses"
              class="mt-4"
            />
          </div>
        </div>

        <div class="col-span-1 lg:col-span-2" v-if="!authStore.auth?.user?.providerUuid">
          <ChartCard
            :title="authStore.auth?.user?.payerUuid ? 'Your Insured Status' : 'Payer Distribution'"
          >
            <LoopChart
              :labels="authStore.auth?.user?.payerUuid ?
                ['Active', 'Inactive'] :
                ['With Groups', 'Without Groups']"
              :datasets="[
                {
                  label: authStore.auth?.user?.payerUuid ? 'Insured' : 'Payers',
                  data: authStore.auth?.user?.payerUuid ?
                    [filteredData.totalInsured, 0] : // Placeholder for inactive insured, replace with actual data if available
                    [
                      filteredData.payerSummaries.filter(p => p.totalGroups > 0).length,
                      filteredData.payerSummaries.filter(p => p.totalGroups === 0).length
                    ],
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)', // Blue
                    'rgba(156, 163, 175, 0.8)' // Gray
                  ],
                  borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(156, 163, 175, 1)'
                  ],
                  borderWidth: 1.5,
                  hoverOffset: 12,
                  cutout: '60%', // Slightly smaller cutout
                  radius: '90%',
                  animation: {
                    animateScale: true,
                    animateRotate: true
                  }
                }
              ]"
              type="pie"
            />
          </ChartCard>
        </div>

        <div class="col-span-1 lg:col-span-2" v-if="!authStore.auth?.user?.providerUuid">
          <ChartCard
            :title="authStore.auth?.user?.payerUuid ? 'Your Coverage Summary' : 'Entity Distribution'"
          >
            <StackedBarChart
              :labels="authStore.auth?.user?.payerUuid ?
                ['Insured', 'Groups', 'Claims'] :
                ['Providers', 'Payers', 'Insured']"
              :datasets="[
                {
                  label: 'Count',
                  data: authStore.auth?.user?.payerUuid ?
                    [filteredData.totalInsured, filteredData.totalGroups, filteredData.totalClaims] :
                    [filteredData.totalProviders, filteredData.totalPayers, filteredData.totalInsured],
                  backgroundColor: '#02676B', // Deep Teal
                  borderRadius: 6, // Slightly more rounded bars
                }
              ]"
              :show-values="true"
            />
          </ChartCard>
        </div>
      </div>

      <div v-if="!authStore.auth?.user?.providerUuid" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
          <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div class="relative z-10">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm opacity-80 mb-1">Active Contracts</p>
                <p class="text-4xl font-extrabold mt-1">{{ filteredData.totalContracts }}</p>
              </div>
              <div class="bg-white/20 p-3 rounded-full flex-shrink-0">
                <i v-html="icons.contract" class="text-white text-2xl"></i>
              </div>
            </div>
            <div class="mt-5 pt-4 border-t border-white/20">
              <p class="text-sm opacity-80">Top Payer</p>
              <p class="font-medium truncate text-lg">
                {{ Object.entries(filteredData.contractSummaries || {}).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A' }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-xl transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
          <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div class="relative z-10">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm opacity-80 mb-1">Total Claims</p>
                <p class="text-4xl font-extrabold mt-1">{{ filteredData.totalClaims }}</p>
              </div>
              <div class="bg-white/20 p-3 rounded-full flex-shrink-0">
                <i v-html="icons.policy2" class="text-white text-2xl"></i>
              </div>
            </div>
            <div class="mt-5 pt-4 border-t border-white/20">
              <p class="text-sm opacity-80">Approval Rate</p>
              <p class="font-medium text-lg">
                {{ filteredData.totalClaims > 0
                  ? Math.round((filteredData.claimStatistics.approvedClaims / filteredData.totalClaims) * 100)
                  : 0 }}%
              </p>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-purple-600 to-fuchsia-700 rounded-2xl p-6 text-white shadow-xl transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
          <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div class="relative z-10">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm opacity-80 mb-1">Total Insured</p>
                <p class="text-4xl font-extrabold mt-1">{{ filteredData.totalInsured }}</p>
              </div>
              <div class="bg-white/20 p-3 rounded-full flex-shrink-0">
                <i v-html="icons.no_emolpoyee" class="text-white text-2xl"></i>
              </div>
            </div>
            <div class="mt-5 pt-4 border-t border-white/20">
              <p class="text-sm opacity-80">Avg per Payer</p>
              <p class="font-medium text-lg">
                {{ filteredData.totalPayers > 0
                  ? Math.round(filteredData.totalInsured / filteredData.totalPayers)
                  : 0 }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!authStore.auth?.user?.providerUuid && Object.keys(filteredData.contractSummaries || {}).length > 0" class="grid grid-cols-1 gap-6">
        <ChartCard
          :title="authStore.auth?.user?.payerUuid ? 'Your Contract Distribution' : 'Contract Distribution'"
        >
          <BarChart
            :chart-data="{
              labels: getContractDistributionData().labels,
              datasets: [{
                label: 'Contracts',
                data: getContractDistributionData().data,
                backgroundColor: 'rgba(79, 70, 229, 0.8)', // Indigo
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1,
                borderRadius: 6,
              }]
            }"
            :options="barChartOptions"
            :height="300"
          />
        </ChartCard>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Base styles for the main container */
div {
  box-sizing: border-box; /* Ensure padding and border are included in the element's total width and height */
}

/* Enhanced shadow effects for a more premium look */
.shadow-lg {
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.08), 0 8px 15px -3px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
  box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.12), 0 10px 20px -5px rgba(0, 0, 0, 0.08);
}

/* Smooth transitions for interactive elements */
.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Animated gradient background for monthly claims chart */
@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.7; }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Fade-in animation for new elements appearing */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

/* Custom scrollbar for improved aesthetics */
.scrollbar-custom::-webkit-scrollbar {
  width: 8px;
  height: 8px; /* For horizontal scrollbars */
}

.scrollbar-custom::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 10px;
}

.scrollbar-custom::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border-radius: 10px;
  border: 2px solid #f0f0f0; /* Creates a slight inset effect */
}

.scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}

/* Hide scrollbar for specific elements if desired */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>