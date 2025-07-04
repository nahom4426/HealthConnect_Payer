<script setup>
import { onMounted, ref, watch } from "vue";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const props = defineProps({
  labels: {
    type: Array,
    required: true,
    default: () => [],
  },
  datasets: {
    type: Array,
    required: true,
    validator: (value) => value.length >= 1,
  },
  title: {
    type: String,
    default: "Stacked Bar Chart",
  },
  height: {
    type: String,
    default: "270px", // Reduced height
  },
  width: {
    type: String,
    default: "100%", // Can be overridden with specific width
  },
  showLegend: {
    type: Boolean,
    default: true,
  },
  defaultColors: {
    type: Array,
    default: () => [
      "#4f46e5",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#3b82f6",
      "#8b5cf6",
    ],
  },
  borderRadius: {
    type: Number,
    default: 3, // Smaller border radius
  },
  showValues: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: true, // Enable compact mode by default
  },
});

const chartContainer = ref(null);
let chart = null;

const processDatasets = () => {
  return props.datasets.map((dataset, index) => ({
    ...dataset,
    backgroundColor:
      dataset.backgroundColor ||
      props.defaultColors[index % props.defaultColors.length],
    borderColor: dataset.borderColor || "#ffffff",
    borderWidth: dataset.borderWidth || 1,
    borderRadius: dataset.borderRadius || props.borderRadius,
    barPercentage: props.compact ? 0.6 : 0.8, // Narrower bars in compact mode
    categoryPercentage: props.compact ? 0.7 : 0.9, // Less spacing between categories
  }));
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: props.compact ? 10 : 20, // Reduced padding in compact mode
  },
  animation: {
    duration: 800, // Faster animation
    easing: "easeOutQuad",
  },
  plugins: {
    legend: {
      display: props.showLegend,
      position: "top",
      labels: {
        boxWidth: 12, // Smaller legend items
        padding: 8,
      },
    },
    title: {
      display: !!props.title,
      text: props.title,
      font: {
        size: 14, // Smaller title
      },
      padding: {
        bottom: props.compact ? 5 : 10,
      },
    },
    tooltip: {
      mode: "index",
      intersect: false,
      bodyFont: {
        size: 12, // Smaller tooltip text
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false,
      },
      ticks: {
        maxRotation: props.compact ? 45 : 0, // Rotate labels if compact
        padding: props.compact ? 5 : 10,
      },
    },
    y: {
      stacked: true,
      grid: {
        drawTicks: false,
        color: "rgba(0, 0, 0, 0.03)", // Lighter grid lines
      },
      ticks: {
        padding: 5,
      },
    },
  },
};

const initChart = () => {
  if (chartContainer.value) {
    if (chart) chart.destroy();

    chart = new Chart(chartContainer.value, {
      type: "bar",
      data: {
        labels: props.labels,
        datasets: processDatasets(),
      },
      options: chartOptions,
    });
  }
};

onMounted(initChart);

watch(
  () => [props.labels, props.datasets, props.compact],
  () => initChart(),
  { deep: true }
);
</script>

<template>
  <div
    class="bg-white p-3 rounded-lg shadow-sm border border-gray-100"
    :style="{ width }"
  >
    <div :style="{ height }">
      <canvas ref="chartContainer"></canvas>
    </div>
    <slot name="footer">
      <div v-if="$slots.footer" class="mt-1 text-xs text-gray-500 text-center">
        <slot name="footer"></slot>
      </div>
    </slot>
  </div>
</template>
