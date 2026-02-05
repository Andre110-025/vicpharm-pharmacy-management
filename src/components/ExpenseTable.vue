<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useUserStore } from '@/stores/user'
import { useModal } from 'vue-final-modal'
import IconNotePad from './IconNotePad.vue'
import IconDelete from './IconDelete.vue'
// import { useModal } from 'vue-final-modal'
import PopupConfirmDelete from './PopupConfirmDelete.vue'
import PopupEditExpense from './PopupEditExpense.vue'

const isLoading = ref(false)
const expense = ref([])
const { user, privileges } = useUserStore()
const emit = defineEmits(['refresh', 'updateTotal'])

const props = defineProps({
  expenses: {
    type: Array,
    default: () => [],
  },
})

const totalExpense = computed(() => {
  return props.expenses.reduce((sum, item) => {
    const amount = Number(item.amount) || 0
    return sum + amount
  }, 0)
})

watch(
  totalExpense,
  (newTotal) => {
    emit('updateTotal', newTotal)
  },
  { immediate: true }
)

const openDeleteUser = (id) => {
  const { open, close } = useModal({
    component: PopupConfirmDelete,
    attrs: {
      expenseId: id,
      onConfirm(expenseId) {
        handleDelete(expenseId)
        close()
      },
      onClose() {
        close() 
      },
    },
  })

  open()
}

const openEditExpense = (expense) => {
  const { open, close } = useModal({
    component: PopupEditExpense,
    attrs: {
      expense,
      onConfirm() {
        close()
        emit('refresh')
      },
    },
  })

  open()
}

const handleDelete = async (id) => {
  try {
    isLoading.value = true

    const response = await axios.post('expensesdel', {
      user_type: user.userType,
      id,
    })
    console.log(response)
    // console.log('Deleting expense with ID:', id)

    toast.success('Expense deleted successfully')

    emit('refresh')
  } catch (err) {
    toast.error('Failed to delete expense')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="block min-[451px]:hidden space-y-4 mt-6">
    <div
      v-for="(item, index) in props.expenses"
      :key="item.id"
      class="bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.99] transition"
    >
      <div class="p-4 border-b border-gray-100 flex justify-between items-start">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Title</p>
          <p class="text-base font-semibold text-gray-900" v-text="item.title"></p>
        </div>

        <div class="flex gap-2">
          <button
            v-if="privileges.can_manage_expenses"
            class="p-1 rounded-md hover:bg-gray-100"
            title="Edit Details"
            @click="openEditExpense(item)"
          >
            <IconNotePad class="w-6 h-6" />
          </button>

          <button
            class="p-1 rounded-md hover:bg-gray-100"
            title="Delete User"
            @click="openDeleteUser(item.id)"
          >
            <IconDelete class="w-6 h-6" />
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5 p-4 text-sm">
        <div class="flex flex-col">
          <span class="text-gray-500">Amount</span>
          <span class="font-medium text-gray-900" v-text="
              item.amount.toLocaleString('en-NG', {
                style: 'currency',
                currency: 'NGN',
              }) || '₦0.00'
            "></span>
        </div>

        <div class="flex flex-col">
          <span class="text-gray-500">Note</span>
          <span class="font-medium text-gray-900 break-words" v-text="item.note"></span>
        </div>

        <div class="flex flex-col">
          <span class="text-gray-500">Date</span>
          <span class="font-medium text-gray-900" v-text="item.date"></span>
        </div>
      </div>
    </div>

    <div v-if="!props.expenses.length" class="text-center py-10 text-sm text-gray-500">
      No Expense found.
    </div>
  </div>

  <div class="hidden min-[451px]:block w-full overflow-x-auto">
    <table class="w-full border-collapse bg-white">
      <thead class="bg-gray-50">
        <tr>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Title
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Amount
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Description
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Date
          </th>
          <th class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
            Action
          </th>
        </tr>
      </thead>

      <tbody class="divide-y-8 divide-[#FAFAFA]">
        <tr class="rounded-3xl" v-for="(item, index) in props.expenses" :key="item.id">
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.title"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <!-- <p class="h-fit" v-text="item.amount"></p> -->
                <p
                  class="h-fit text-end"
                  v-text="
                    item.amount.toLocaleString('en-NG', {
                      style: 'currency',
                      currency: 'NGN',
                    }) || '₦0.00'
                  "
                ></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="max-w-[280px] truncate" v-text="item.note"></p>
              </div>
            </div>
          </td>

          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.date"></p>
              </div>
            </div>
          </td>
          <td>
            <div class="flex space-x-2 justify-center relative">
              <button
                class="p-1 rounded-md hover:bg-gray-100"
                title="Edit Details"
                @click="openEditExpense(item)"
                v-if="privileges.can_manage_expenses"
              >
                <IconNotePad class="w-6 h-6" />
              </button>
              <button
                class="p-1 rounded-md hover:bg-gray-100"
                title="Delete User"
                @click="openDeleteUser(item.id)"
              >
                <IconDelete class="w-6 h-6" />
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="!props.expenses.length">
          <td colspan="6" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
            No Expense found.
          </td>
        </tr>
      </tbody>

      <!-- <Overview :total-expense="totalExpense" /> -->
    </table>
  </div>
</template>