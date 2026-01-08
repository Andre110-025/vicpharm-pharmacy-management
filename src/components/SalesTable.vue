<script setup>
import { ref } from 'vue'
import IconEye from './IconEye.vue'
import IconComplete from './IconComplete.vue'
import { useModal } from 'vue-final-modal'
import { useHelpers } from '@/helper'
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

// Track which dropdown is currently open
const openDropdownId = ref(null)

// Toggle dropdown visibility
const toggleDropdown = (saleId) => {
  if (openDropdownId.value === saleId) {
    openDropdownId.value = null // Close if already open
  } else {
    openDropdownId.value = saleId // Open this dropdown, close others
  }
}

// Close dropdown when clicking outside
const closeDropdown = () => {
  openDropdownId.value = null
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
          <p class="text-xs text-gray-500 uppercase tracking-wide mt-2">Customer Name</p>
          <p class="text-sm font-medium text-gray-900" v-text="item.customer"></p>
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
            v-if="privileges.can_complete_sales_orders && ['pending', 'unpaid', 'partially paid'].includes(item.payment_status.toLowerCase())"
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
          <span class="text-gray-500">Total Amount</span>
          <span class="font-medium text-green-600" v-text="item.total_amount.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })"></span>
        </div>

        <div class="flex flex-col">
          <span class="text-gray-500">Amount Paid</span>
          <span class="font-medium text-green-600" v-text="item.amount_paid.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })"></span>
        </div>

        <div class="flex flex-col text-right">
          <span class="text-gray-500">Balance Due</span>
          <span class="font-medium text-green-600" v-text="(item.total_amount - item.amount_paid).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })"></span>
        </div>

        <div class="flex flex-col">
          <span class="text-gray-500">Payment Mode</span>
          <span class="font-medium text-gray-900" v-text="item.payment_mode"></span>
        </div>

         <div class="flex flex-col items-end">
          <span class="text-gray-500">Status</span>
          <span
            :class="{
              'bg-green-100 text-green-900': item.payment_status.toLowerCase() === 'paid',
              'bg-orange-100 text-orange-900': ['pending', 'unpaid'].includes(
                item.payment_status.toLowerCase(),
              ),
              'bg-yellow-100 text-yellow-900':
                item.payment_status.toLowerCase() === 'partially paid',
              'bg-red-100 text-red-900': item.payment_status.toLowerCase() === 'declined',
              'bg-red-100 text-red-500': ['refunded', 'returned'].includes(
                item.payment_status.toLowerCase(),
              ),
            }"
            class="inline-flex w-fit items-center rounded-md px-2 py-[1px] text-[.65em] capitalize"
          >
            {{ item.payment_status.toLowerCase() }}
          </span>
        </div>

        <div class="flex flex-col col-span-2">
          <span class="text-gray-500">Date & Time</span>
          <span class="font-medium text-gray-900">
            {{ formatDateTime(item.created_at) }} | {{ formatTime(item.created_at) }}
          </span>
        </div>
      </div>

      <div v-if="!sales.length" class="text-center py-10 text-sm text-gray-500">
        No sales record found.
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
            Order ID
          </th>
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
            Total Amount
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Amount Paid
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
            Payment Mode
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Status
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Date & Time
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
                <p class="h-fit" v-text="item.order_code"></p>
              </div>
            </div>
          </td>
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
                item.amount_paid.toLocaleString('en-NG', {
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
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.payment_mode"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <p
                :class="{
                  'bg-green-100 text-green-900': item.payment_status.toLowerCase() === 'paid',
                  'bg-orange-100 text-orange-900':
                    item.payment_status.toLowerCase() === 'pending' ||
                    item.payment_status.toLowerCase() === 'unpaid',
                  'bg-yellow-100 text-yellow-900':
                    item.payment_status.toLowerCase() === 'partially paid',
                  'bg-red-100 text-red-900': item.payment_status.toLowerCase() === 'declined',
                  'bg-red-100 text-red-500':
                    item.payment_status.toLowerCase() === 'refunded' ||
                    item.payment_status.toLowerCase() === 'returned',
                }"
                class="rounded-md py-[1px] px-2 text-[.65em] capitalize"
              >
                {{ item.payment_status.toLowerCase() }}
              </p>
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

              <!-- Dropdown Menu -->
              <div
                v-if="openDropdownId === item.id"
                class="absolute right-0 top-8 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200"
                @click.stop
              >
                <button
                  @click="handleViewDetails(item)"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  View Sale Details
                </button>
                <button
                  @click="handleComplete(item)"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-gray-700"
                  v-if="
                    (item.payment_status.toLowerCase() === 'pending' ||
                      item.payment_status.toLowerCase() === 'unpaid' ||
                      item.payment_status.toLowerCase() === 'partially paid') &&
                    privileges.can_complete_sales_orders
                  "
                >
                  Complete Sale
                </button>
              </div>
            </div>
          </td>
        </tr>
        <tr v-if="!sales.length">
          <td colspan="10" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
            No sales Record found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
