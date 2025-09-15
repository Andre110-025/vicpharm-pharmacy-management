<script setup>
import { ref, computed } from 'vue'
import FilterButton from './FilterButton.vue'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'vue-chartjs'

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend)

const props = defineProps({
  revenueProfit: Object,
})

const rawData = ref(props.revenueProfit)

const durationType = ref('daily')
const durationTypes = ['daily', 'weekly', 'monthly']

function updateDurationType(n) {
  durationType.value = n
}

function formatWeekDescription(weekNumber) {
  const weekStr = weekNumber.toString()
  const year = weekStr.substring(0, 4)
  const week = parseInt(weekStr.substring(4))
  return `Week ${week} of ${year}`
}

// Format date strings for x-axis labels
function formatDateLabel(dateString) {
  if (durationType.value === 'daily') {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } else if (durationType.value === 'monthly') {
    // Convert YYYY-MM to abbreviated month name and year
    const [year, month] = dateString.split('-')
    const date = new Date(year, parseInt(month) - 1) // Month is 0-indexed in JS Date
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }
  return dateString
}

// Compute Chart.js dataset based on selected timeframe
const chartData = computed(() => {
  let labels = []
  let revenueData = []
  let profitData = []

  if (durationType.value === 'daily') {
    labels = rawData.value.revenue_profit_byday.map((item) => formatDateLabel(item.date))
    revenueData = rawData.value.revenue_profit_byday.map((item) => item.revenue)
    profitData = rawData.value.revenue_profit_byday.map((item) => item.profit)
  } else if (durationType.value === 'weekly') {
    labels = rawData.value.revenue_profit_byweek.map(
      (item) => `${formatWeekDescription(item.week)}`,
    )
    revenueData = rawData.value.revenue_profit_byweek.map((item) => item.revenue)
    profitData = rawData.value.revenue_profit_byweek.map((item) => item.profit)
  } else if (durationType.value === 'monthly') {
    labels = rawData.value.revenue_profit_bymonth.map((item) => formatDateLabel(item.month))
    revenueData = rawData.value.revenue_profit_bymonth.map((item) => item.revenue)
    profitData = rawData.value.revenue_profit_bymonth.map((item) => item.profit)
  }

  return {
    labels,
    datasets: [
      {
        label: 'Revenue',
        data: revenueData,
        backgroundColor: '#AF3585',
        borderWidth: 1,
        borderColor: '#AF3585',
      },
      {
        label: 'Profit',
        data: profitData,
        backgroundColor: '#4CAF50',
        borderWidth: 1,
        borderColor: '#4CAF50',
      },
    ],
  }
})

// Format number for y-axis (to k and m)
function formatYAxisNumber(value) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'm'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'k'
  }
  return value.toString()
}

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      align: 'center',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20,
      },
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            label += formatYAxisNumber(context.parsed.y)
          }
          return label
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        display: true,
        autoSkip: true,
        maxTicksLimit: 10,
      },
      grid: {
        drawTicks: false,
        display: false,
      },
    },
    y: {
      grid: {
        display: true,
      },
      beginAtZero: true,
      ticks: {
        callback: function (value) {
          return formatYAxisNumber(value)
        },
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
      <Bar class="h-full" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
