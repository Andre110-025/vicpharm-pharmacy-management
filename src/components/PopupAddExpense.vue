<script setup>
import { VueFinalModal } from 'vue-final-modal'
// import DynamicInput from './DynamicInput.vue'
import IconCancel from './IconCancel.vue'
import IconAddExpense from './IconAddExpense.vue'
import { ref, reactive, computed, onMounted } from 'vue'
import DynamicInput from './DynamicInput.vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useRouter } from 'vue-router'
import { useHelpers } from '@/helper'
import { useUserStore } from '@/stores/user'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import { db } from '@/db'

const emit = defineEmits(['confirm'])
const { user } = useUserStore()
const loading = ref(false)

const expenseData = reactive({
  user_type: user.userType,
  title: '',
  amount: '',
  note: '',
  date: '',
  branch_id: user.branchId,
  account_id: user.account,
})

const rules = computed(() => ({
  title: { required },
  amount: { required },
  note: { required },
  date: { required },
}))

const v$ = useVuelidate(rules, expenseData)

// const handleExpenses = async () => {
//   const isFormValid = await v$.value.$validate()
//   if (!isFormValid) return

//   try {
//     loading.value = true

//     const response = await axios.post('/expenses', expenseData)

//     if (response.status !== 201) {
//       throw new Error('Add Expense failed')
//     }

//     toast.success('Expense Added Successfully', {
//       position: toast.POSITION.TOP_CENTER,
//     })

//     emit('confirm')
//   } catch (error) {
//     console.error('Error adding expense:', error)

//     toast.error('Error adding expense', {
//       position: toast.POSITION.TOP_CENTER,
//     })
//   } finally {
//     loading.value = false
//   }
// }

const handleExpenses = async () => {
  const isFormValid = await v$.value.$validate()
  if (!isFormValid) return

  try {
    loading.value = true

    // 🔌 OFFLINE MODE
    if (!navigator.onLine) {
      const offlineId = `temp-${Date.now()}`

      const payload = {
        ...expenseData,
      }

      const finalData = {
        ...payload,
        id: offlineId,
        syncStatus: 'pending',
      }

      // 1️⃣ Save locally so table updates immediately
      await db.expenseTable.put(finalData)

      // 2️⃣ Queue for sync
      await db.syncQueue.add({
        endpoint: '/expenses',
        method: 'POST',
        payload,
        type: 'ADD_EXPENSE',
        timestamp: Date.now(),
      })

      toast.info('Expense saved offline. Will sync when online.', {
        position: toast.POSITION.TOP_CENTER,
      })

      emit('confirm')
      return
    }

    // 🌍 ONLINE MODE
    const response = await axios.post('/expenses', expenseData)

    if (response.status !== 201) {
      throw new Error('Add Expense failed')
    }

    const serverId = response.data?.id || response.data?.data?.id || `temp-${Date.now()}`

    await db.expenseTable.put({
      ...expenseData,
      id: serverId,
      syncStatus: 'synced',
    })

    toast.success('Expense Added Successfully', {
      position: toast.POSITION.TOP_CENTER,
    })

    emit('confirm')
  } catch (error) {
    if (error?.isOfflineHandled) {
      // Offline was handled intentionally → no error toast
      return
    }
    console.error('Error adding expense:', error)
    toast.error('Error adding expense', {
      position: toast.POSITION.TOP_CENTER,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-[550px] max-w-[520px] rounded-2xl shadow-lg"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="true"
  >
    <div class="flex flex-row justify-between items-center p-5">
      <div class="flex flex-row items-center gap-3">
        <div class="w-10 h-10 bg-[rgba(5,113,108,0.1)] rounded-md flex items-center justify-center">
          <IconAddExpense class="w-8 h-8" />
        </div>
        <div class="flex flex-col">
          <h2 class="text-lg font-semibold">Add Expense</h2>
          <p class="text-gray-600">Record and track business expenses accurately.</p>
        </div>
      </div>
      <button
        @click="emit('confirm')"
        type="button"
        class="border border-black rounded p-1 flex items-center justify-center"
      >
        <IconCancel color="black" class="w-5 h-5" />
      </button>
    </div>

    <form @submit.prevent="handleExpenses" class="px-5">
      <DynamicInput
        label="Title"
        type="text"
        placeholder="Enter Title of expense"
        v-model="expenseData.title"
      />
      <DynamicInput
        label="Amount"
        type="number"
        placeholder="Enter amount of expense"
        v-model="expenseData.amount"
      />

      <label class="block text-sm font-medium text-gray-700 mb-1"> Note </label>
      <textarea
        v-model="expenseData.note"
        placeholder="Enter description of expense"
        rows="4"
        class="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-mainColor resize-none"
      />

      <DynamicInput
        label="Date"
        type="date"
        placeholder="Enter date of expense"
        v-model="expenseData.date"
      />

      <button
        :disabled="loading || v$.$invalid"
        class="w-full mainBtn transition duration-300"
        type="submit"
      >
        Submit
      </button>
    </form>
  </VueFinalModal>
</template>