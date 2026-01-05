<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import IconSearch from './IconSearch.vue'
import PropPaginator from './PropPaginator.vue'
import InventoryRecordTable from './InventoryRecordTable.vue'
import { db } from '@/db'

const { user, privileges } = useUserStore()
const isLoading = ref(false)
const searchTerm = ref('')

const inventory = ref(null)

// const getInventoryRecord = async (page = 1) => {
//   try {
//     isLoading.value = true
//     inventory.value = null
//     const response = await axios.post(`inventoryrecord?page=${page}`, {
//       search: searchTerm.value,
//     })

//     console.log('Response:', response)

//     if (response.status == 201) {
//       inventory.value = response.data.Product
//       isLoading.value = false
//     }
//   } catch (error) {
//     console.error('Error fetching Data:', error)
//     // Handle error state
//     isLoading.value = false
//   }
// }

const getInventoryRecord = async (page = 1) => {
  try {
    isLoading.value = true

    // --- 1. OFFLINE LOGIC ---
    if (!navigator.onLine) {
      console.log('Offline: Filtering Inventory Records...')
      
      let localData = await db.inventory.toArray()

      // Search Filter (Product Name or Reference)
      if (searchTerm.value) {
        const s = searchTerm.value.toLowerCase()
        localData = localData.filter(item => 
          (item.product_name && item.product_name.toLowerCase().includes(s)) ||
          (item.reference && item.reference.toLowerCase().includes(s)) ||
          (item.batch_number && item.batch_number.toLowerCase().includes(s))
        )
      }

      inventory.value = {
        data: localData,
        current_page: 1,
        last_page: 1,
        total: localData.length
      }
      
      isLoading.value = false
      return
    }

    // --- 2. ONLINE FETCH ---
    const response = await axios.post(`inventoryrecord?page=${page}`, {
      search: searchTerm.value,
    })

    if (response.status == 201) {
      const result = response.data.Product
      inventory.value = result

      // --- 3. CACHE SYNC ---
      if (result.data && result.data.length > 0) {
        const cleanData = JSON.parse(JSON.stringify(result.data))

        const dataToSave = cleanData.map((item, index) => ({
          ...item,
          // Ensuring we match 'id' and 'product_name' from your db.js schema
          id: item.id || `rec-${index}-${Date.now()}`,
          product_name: item.product_name || item.name 
        }))

        try {
          // For audit records, we usually bulkPut to build a long local history
          await db.inventory.bulkPut(dataToSave)
        } catch (dexieErr) {
          console.error('Dexie Error:', dexieErr)
        }
      }
      
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error fetching Data:', error)
    isLoading.value = false
  }
}

// watch for changes in the search term
let delaySearch = null
watch(searchTerm, (newValue) => {
  if (delaySearch) {
    clearTimeout(delaySearch)
  }
  delaySearch = setTimeout(() => {
    getInventoryRecord(1)
    // Call the function or perform actions that should happen after the delay
  }, 1500) // Adjust the delay time in milliseconds as needed
})

onMounted(() => {
  getInventoryRecord()
})
</script>

<template>
  <div class="flex justify-end items-center w-full p-4 mt-2.5">
    <div class="relative w-64 -ml-3">
      <IconSearch
        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
      />
      <input
        type="text"
        placeholder="Search...."
        v-model="searchTerm"
        class="w-full pl-10 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-mainColor"
      />
    </div>
  </div>
  <div class="w-full overflow-hidden rounded-lg">
    <InventoryRecordTable v-if="!isLoading && inventory" :inventoryData="inventory.data" />

    <div v-else-if="isLoading" class="h-24 flex justify-center items-center bg-white">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
      ></div>
    </div>

    <!-- Updated Paginator implementation -->
    <PropPaginator
      v-if="inventory && !isLoading"
      :pagination="inventory"
      :show-info="true"
      @page-changed="getInventoryRecord"
      :limit="2"
      :keepLength="false"
    />
  </div>
</template>
