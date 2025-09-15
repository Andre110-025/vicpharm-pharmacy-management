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
  <div class="w-full overflow-x-auto" @click="closeDropdown">
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
