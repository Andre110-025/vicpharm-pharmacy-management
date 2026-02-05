<script setup>
import { VueFinalModal } from 'vue-final-modal'
import { ref, reactive, computed } from 'vue'
import IconCancel from './IconCancel.vue'
import IconAddExpense from './IconAddExpense.vue'
import DynamicInput from './DynamicInput.vue'
import { useVuelidate } from '@vuelidate/core'
import { required } from '@vuelidate/validators'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useUserStore } from '@/stores/user'

const { user } = useUserStore()
const emit = defineEmits(['confirm'])
const loading = ref(false)
const props = defineProps({
  expense: Object,
})

const expenseData = reactive({ ...props.expense })

const rules = computed(() => ({
  title: { required },
  amount: { required },
  note: { required },
  date: { required },
}))

const v$ = useVuelidate(rules, expenseData)

const handleEditExpenses = async () => {
  const isValid = await v$.value.$validate()
  if (!isValid) return

  try {
    loading.value = true
    const response = await axios.post('editexpenses', {
      ...expenseData,
      id: expenseData.id,
      user_type: user.userType
    })

    console.log(response)
    toast.success('Expense edited successfully')
    emit('confirm')
  } catch (err) {
    toast.error('Failed to update expense')
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
          <h2 class="text-lg font-semibold">Edit Expense</h2>
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

    <form @submit.prevent="handleEditExpenses" class="px-5">
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
