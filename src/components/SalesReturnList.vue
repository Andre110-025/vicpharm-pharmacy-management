<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import PropPaginator from './PropPaginator.vue'
import axios from 'axios'
import SearchBar from './SearchBar.vue'
import IconPlus from './IconPlus.vue'
import IconFilter from './IconFilter.vue'
import IconExport from './IconExport.vue'
import SaleReturnTable from './SaleReturnTable.vue'
import { useUserStore } from '@/stores/user'
import PropButtonIcon from './PropButtonIcon.vue'
import PropFilter from './PropFilter.vue'
import { db } from '@/db'

const { user } = useUserStore()

const isLoading = ref(false)
const searchTerm = ref('')
const showFilter = ref(false)

const filterData = reactive({
  user_type: user.userType,
  branch_id: user.branchId,
  start: '',
  end: '',
})

const saleReturns = ref(null)

// const getSalesReturnList = async (page = 1) => {
//   try {
//     isLoading.value = true
//     saleReturns.value = null

//     const response = await axios.post(`returnslist?page=${page}`, filterData)

//     if (response.status === 201) {
//       saleReturns.value = response.data.Returns
//       isLoading.value = false
//     }
//   } catch (error) {
//     console.error('Error fetching metrics:', error)
//     // Handle error state
//     isLoading.value = false
//   }
// }

const getSalesReturnList = async (page = 1) => {
  try {
    isLoading.value = true

    // Layer 1 & 2: Attempt network request (handles Lie-Fi via 3s timeout)
    const response = await axios.post(`returnslist?page=${page}`, filterData)

    if (response.status === 201) {
      const result = response.data.Returns
      saleReturns.value = result

      // --- ONLINE: SYNC CACHE ---
      if (result.data && result.data.length > 0) {
        const rawData = JSON.parse(JSON.stringify(result.data))

        const dataToSave = rawData.map((item, index) => ({
          ...item,
          // Fallbacks to prevent UI breakage when rendering offline
          return_type: item.return_type || 'nonreturnable',
          customer_name: item.customer_name || 'N/A',
          product_name: item.product_name || 'Unknown Product',
          // Dexie Primary Key
          id: item.id || `ret-${index}-${Date.now()}`,
        }))

        try {
          // Using bulkPut to maintain a local history
          await db.sales_returns.bulkPut(dataToSave)
        } catch (dexieErr) {
          console.error('Dexie Error:', dexieErr)
        }
      }

      isLoading.value = false
    }
  } catch (error) {
    // --- OFFLINE / TIMEOUT FALLBACK ---
    const isOffline = error.isViewOnly || error.isOfflineHandled || !navigator.onLine

    if (isOffline) {
      console.log('🌐 Connection Issue: Loading Sales Returns from local cache...')

      let localData = await db.sales_returns.toArray()

      // 1. Search Filter (Invoice, Product, or Customer)
      const s = searchTerm.value.toLowerCase().trim()
      if (s) {
        localData = localData.filter(
          (item) =>
            (item.invoice_number && String(item.invoice_number).toLowerCase().includes(s)) ||
            (item.product_name && String(item.product_name).toLowerCase().includes(s)) ||
            (item.customer_name && String(item.customer_name).toLowerCase().includes(s)),
        )
      }

      // 2. Date Filter
      if (filterData.start && filterData.end) {
        const getTs = (str) => {
          if (!str) return 0
          if (str.includes('-')) return new Date(str).setHours(0,0,0,0)
          const [d, m, y] = str.split('/')
          return new Date(`${y}-${m}-${d}`).setHours(0,0,0,0)
        }
        
        const startTs = getTs(filterData.start)
        const endTs = getTs(filterData.end)

        localData = localData.filter((item) => {
          const itemDate = item.date || item.created_at
          if (!itemDate) return true
          const itemTs = getTs(itemDate)
          return itemTs >= startTs && itemTs <= endTs
        })
      }

      // Format for Paginator component
      saleReturns.value = {
        data: localData,
        current_page: 1,
        last_page: 1,
        total: localData.length,
      }
      
      isLoading.value = false
      return 
    }

    console.error('Error fetching returns:', error)
    isLoading.value = false
  }
}

// const getSalesReturnList = async (page = 1) => {
//   try {
//     isLoading.value = true

//     // --- 1. OFFLINE LOGIC ---
//     if (!navigator.onLine) {
//       console.log('Offline: Filtering Sales Returns from cache...')

//       let localData = await db.sales_returns.toArray()

//       // A. Search Filter (by Invoice number or Product Name)
//       if (searchTerm.value) {
//         const s = searchTerm.value.toLowerCase()
//         localData = localData.filter(
//           (item) =>
//             (item.invoice_number && item.invoice_number.toLowerCase().includes(s)) ||
//             (item.product_name && item.product_name.toLowerCase().includes(s)) ||
//             (item.customer_name && item.customer_name.toLowerCase().includes(s)),
//         )
//       }

//       // B. Date Filter
//       if (filterData.start && filterData.end) {
//         const parseDate = (str) => {
//           const [d, m, y] = str.split('/')
//           return new Date(`${y}-${m}-${d}`).getTime()
//         }
//         const startTs = parseDate(filterData.start)
//         const endTs = parseDate(filterData.end)

