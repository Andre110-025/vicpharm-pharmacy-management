<script setup>
import { ref, computed } from 'vue'
import FilterButton from './FilterButton.vue'
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend)

const props = defineProps({
  orderData: Object,
})

function formatWeekDescription(weekNumber) {
  const weekStr = weekNumber.toString()
  const year = weekStr.substring(0, 4)
  const week = parseInt(weekStr.substring(4))
  return `Week ${week} of ${year}`
}

const rawData = ref(props.orderData)

const durationType = ref('daily')
const durationTypes = ['daily', 'weekly', 'monthly']

function updateDurationType(n) {
  durationType.value = n
}

// Compute Chart.js dataset based on selected timeframe
const chartData = computed(() => {
  let labels = []
  let dataPoints = []

  if (durationType.value === 'daily') {
    labels = rawData.value.order_breakdown_byday.map((item) => item.date)
    dataPoints = rawData.value.order_breakdown_byday.map((item) => item.total)
  } else if (durationType.value === 'weekly') {
    labels = rawData.value.order_breakdown_byweek.map(
      (item) => `${formatWeekDescription(item.week)}`,
    )
    dataPoints = rawData.value.order_breakdown_byweek.map((item) => item.total)
  } else if (durationType.value === 'monthly') {
    labels = rawData.value.order_breakdown_bymonth.map((item) => item.month)
    dataPoints = rawData.value.order_breakdown_bymonth.map((item) => item.total)
  }

  return {
    labels,
    datasets: [
      {
        label: `Order (${durationType.value})`,
        data: dataPoints,
        borderColor: '#AF3585',
        borderWidth: 1,
        fill: true,
        backgroundColor: '#AF3585',
        pointStyle: 'cross',
        tension: 0.4,
        // cubicInterpolationMode: 'monotone',
      },
    ],
  }
})

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      position: 'end',
    },
  },
  scales: {
    x: {
      ticks: {
        display: false,
        autoSkip: true, // Automatically skip labels
        maxTicksLimit: 6, // Show only 12 labels (one per month)
      },
      grid: {
        drawTicks: false,
        display: false,
      },
    },
    y: {
      grid: {
        // display: false,
      },
      beginAtZero: true,
      border: {
        display: false,
      },
      ticks: {
        // display: false,
      },
    },
  },
}
</script>

<template>
  <div class="mt-2.5 flex w-full h-full flex-col justify-between bg-white rounded-lg">
    <div class="flex flex-row flex-wrap gap-5 justify-between mb-4">
      <FilterButton
        v-if="durationTypes.length > 1"
        :options="durationTypes"
        @change-cat="updateDurationType"
      />
    </div>

    <!-- graph goes here -->
    <div class="w-full h-[300px]">
      <Line class="h-full" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
