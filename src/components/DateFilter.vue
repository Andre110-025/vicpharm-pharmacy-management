<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useHelpers } from '@/helper'
import { toZonedTime, format as formatTz } from 'date-fns-tz'

const { formatDate } = useHelpers()

const showIncomeDataFilter = ref(false)
const selectedFilter = ref('All Time')
const showCustomDatePicker = ref(false)
const customStartDate = ref('')
const customEndDate = ref('')

// Define emits
const emit = defineEmits(['updateDateRange'])

// Set WAT time zone
const WAT_TIMEZONE = 'Africa/Lagos'

// Helper to get today in WAT
const getTodayWAT = () => {
  const now = new Date()
  return toZonedTime(now, WAT_TIMEZONE)
}

// Get today's date in WAT
const today = getTodayWAT()

// Format date for input (YYYY-MM-DD) in WAT
const formatDateForInput = (date) => {
  return formatTz(toZonedTime(date, WAT_TIMEZONE), 'yyyy-MM-dd', { timeZone: WAT_TIMEZONE })
}

// Set default custom dates to last 30 days
const setDefaultCustomDates = () => {
  const end = getTodayWAT()
  const start = new Date(end)
  start.setDate(end.getDate() - 30)

  customStartDate.value = formatDateForInput(start)
  customEndDate.value = formatDateForInput(end)
}

// Calculate and get formatted date range
const getDateRange = () => {
  const endDate = getTodayWAT() // End date is always today for preset filters
  let startDate = getTodayWAT()

  switch (selectedFilter.value) {
    case 'All Time':
      // For 'All Time', set to a far past date - Jan 1, 2010 in WAT
      startDate = toZonedTime(new Date(2025, 0, 1), WAT_TIMEZONE)
      break
    case 'Today':
      // Start date is today (beginning of the day) in WAT
      startDate = toZonedTime(
        new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        WAT_TIMEZONE,
      )
      break
    case 'Past Week':
      // Start date is 7 days ago in WAT
      startDate = getTodayWAT()
      startDate.setDate(today.getDate() - 7)
      break
    case 'Last 30 Days':
      // Start date is 30 days ago in WAT
      startDate = getTodayWAT()
      startDate.setDate(today.getDate() - 30)
      break
    case '90 Days':
      // Start date is 90 days ago in WAT
      startDate = getTodayWAT()
      startDate.setDate(today.getDate() - 90)
      break
    case '6 Months':
      // Start date is 6 months ago in WAT
      startDate = getTodayWAT()
      startDate.setMonth(today.getMonth() - 6)
      break
    case 'Custom':
      // Use custom selected dates in WAT
      startDate = toZonedTime(new Date(customStartDate.value), WAT_TIMEZONE)
      const customEnd = toZonedTime(new Date(customEndDate.value), WAT_TIMEZONE)
      // For custom filter, use the actual selected end date
      return {
        start: formatDate(startDate),
        end: formatDate(customEnd),
        filter: selectedFilter.value,
      }
    default:
      startDate = toZonedTime(new Date(2010, 0, 1), WAT_TIMEZONE) // Default to 'All Time'
  }

  // Format dates as DD/MM/YYYY
  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
    filter: selectedFilter.value,
  }
}

// Store the date range in a ref to ensure reactivity
const dateRange = ref(getDateRange())

// Watch for changes to selectedFilter and update dateRange
watch(selectedFilter, () => {
  console.log('Filter changed to:', selectedFilter.value)
  if (selectedFilter.value === 'Custom') {
    showCustomDatePicker.value = true
  } else {
    showCustomDatePicker.value = false
    dateRange.value = getDateRange()
    emit('updateDateRange', dateRange.value)
  }
})

// Function to edit custom dates
const editCustomDates = () => {
  showCustomDatePicker.value = true
  showIncomeDataFilter.value = false
}

// Function to select a filter option
const selectFilter = (filter) => {
  // console.log('Selected filter:', filter)
  selectedFilter.value = filter
  if (filter !== 'Custom') {
    showIncomeDataFilter.value = false
  }
}

