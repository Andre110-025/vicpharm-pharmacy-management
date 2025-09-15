<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import PropPaginator from './PropPaginator.vue'
import axios from 'axios'
import SearchBar from './SearchBar.vue'
import PopupMakeSale from './PopupMakeSale.vue'
import IconPlus from './IconPlus.vue'
import IconFilter from './IconFilter.vue'
import PropFilter from './PropFilter.vue'
import SaleCreditTable from './SaleCreditTable.vue'
import { useUserStore } from '@/stores/user'
import PropButtonIcon from './PropButtonIcon.vue'
import { useModal } from 'vue-final-modal'

const { user, privileges } = useUserStore()

const isLoading = ref(false)
const searchTerm = ref('')
const showFilter = ref(false)

const sales = ref(null)

const dataFilter = reactive({
  start: '',
  end: '',
  status: '',
})

const getSalesList = async (page = 1) => {
  try {
    isLoading.value = true
    sales.value = null

    const response = await axios.post(
      `searchtransactionsByOwner/${user.userType}?branch_id=${user.branchId}&search=${searchTerm.value}&status=${dataFilter.status}&start=${dataFilter.start}&end=${dataFilter.end}&credit_status=credit&page=${page}`,
    )

    if (response.data.success) {
      sales.value = response.data.transactions
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error fetching metrics:', error)
    // Handle error state
    isLoading.value = false
  }
}

const updateDate = (date) => {
  dataFilter.start = date.start
  dataFilter.end = date.end
  dataFilter.status = date.status
  console.log('date', date)
  getSalesList()
}

// watch for changes in the search term
let delaySearch = null
watch(searchTerm, (newValue) => {
  if (delaySearch) {
    clearTimeout(delaySearch)
  }
  delaySearch = setTimeout(() => {
    getSalesList(1)
    // Call the function or perform actions that should happen after the delay
  }, 1500) // Adjust the delay time in milliseconds as needed
})

const { open: openMakeSale, close: closeMakeSale } = useModal({
  component: PopupMakeSale,
  attrs: {
    // edit: true,
    onConfirm(bool) {
      if (bool) {
        getSalesList()
      }
      closeMakeSale()
    },
  },
})

onMounted(() => {
  getSalesList()
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
          text="Make a Sale"
          class="bg-mainColor text-white"
          @click="openMakeSale()"
          v-if="privileges.can_make_sales && false"
        />

        <PropButtonIcon
          class="border-gray-400 text-black hover:bg-gray-100 transition"
          :icon-component="IconFilter"
          text="Filter"
          @click="showFilter = true"
        />
        <PropButtonIcon
          class="border-gray-400 text-black hover:bg-gray-100 transition"
          :icon-component="IconExport"
          text="Export"
          v-if="false"
        />
      </div>
    </div>
    <!-- Filter Popup -->
    <div class="relative">
      <PropFilter
        :dateFilter="dataFilter"
        v-model:showFilter="showFilter"
        :show-status="false"
        @changeDate="updateDate"
      />
    </div>
    <div class="w-full overflow-hidden rounded-lg">
      <SaleCreditTable v-if="!isLoading && sales" :sales="sales.data" />

      <div v-else-if="isLoading" class="h-24 flex justify-center items-center bg-white">
        <div
          class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
        ></div>
      </div>

      <!-- Updated Paginator implementation -->
      <PropPaginator
        v-if="sales && !isLoading"
        :pagination="sales"
        :show-info="true"
        @page-changed="getSalesList"
        :limit="2"
        :keepLength="false"
      />
    </div>
    <div class="w-full overflow-hidden rounded-lg shadow bg-white mt-3"></div>
  </div>
</template>