//         localData = localData.filter((item) => {
//           // Use item.date or item.created_at depending on what your API returns
//           const itemTs = new Date(item.date || item.created_at).getTime()
//           return itemTs >= startTs && itemTs <= endTs
//         })
//       }

//       saleReturns.value = {
//         data: localData,
//         current_page: 1,
//         last_page: 1,
//         total: localData.length,
//       }
//       isLoading.value = false
//       return
//     }

//     // --- 2. ONLINE FETCH ---
//     const response = await axios.post(`returnslist?page=${page}`, filterData)

//     if (response.status === 201) {
//       const result = response.data.Returns
//       saleReturns.value = result

//       // --- 3. CACHE SYNC ---
//       if (result.data && result.data.length > 0) {
//         const rawData = JSON.parse(JSON.stringify(result.data))

//         const dataToSave = rawData.map((item, index) => ({
//           ...item,
//           return_type: item.return_type || 'nonreturnable',
//           customer_name: item.customer_name || 'N/A',
//           product_name: item.product_name || 'Unknown Product',
//           id: item.id || `ret-${index}-${Date.now()}`,
//         }))

//         try {
//           // CHANGE THIS from db.activity to db.sales_returns
//           await db.sales_returns.bulkPut(dataToSave)
//         } catch (dexieErr) {
//           console.error('Dexie Error:', dexieErr)
//         }
//       }
//       // if (result.data && result.data.length > 0) {
//       //   const rawData = JSON.parse(JSON.stringify(result.data))

//       //   // --- 3. CACHE SYNC ---
//       //   const dataToSave = rawData.map((item, index) => ({
//       //     ...item,
//       //     dataType: 'sales_return', //
//       //     return_type: item.return_type || 'nonreturnable',
//       //     customer_name: item.customer_name || 'N/A',
//       //     product_name: item.product_name || 'Unknown Product',
//       //     id: item.id || `ret-${index}-${Date.now()}`,
//       //   }))

//       //   // const dataToSave = rawData.map((item, index) => ({
//       //   //   ...item,
//       //   //   // Add default values for critical fields to prevent offline crashes
//       //   //   return_type: item.return_type || 'nonreturnable',
//       //   //   customer_name: item.customer_name || 'N/A',
//       //   //   product_name: item.product_name || 'Unknown Product',
//       //   //   id: item.id || `ret-${index}-${Date.now()}`,
//       //   // }))

//       //   try {
//       //     await db.activity.bulkPut(dataToSave)
//       //   } catch (dexieErr) {
//       //     console.error('Dexie Error:', dexieErr)
//       //   }
//       // }
//       // if (result.data && result.data.length > 0) {
//       //   const rawData = JSON.parse(JSON.stringify(result.data))

//       //   const dataToSave = rawData.map((item, index) => ({
//       //     ...item,
//       //     // Ensure we have an ID for Dexie
//       //     id: item.id || `ret-${index}-${Date.now()}`
//       //   }))

//       //   try {
//       //     // Using bulkPut to keep a growing history of returns
//       //     await db.activity.bulkPut(dataToSave)
//       //   } catch (dexieErr) {
//       //     console.error('Dexie Error:', dexieErr)
//       //   }
//       // }

//       isLoading.value = false
//     }
//   } catch (error) {
//     console.error('Error fetching returns:', error)
//     isLoading.value = false
//   }
// }

const updateDate = (date) => {
  filterData.start = date.start
  filterData.end = date.end
  getSalesReturnList()
}

// watch for changes in the search term
let delaySearch = null
watch(searchTerm, (newValue) => {
  if (delaySearch) {
    clearTimeout(delaySearch)
  }
  delaySearch = setTimeout(() => {
    getSalesReturnList(1)
    // Call the function or perform actions that should happen after the delay
  }, 1500) // Adjust the delay time in milliseconds as needed
})

onMounted(() => {
  getSalesReturnList()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center w-full p-4 mt-2.5">
      <!-- Search Bar -->
      <SearchBar v-model="searchTerm" />

      <div class="flex items-center gap-2.5">
        <PropButtonIcon
          :icon-component="IconPlus"
          text="Create a Sale Return"
          class="bg-mainColor text-white"
          @click="openReturnSale()"
          v-if="false"
        />
        <PropButtonIcon
          class="border-gray-400 text-black hover:bg-gray-100 transition"
          :icon-component="IconFilter"
          text="Filter"
          @click="showFilter = !showFilter"
        />
        <!-- <PropButtonIcon
          class="border-gray-400 text-black hover:bg-gray-100 transition"
          :icon-component="IconExport"
          text="Export"
        /> -->
      </div>
    </div>
    <!-- Filter Popup -->
    <div class="relative">
      <PropFilter
        :dateFilter="filterData"
        v-model:showFilter="showFilter"
        @changeDate="updateDate"
      />
    </div>
  </div>

  <div class="w-full overflow-hidden rounded-lg">
    <SaleReturnTable v-if="!isLoading && saleReturns" :sales="saleReturns.data" />

    <div v-else-if="isLoading" class="h-24 flex justify-center items-center bg-white">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
      ></div>
    </div>

    <!-- Updated Paginator implementation -->
    <PropPaginator
      v-if="saleReturns && !isLoading"
      :pagination="saleReturns"
      :show-info="true"
      @page-changed="getSalesReturnList"
      :limit="2"
      :keepLength="false"
    />
  </div>
</template>
