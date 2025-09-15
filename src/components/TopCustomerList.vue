<script setup>
import { ref, onMounted, reactive, watchEffect, useTemplateRef } from 'vue'
import IconFilter from './IconFilter.vue'
import PropFilter from './PropFilter.vue'
import PropButtonIcon from './PropButtonIcon.vue'
import TopCustomerTable from './TopCustomerTable.vue'
import { useUserStore } from '@/stores/user'
import { useHelpers } from '@/helper'
import axios from 'axios'
import IconExport from './IconExport.vue'
import { toZonedTime } from 'date-fns-tz'

const { formatDate } = useHelpers()

// Set WAT time zone
const WAT_TIMEZONE = 'Africa/Lagos'

// Helper to get today in WAT
const getTodayWAT = () => {
  const now = new Date()
  return toZonedTime(now, WAT_TIMEZONE)
}

const { user } = useUserStore()

const topCustomer = ref(null)
const showIncomeFilter = ref(false)
const isLoading = ref(false)

const anchorLink = useTemplateRef('sales-list')
const downloadLink = ref(null)

const statusOptions = [
  { label: 'Purchase', value: '' },
  { label: 'Not Purchase', value: 'not_spent' },
]

const customerFilter = reactive({
  user_type: user.userType,
  start: '01/01/2025',
  end: formatDate(getTodayWAT()),
  status: '',
})

const getCustomerData = async () => {
  try {
    const { data } = await axios.get(
      `downloadcustomerSpent?spent=${customerFilter.status}&start=${customerFilter.start}&end=${customerFilter.end}`,
      {
        responseType: 'blob',
      },
    )

    // Create a blob from the Excel data
    const blob = new Blob([data], {
      type: 'text/csv',
    })

    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob)

    // Set the download link
    downloadLink.value = url
  } catch (error) {
    console.error('Error getting file:', error)
  }
}

const getTopCustomerList = async (page = 1) => {
  try {
    isLoading.value = true
    topCustomer.value = null

    const response = await axios.post(
      `customerspent?spent=${customerFilter.status}&page=${page}`,
      customerFilter,
    )

    // console.log(response)

    if (response.status === 201 && response.data) {
      topCustomer.value = response.data.Product
      isLoading.value = false

      getCustomerData()
    }
  } catch (error) {
    console.error('Error fetching metrics:', error)
    // Handle error state
    isLoading.value = false
  }
}

watchEffect(() => {
  if (downloadLink.value) {
    anchorLink.value.href = downloadLink.value
    anchorLink.value.download = `CustomerList_${customerFilter.start.replace(/\//g, '-')}_to_${customerFilter.end.replace(/\//g, '-')}.csv`
  }
})

const updateDate = (date) => {
  customerFilter.start = date.start
  customerFilter.end = date.end
  customerFilter.status = date.status
  getTopCustomerList()
}

onMounted(() => {
  getTopCustomerList()
})
</script>

<template>
  <div class="flex justify-end items-center w-full p-4 mt-2.5 max-xs:p-2 max-sm:hidden">
    <div class="flex gap-2.5 justify-end">
      <PropButtonIcon
        class="border-gray-400 text-black hover:bg-gray-100 transition"
        :icon-component="IconFilter"
        text="Filter Date"
        @click="showIncomeFilter = true"
      />

      <a
        class="flex flex-row gap-2 rounded-md px-5 py-2.5 text-sm border-gray-400 text-black hover:bg-gray-100 transition secondaryBtn justify-center items-center"
        ref="sales-list"
        type="button"
      >
        <IconExport class="h-4 w-4" />
        <p class="h-fit max-md:hidden p-0 m-0">Export</p>
      </a>
    </div>
  </div>

  <div class="relative">
    <PropFilter
      :dateFilter="customerFilter"
      v-model:showFilter="showIncomeFilter"
      :show-status="true"
      :options="statusOptions"
      @changeDate="updateDate"
    />
  </div>

  <div class="w-full overflow-hidden rounded-lg">
    <TopCustomerTable v-if="!isLoading && topCustomer" :top-customer="topCustomer.data" />

    <div v-else-if="isLoading" class="h-24 flex justify-center items-center bg-white">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
      ></div>
    </div>
  </div>
</template>
