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
import { db } from '@/db'

const isOnline = ref(window.navigator.onLine)

// Setup listeners immediately
window.addEventListener('online', () => (isOnline.value = true))
window.addEventListener('offline', () => (isOnline.value = false))

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

    // Attempt the fetch
    const response = await axios.post(
      `customerspent?spent=${customerFilter.status}&page=${page}`,
      customerFilter,
    )

    if (response.status === 201 && response.data) {
      const result = response.data.Product
      topCustomer.value = result

      // --- CACHING LOGIC ---
      if (result.data && result.data.length > 0) {
        const cleanData = JSON.parse(JSON.stringify(result.data))

        // Ensure every item has a primary key 'id' for Dexie
        const dataToSave = cleanData.map((item, index) => ({
          ...item,
          id: item.id || item.customer_id || `temp-${index}`,
        }))

        try {
          await db.top_customers.clear() // Clear old cache for this specific report
          await db.top_customers.bulkPut(dataToSave)
        } catch (dexieErr) {
          console.error('Dexie Write Error:', dexieErr)
        }
      }

      isLoading.value = false
      getCustomerData() // Trigger the download link generation
    }
  } catch (error) {
    // --- CONSOLIDATED OFFLINE LOGIC ---
    // Triggered by Layer 1 (Request Interceptor) OR Layer 2 (Timeout/Network Error)
    const shouldShowCache = error.isViewOnly || error.isOfflineHandled || !navigator.onLine

    if (shouldShowCache) {
      console.log('🌐 Connection Issue: Loading Top Customers from Cache...')

      let data = await db.top_customers.toArray()

      // 1. Filter by Status
      if (customerFilter.status === 'not_spent') {
        data = data.filter((item) => !item.total_amount || parseFloat(item.total_amount) <= 0)
      } else {
        data = data.filter((item) => item.total_amount && parseFloat(item.total_amount) > 0)
      }

      // 2. Date Filtering Helper
      const getTimestamp = (dateStr) => {
        if (!dateStr) return 0
        if (dateStr.includes('-')) return new Date(dateStr).setHours(0, 0, 0, 0)
        const [d, m, y] = dateStr.split('/')
        return new Date(`${y}-${m}-${d}`).setHours(0, 0, 0, 0)
      }

      const startTs = getTimestamp(customerFilter.start)
      const endTs = getTimestamp(customerFilter.end)

      data = data.filter((item) => {
        const rawDate = item.date || item.created_at
        if (!rawDate) return true
        const itemTs = getTimestamp(rawDate)
        return itemTs >= startTs && itemTs <= endTs
      })

      // 3. Set the state
      topCustomer.value = {
        data: data,
        current_page: 1,
        last_page: 1,
        total: data.length,
      }

      isLoading.value = false
      return // Important: stop execution
    }

    console.error('Error fetching top customers:', error)
    isLoading.value = false
  }
}

// const getTopCustomerList = async (page = 1) => {
//   try {
//     isLoading.value = true

//     // --- 1. OFFLINE LOGIC ---
//     if (!isOnline.value) {
//       console.log('Offline: Filtering cache...')

//       let data = await db.top_customers.toArray()

//       // 1. Status Filter
//       if (customerFilter.status === 'not_spent') {
//         data = data.filter((item) => !item.total_amount || parseFloat(item.total_amount) <= 0)
//       } else {
//         data = data.filter((item) => item.total_amount && parseFloat(item.total_amount) > 0)
//       }

//       // 2. Robust Date Parsing (DD/MM/YYYY to Timestamp)
//       const getTimestamp = (dateStr) => {
//         if (!dateStr) return 0
//         // If date is already YYYY-MM-DD or ISO string
//         if (dateStr.includes('-')) return new Date(dateStr).setHours(0, 0, 0, 0)
//         // If date is DD/MM/YYYY
//         const [d, m, y] = dateStr.split('/')
//         return new Date(`${y}-${m}-${d}`).setHours(0, 0, 0, 0)
//       }

//       const startTs = getTimestamp(customerFilter.start)
//       const endTs = getTimestamp(customerFilter.end)

//       data = data.filter((item) => {
//         // Check item.date or item.created_at
//         const rawDate = item.date || item.created_at
//         if (!rawDate) return true // Keep if no date exists to be safe

//         const itemTs = getTimestamp(rawDate)
//         return itemTs >= startTs && itemTs <= endTs
//       })

//       topCustomer.value = {
//         data: data,
//         current_page: 1,
//         last_page: 1,
//         total: data.length,
//       }

//       isLoading.value = false
//       return
//     }

//     // // --- 1. OFFLINE CHECK ---
//     // if (!navigator.onLine) {
//     //   console.log('Offline: Loading Top Customers from cache...')
//     //   const cachedData = await db.top_customers.toArray()

//     //   if (cachedData.length > 0) {
//     //     topCustomer.value = {
//     //       data: cachedData,
//     //       current_page: 1,
//     //       last_page: 1,
//     //     }
//     //     isLoading.value = false
//     //     return
//     //   }
//     // }

//     // --- 2. FETCH FROM SERVER ---
//     const response = await axios.post(
//       `customerspent?spent=${customerFilter.status}&page=${page}`,
//       customerFilter,
//     )

//     if (response.status === 201 && response.data) {
//       const result = response.data.Product
//       topCustomer.value = result

//       // --- 3. FIX: ENSURE DATA HAS 'id' BEFORE SAVING ---
//       if (result.data && result.data.length > 0) {
//         // Strip Vue Proxies
//         const cleanData = JSON.parse(JSON.stringify(result.data))

//         // Manually assign 'id' from whatever unique field exists (e.g., customer_id)
//         const dataToSave = cleanData.map((item, index) => ({
//           ...item,
//           // Dexie MUST have a field named 'id' because of your db.js schema
//           id: item.id || item.customer_id || `temp-${index}`,
//         }))

//         try {
//           await db.top_customers.clear()
//           await db.top_customers.bulkPut(dataToSave)
//           console.log('Top customers cached successfully!')
//         } catch (dexieErr) {
//           console.error('Dexie Write Error:', dexieErr)
//         }
//       }

//       isLoading.value = false
//       getCustomerData()
//     }
//   } catch (error) {
//     console.error('Error fetching top customers:', error)
//     isLoading.value = false
//   }
// }

// const getTopCustomerList = async (page = 1) => {
//   try {
//     isLoading.value = true
//     topCustomer.value = null

//     const response = await axios.post(
//       `customerspent?spent=${customerFilter.status}&page=${page}`,
//       customerFilter,
//     )

//     // console.log(response)

//     if (response.status === 201 && response.data) {
//       topCustomer.value = response.data.Product
//       isLoading.value = false

//       getCustomerData()
//     }
//   } catch (error) {
//     console.error('Error fetching metrics:', error)
//     // Handle error state
//     isLoading.value = false
//   }
// }

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
        class="flex flex-row gap-2 rounded-md px-5 py-2.5 text-sm border-gray-400 text-black transition secondaryBtn justify-center items-center"
        :class="!isOnline ? 'opacity-50 cursor-not-allowed bg-gray-200' : 'hover:bg-gray-100'"
        ref="sales-list"
        :type="isOnline ? 'button' : ''"
        @click="!isOnline ? alert('Exporting requires an internet connection') : null"
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
