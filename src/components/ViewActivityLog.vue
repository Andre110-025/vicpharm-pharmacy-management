<script setup>
import { ref, reactive, onMounted } from 'vue'
import ActivityLogTable from './ActivityLogTable.vue'
import IconPlus from './IconPlus.vue'
import axios from 'axios'
import PropFilter from './PropFilter.vue'
import PropPaginator from './PropPaginator.vue'
import PropButtonIcon from './PropButtonIcon.vue'
import IconFilter from './IconFilter.vue'
import { db } from '@/db'

const isLoading = ref(false)
const logFilter = reactive({ start: '', end: '' })
const activityList = ref(null)

// const getActivityList = async (page = 1) => {
//   try {
//     isLoading.value = true
//     activityList.value = null

//     const response = await axios.post(`staffloglist?page=${page}`, logFilter)

//     if (response.status === 201) {
//       activityList.value = response.data.Returns
//       isLoading.value = false
//     }
//   } catch (error) {
//     console.error('Error fetching metrics:', error)
//     isLoading.value = false
//   }
// }

const getActivityList = async (page = 1) => {
  try {
    isLoading.value = true

    // --- 2. ONLINE FETCH ---
    const response = await axios.post(`staffloglist?page=${page}`, logFilter)

    if (response.status === 201) {
      const result = response.data.Returns // Your API returns logs under the 'Returns' key
      activityList.value = result

      // --- 3. CACHE SYNC ---
      if (result.data && result.data.length > 0) {
        const cleanData = JSON.parse(JSON.stringify(result.data))

        const dataToSave = cleanData.map((item, index) => ({
          ...item,
          // Use 'id' as primary key for Dexie
          id: item.id || `log-${index}-${Date.now()}`,
        }))

        try {
          // For logs, we use bulkPut to accumulate a history
          await db.activity.bulkPut(dataToSave)
        } catch (dexieErr) {
          console.error('Dexie Activity Sync Error:', dexieErr)
        }
      }

      isLoading.value = false
    }
  } catch (error) {
    const isOffline = error.isViewOnly || error.isOfflineHandled || !navigator.onLine
    if (isOffline) {
      console.log('🌐 Connection Issue: Filtering Activity Logs locally...')

      let localData = await db.activity.toArray()

      // 1. Date Range Filter
      if (logFilter.start && logFilter.end) {
        // Helper to handle DD/MM/YYYY or YYYY-MM-DD formats
        const parseDate = (str) => {
          if (str.includes('/')) {
            const [d, m, y] = str.split('/')
            return new Date(`${y}-${m}-${d}`).setHours(0, 0, 0, 0)
          }
          return new Date(str).setHours(0, 0, 0, 0)
        }

        const startTs = parseDate(logFilter.start)
        const endTs = parseDate(logFilter.end)

        localData = localData.filter((item) => {
          const rawDate = item.date || item.created_at
          if (!rawDate) return false
          const itemTs = new Date(rawDate).getTime()
          return itemTs >= startTs && itemTs <= endTs
        })
      }

      // 2. Local Sort: Always newest logs first
      localData.sort((a, b) => {
        return new Date(b.date || b.created_at) - new Date(a.date || a.created_at)
      })

      // Format for Paginator
      activityList.value = {
        data: localData,
        current_page: 1,
        last_page: 1,
        total: localData.length,
      }

      isLoading.value = false
      return
    }
    console.error('Error fetching metrics:', error)
    isLoading.value = false
  }
}

// const getActivityList = async (page = 1) => {
//   try {
//     isLoading.value = true

//     // --- 1. OFFLINE LOGIC ---
//     if (!navigator.onLine) {
//       console.log('Offline: Filtering Activity Logs...')
      
//       let localData = await db.activity.toArray()

//       // Date Filter
//       if (logFilter.start && logFilter.end) {
//         const parseDate = (str) => {
//           const [d, m, y] = str.split('/')
//           return new Date(`${y}-${m}-${d}`).getTime()
//         }
//         const startTs = parseDate(logFilter.start)
//         const endTs = parseDate(logFilter.end)

//         localData = localData.filter(item => {
//           // Check for date or created_at fields
//           const rawDate = item.date || item.created_at
//           if (!rawDate) return true
//           const itemTs = new Date(rawDate).getTime()
//           return itemTs >= startTs && itemTs <= endTs
//         })
//       }

//       // Sort by newest first
//       localData.sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))

//       activityList.value = {
//         data: localData,
//         current_page: 1,
//         last_page: 1,
//         total: localData.length
//       }
      
//       isLoading.value = false
//       return
//     }

//     // --- 2. ONLINE FETCH ---
//     const response = await axios.post(`staffloglist?page=${page}`, logFilter)

//     if (response.status === 201) {
//       const result = response.data.Returns // Your API returns logs under the 'Returns' key
//       activityList.value = result

//       // --- 3. CACHE SYNC ---
//       if (result.data && result.data.length > 0) {
//         const cleanData = JSON.parse(JSON.stringify(result.data))

//         const dataToSave = cleanData.map((item, index) => ({
//           ...item,
//           // Use 'id' as primary key for Dexie
//           id: item.id || `log-${index}-${Date.now()}`
//         }))

//         try {
//           // For logs, we use bulkPut to accumulate a history
//           await db.activity.bulkPut(dataToSave)
//         } catch (dexieErr) {
//           console.error('Dexie Activity Sync Error:', dexieErr)
//         }
//       }
      
//       isLoading.value = false
//     }
//   } catch (error) {
//     console.error('Error fetching metrics:', error)
//     isLoading.value = false
//   }
// }

const showLogFilter = ref(false)

const updateDate = (date) => {
  logFilter.start = date.start
  logFilter.end = date.end
  getActivityList()
}

onMounted(() => {
  getActivityList()
})
</script>

<template>
  <header>
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-gray-900">Activity Log</h2>
        <p class="mt-2.5">View all Staff activity.</p>
      </div>
    </div>
  </header>

  <div class="flex gap-2.5 justify-end">
    <PropButtonIcon
      class="border-gray-400 text-black hover:bg-gray-100 transition"
      :icon-component="IconFilter"
      text="Filter Date"
      @click="showLogFilter = true"
    />
  </div>
  <div class="relative">
    <PropFilter
      :dateFilter="logFilter"
      v-model:showFilter="showLogFilter"
      @changeDate="updateDate"
    />
  </div>

  <div class="mt-8 w-full overflow-hidden rounded-lg">
    <ActivityLogTable :activityLog-data="activityList.data" v-if="!isLoading && activityList" />

    <div v-else-if="isLoading" class="h-24 flex justify-center items-center bg-white">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
      ></div>
    </div>

    <PropPaginator
      v-if="activityList && !isLoading"
      :pagination="activityList"
      :limit="2"
      :keepLength="false"
      :showInfo="true"
      @page-changed="getActivityList"
    />
  </div>
</template>
