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
    validator: (value) => value.length >= 1, // Accepts 1 or more datasets
  },
  title: {
    type: String,
    default: "Data Flow Visualization",
  },
  height: {
    type: String,
    default: "262px",
  },
  tension: {
    type: Number,
    default: 0.4,
    validator: (value) => value >= 0 && value <= 1,
  },
  fillOpacity: {
    type: Number,
    default: 0.1,
    validator: (value) => value >= 0 && value <= 1,
  },
  showLegend: {
    type: Boolean,
    default: true,
  },
  defaultColors: {
    type: Array,
    default: () => [
      { border: "#4f46e5", background: "#FFFFFF" }, // Purple
      { border: "#10b981", background: "#FFFFFF" }, // Green
      { border: "#f59e0b", background: "#FFFFFF" }, // Amber
      { border: "#ef4444", background: "#FFFFFF" }, // Red
      { border: "#3b82f6", background: "#FFFFFF" }, // Blue
      { border: "#8b5cf6", background: "#FFFFFF" }, // Violet
    ],
  },
});

const chartContainer = ref(null);
let chart = null;

const processDatasets = () => {
  return props.datasets.map((dataset, index) => {
    // Use provided colors or fallback to default palette
    const colorIndex = index % props.defaultColors.length;
    const borderColor =
      dataset.borderColor || props.defaultColors[colorIndex].border;
    const backgroundColor =
      dataset.backgroundColor ||
      hexToRgba(props.defaultColors[colorIndex].background, props.fillOpacity);

    return {
      ...dataset,
      borderColor,
      backgroundColor,
      tension: props.tension,
      fill: dataset.fill !== undefined ? dataset.fill : true,
      borderWidth: dataset.borderWidth || 2,
      pointRadius: dataset.pointRadius || 4,
      pointHoverRadius: dataset.pointHoverRadius || 6,
    };
  });
};

// Helper to convert hex to rgba
const hexToRgba = (hex, opacity) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 2000,
    easing: "easeInOutQuad",
  },
  plugins: {
    legend: {
      display: props.showLegend,
      position: "top",
    },
    title: {
      display: !!props.title,
      text: props.title,
      font: {
        size: 16,
        weight: "bold",
      },
    },
    tooltip: {
      mode: "index",
      intersect: false,
      callbacks: {
        label: (context) => {
          return `${context.dataset.label}: ${context.raw}`;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Value",
      },
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
    },
    x: {
      title: {
        display: true,
        text: "Period",
      },
      grid: {
        display: false,
      },
    },
  },
};

const initChart = () => {
  if (chartContainer.value) {
    if (chart) chart.destroy();

    chart = new Chart(chartContainer.value, {
      type: "line",
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
  () => [
    props.labels,
    props.datasets,
    props.title,
    props.fillOpacity,
    props.tension,
  ],
  () => initChart(),
  { deep: true }
);
</script>

<template>
  <div class="bg-white  p-4 rounded-2xl h-full ">
    <div :style="{ height }">
      <canvas ref="chartContainer"></canvas>
    </div>
    <slot name="footer">
      <div v-if="$slots.footer" class="mt-2 text-sm text-gray-500 text-center">
        <slot name="footer"></slot>
      </div>
    </slot>
  </div>
</template>
