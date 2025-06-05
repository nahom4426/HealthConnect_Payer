<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

let chartdata = {
    labels: ['Blue', 'Purple', 'Light Purple'],
    datasets: [{
        label: 'My First Dataset',
        data: [100, 100, 100],
        backgroundColor: [
            '#1A5C8D',
            '#8593ED',
            '#C7CEFF'
        ],
        hoverOffset: 4
    }]
};
</script>
<template>
    <div class="h-[300px]">
        <Doughnut :data="chartdata" />
    </div>
</template>