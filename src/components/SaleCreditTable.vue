<script setup>
import { ref } from 'vue'
import { useHelpers } from '@/helper'
import IconEye from './IconEye.vue'
import IconComplete from './IconComplete.vue'
import { useModal } from 'vue-final-modal'
import PopupSalesDetails from './PopupSalesDetails.vue'
import PopUpCompleteSale from './PopUpCompleteSale.vue'
import { useUserStore } from '@/stores/user'

const { privileges } = useUserStore()

const { formatDateTime, formatTime } = useHelpers()

const emit = defineEmits(['refresh'])

const props = defineProps({
  sales: {
    type: Array,
    default: () => [],
  },
})

const handleViewDetails = (item) => {
  const { open, close } = useModal({
    component: PopupSalesDetails,
    attrs: {
      sales: item,
      onConfirm(bool) {
        if (bool) {
          emit('refresh')
        }
        close()
      },
    },
  })

  open()
  closeDropdown()
}

const handleComplete = (item) => {
  // Implement complete functionality here
  // console.log('Complete sale:', item)

  const { open, close } = useModal({
    component: PopUpCompleteSale,
    attrs: {
      sales: item,
      onConfirm(bool) {
        if (bool) {
          emit('refresh')
        }
        close()
      },
    },
  })

  open()
}
</script>

<template>
  <div class="block min-[451px]:hidden space-y-4">
    <div
      v-for="(item, index) in sales"
      :key="index"
      class="bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.99] transition"
    >
      <div class="p-4 border-b border-gray-100 flex justify-between items-start">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Customer Name</p>
          <p class="text-base font-semibold text-gray-900" v-text="item.customer"></p>
        </div>

        <div class="flex gap-2">
          <button
            @click.stop="handleViewDetails(item)"
            class="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
            title="View Sale Details"
          >
            <IconEye class="w-5 h-5 text-gray-600" />
          </button>

          <button
            v-if="
              privileges.can_complete_sales_orders &&
              ['pending', 'unpaid', 'partially paid'].includes(item.payment_status.toLowerCase())
            "
            @click.stop="handleComplete(item)"
            class="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
            title="Complete Sale"
          >
            <IconComplete class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-x-4 gap-y-4 p-4 text-sm">
        <div class="flex flex-col">
          <span class="text-gray-500">Phone Number</span>
          <span class="font-medium text-gray-900" v-text="item.customer_number"></span>
        </div>

        <div class="flex flex-col text-right">
          <span class="text-gray-500">Balance Due</span>
          <span
            class="font-medium text-green-600"
            v-text="
              (item.total_amount - item.amount_paid).toLocaleString('en-NG', {
                style: 'currency',
                currency: 'NGN',
              })
            "
          ></span>
        </div>

        <div class="flex flex-col">
          <span class="text-gray-500">Sale Date & Time</span>
          <span class="font-medium text-gray-900">
            {{ formatDateTime(item.created_at) }} | {{ formatTime(item.created_at) }}
          </span>
        </div>

        <div class="flex flex-col text-right">
          <span class="text-gray-500">Payment Due Date</span>
          <span
            class="font-medium text-gray-900"
            v-text="item.due_date ? formatDateTime(item.due_date) : 'No Due Date'"
          ></span>
        </div>
      </div>

      <div v-if="!sales.length" class="text-center py-10 text-sm text-gray-500">
        No Credit sales record found.
      </div>
    </div>
  </div>
  <div class="hidden min-[451px]:block w-full overflow-x-auto" @click="closeDropdown">
    <table class="w-full border-collapse bg-white">
      <thead class="bg-gray-50">
        <tr>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Customer Name
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Phone Number
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Sale Date & Time
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
            v-if="false"
          >
            Total Amount
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Balance Due
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Payment Due Date
          </th>
          <th class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
            Action
          </th>
        </tr>
      </thead>

      <tbody class="divide-y-8 divide-[#FAFAFA]">
        <tr class="rounded-3xl" v-for="(item, index) in sales" :key="index">
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.customer"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.customer_number"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit">
                  {{ formatDateTime(item.created_at) }} | {{ formatTime(item.created_at) }}
                </p>
              </div>
            </div>
          </td>
          <td v-if="false" class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p
              class="h-fit text-end"
              v-text="
                item.total_amount.toLocaleString('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                })
              "
            ></p>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p
              class="h-fit text-end"
              v-text="
                (item.total_amount - item.amount_paid).toLocaleString('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                })
              "
            ></p>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p
              class="h-fit text-center"
              v-text="item.due_date ? formatDateTime(item.due_date) : 'No Due Date'"
            ></p>
          </td>
          <td>
            <div class="relative flex gap-2.5 justify-center items-center">
              <button
                @click.stop="handleViewDetails(item)"
                class="p-1 rounded-md hover:bg-gray-100"
                title="View Sale Details"
              >
                <IconEye class="w-5 h-5" />
              </button>
              <button
                :disabled="
                  item.payment_status.toLowerCase() === 'paid' ||
                  item.payment_status.toLowerCase() === 'refunded' ||
                  item.payment_status.toLowerCase() === 'returned'
                "
                v-if="privileges.can_complete_sales_orders"
                @click.stop="handleComplete(item)"
                class="p-1 rounded-md hover:bg-gray-100"
                title="Complete Sale"
              >
                <IconComplete class="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="!sales.length">
          <td colspan="5" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
            No Credit sales Record found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
