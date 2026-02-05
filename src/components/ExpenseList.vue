<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import SearchBar from './SearchBar.vue'
import PopupAddExpense from './PopupAddExpense.vue'
import { useModal } from 'vue-final-modal'
import PropFilter from './PropFilter.vue'
import PropButtonIcon from './PropButtonIcon.vue'
import IconPlus from '@/components/IconPlus.vue'
import IconSearch from './IconSearch.vue'
import ExpenseTable from './ExpenseTable.vue'
import { toZonedTime } from 'date-fns-tz'
import { useHelpers } from '@/helper'
import IconFilter from './IconFilter.vue'
import { db } from '@/db'

const { formatDate } = useHelpers()
const isLoading = ref(false)
const expense = ref([])
const { user } = useUserStore()
const searchTerm = ref('')
const WAT_TIMEZONE = 'Africa/Lagos'
const getTodayWAT = () => {
  const now = new Date()
  return toZonedTime(now, WAT_TIMEZONE)
}
const incomeFilter = reactive({
  start: '01/01/2025',
  end: formatDate(getTodayWAT()),
})

let searchTimeout = null

const expenseData = reactive({
  user_type: user.userType,
  branch_id: user.branchId,
})

const showIncomeFilter = ref(false)

// const getExpense = async () => {
//   try {
//     isLoading.value = true

//     const response = await axios.post('expenseslist', {
//       user_type: user.userType,
//       branch_id: user.branchId,
//       search: searchTerm.value,
//       start: incomeFilter.start,
//       end: incomeFilter.end,
//     })

//     expense.value = response.data?.Expenses || []
//   } catch (error) {
//     console.error('Error fetching expense:', error)

//     toast.error('Failed to fetch expenses', {
//       position: toast.POSITION.TOP_CENTER,
//     })
//   } finally {
//     isLoading.value = false
//   }
// } 

const getExpense = async () => {
  try {
    isLoading.value = true

    const response = await axios.post('expenseslist', {
      user_type: user.userType,
      branch_id: user.branchId,
      search: searchTerm.value,
      start: incomeFilter.start,
      end: incomeFilter.end,
    })

    expense.value = response.data.Expenses || []

    // Cache for offline
    if (expense.value.length) {
      await db.expenseTable.bulkPut(JSON.parse(JSON.stringify(expense.value)))
    }
  } catch (error) {
    const isOffline = error.isViewOnly || error.isOfflineHandled || !navigator.onLine

    if (isOffline) {
      console.log('Offline mode: loading local data')
      let localData = await db.expenseTable.toArray()
      localData.sort((a, b) => (a.syncStatus === 'pending' ? -1 : 1))

      if (searchTerm.value) {
        const searchLower = searchTerm.value.toLowerCase()
        localData = localData.filter(
          (c) =>
            c.title?.toLowerCase().includes(searchLower) ||
            c.note?.toLowerCase().includes(searchLower) ||
            c.amount?.toString().includes(searchTerm.value),
        )
      }

      // Keep it as a plain array
      expense.value = localData
      isLoading.value = false
      return
    }

    console.error('Error fetching expense:', error)
  } finally {
    isLoading.value = false
  }
}

const updateDate = (date) => {
  incomeFilter.start = date.start
  incomeFilter.end = date.end
  getExpense()
}

watch(searchTerm, (newVal) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    getExpense()
  }, 1500)
})

function openPopup() {
  const { open, close } = useModal({
    component: PopupAddExpense,
    attrs: {
      onConfirm() {
        close()
        getExpense()
      },
    },
  })

  open()
}

onMounted(() => {
  getExpense()
})
</script>

<template>
  <div class="hidden min-[451px]:block">
    <div class="flex justify-between items-center w-full p-4 mt-2.5">
      <SearchBar v-model="searchTerm" />

      <div class="flex space-x-1 gap-1 justify-end w-auto">
        <PropButtonIcon
          :icon-component="IconPlus"
          text="Add Expense"
          class="bg-mainColor text-white"
          @click="openPopup"
        />
        <PropButtonIcon
          class="border-gray-400 text-black hover:bg-gray-100 transition"
          :icon-component="IconFilter"
          text="Filter Date"
          @click="showIncomeFilter = true"
        />
      </div>
    </div>

    <div class="relative">
      <PropFilter
        :dateFilter="incomeFilter"
        v-model:showFilter="showIncomeFilter"
        @changeDate="updateDate"
      />
    </div>
  </div>

  <div class="block max-[450px]:block min-[451px]:hidden">
    <div class="flex flex-col items-center w-full p-4 gap-3">
      <div class="w-full">
        <div class="relative w-full">
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

      <div class="flex gap-2 justify-center w-full">
        <PropButtonIcon
          :icon-component="IconPlus"
          text="Add Expense"
          class="bg-mainColor text-white"
          @click="openPopup"
        />
        <PropButtonIcon
          class="border-gray-400 text-black hover:bg-gray-100 transition"
          :icon-component="IconFilter"
          text="Filter Date"
          @click="showIncomeFilter = true"
        />
      </div>
    </div>

    <div class="relative mt-2">
      <PropFilter
        :dateFilter="incomeFilter"
        v-model:showFilter="showIncomeFilter"
        @changeDate="updateDate"
      />
    </div>
  </div>

  <div class="w-full overflow-hidden rounded-lg mt-4">
    <ExpenseTable v-if="!isLoading && expense.length" @refresh="getExpense()" :expenses="expense" />

    <div v-else-if="isLoading" class="h-24 flex justify-center items-center bg-white">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
      ></div>
    </div>

    <div v-else class="h-24 flex justify-center items-center text-gray-500 text-sm bg-white">
      No result found for this action.
    </div>
  </div>

  <div class="w-full overflow-hidden rounded-lg shadow bg-white mt-3"></div>
</template>