// Function to apply custom date range
const applyCustomDateRange = () => {
  if (customStartDate.value && customEndDate.value) {
    // Validate that start date is not after end date
    const start = new Date(customStartDate.value)
    const end = new Date(customEndDate.value)

    if (start > end) {
      alert('Start date cannot be after end date')
      return
    }

    dateRange.value = getDateRange()
    emit('updateDateRange', dateRange.value)
    showCustomDatePicker.value = false
    showIncomeDataFilter.value = false
  }
}

// Function to cancel custom date selection
const cancelCustomDateRange = () => {
  showCustomDatePicker.value = false
  showIncomeDataFilter.value = false
  // Reset to previous filter if it wasn't custom
  if (selectedFilter.value === 'Custom') {
    selectedFilter.value = 'All Time'
  }
}

// Get display text for custom filter
const getCustomFilterDisplay = computed(() => {
  if (selectedFilter.value === 'Custom' && customStartDate.value && customEndDate.value) {
    const start = new Date(customStartDate.value)
    const end = new Date(customEndDate.value)
    return `${formatDate(start)} - ${formatDate(end)}`
  }
  return 'Custom'
})

// Click outside handling
const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.filter-dropdown')
  const trigger = document.querySelector('.filter-trigger')
  const customPicker = document.querySelector('.custom-date-picker')

  if (
    dropdown &&
    !dropdown.contains(event.target) &&
    !trigger.contains(event.target) &&
    (!customPicker || !customPicker.contains(event.target))
  ) {
    showIncomeDataFilter.value = false
    showCustomDatePicker.value = false
  }
}
// Initialize custom dates
// Emit initial date range on component mount
onMounted(() => {
  setDefaultCustomDates()
  document.addEventListener('click', handleClickOutside)
  // Emit initial value
  emit('updateDateRange', dateRange.value)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="mt-7 mb-4 relative bg-mainColor/5 text-black px-2 py-1 leading-none flex justify-end">
    <div class="flex items-center gap-2">
      <h6
        class="text-mainColor text-xs w-fit cursor-pointer"
        @click="
          selectedFilter === 'Custom'
            ? editCustomDates()
            : (showIncomeDataFilter = !showIncomeDataFilter)
        "
      >
        {{ selectedFilter === 'Custom' ? getCustomFilterDisplay : selectedFilter }}
      </h6>

      <span
        v-if="selectedFilter !== 'Custom'"
        class="text-mainColor text-xs cursor-pointer filter-trigger"
        @click="showIncomeDataFilter = !showIncomeDataFilter"
      >
        ▼
      </span>

      <span
        v-if="selectedFilter === 'Custom'"
        class="text-mainColor text-xs cursor-pointer"
        @click="editCustomDates"
        title="Click to edit custom dates"
      >
        ✏️
      </span>
    </div>
    <!-- Main Filter Dropdown -->
    <div
      class="absolute w-fit flex flex-col gap-4 p-4 pr-8 z-10 top-10 bg-white shadow-md filter-dropdown"
      :class="showIncomeDataFilter ? '' : 'hidden'"
    >
      <p
        v-for="filter in [
          'All Time',
          'Today',
          'Past Week',
          'Last 30 Days',
          '90 Days',
          '6 Months',
          'Custom',
        ]"
        :key="filter"
        @click="selectFilter(filter)"
        class="cursor-pointer hover:text-mainColor whitespace-nowrap"
        :class="{ 'text-mainColor font-semibold': selectedFilter === filter }"
      >
        {{ filter === 'Custom' && selectedFilter === 'Custom' ? getCustomFilterDisplay : filter }}
      </p>
    </div>

    <!-- Custom Date Picker Modal -->
    <div
      v-if="showCustomDatePicker"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-96 max-w-full mx-4 custom-date-picker">
        <h3 class="text-lg font-semibold mb-4 text-gray-800">Select Custom Date Range</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              v-model="customStartDate"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor focus:border-transparent"
              :max="customEndDate || formatDateForInput(today)"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              v-model="customEndDate"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mainColor focus:border-transparent"
              :min="customStartDate"
              :max="formatDateForInput(today)"
            />
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="applyCustomDateRange"
            class="mainBtn flex-1"
            :disabled="!customStartDate || !customEndDate"
          >
            Apply
          </button>
          <button @click="cancelCustomDateRange" class="secondaryBtn flex-1">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>
