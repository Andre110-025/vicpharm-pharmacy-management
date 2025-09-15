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

const getSalesReturnList = async (page = 1) => {
  try {
    isLoading.value = true
    saleReturns.value = null

    const response = await axios.post(`returnslist?page=${page}`, filterData)

    if (response.status === 201) {
      saleReturns.value = response.data.Returns
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error fetching metrics:', error)
    // Handle error state
    isLoading.value = false
  }
}

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
