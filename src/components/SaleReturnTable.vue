<script setup>
import IconVThreeDot from './IconVThreeDot.vue'
import IconNotePad from './IconNotePad.vue'
import IconEye from './IconEye.vue'
import { useModal } from 'vue-final-modal'
import { useHelpers } from '@/helper'
import { useUserStore } from '@/stores/user'
import PopUpViewReturnNote from './PopUpViewReturnNote.vue'

const { user } = useUserStore()

const { formatDateTime, formatTime } = useHelpers()

const emit = defineEmits(['refresh'])

const props = defineProps({
  sales: {
    type: Array,
    default: () => [],
  },
})

const openReturnNote = (str) => {
  const { open, close } = useModal({
    component: PopUpViewReturnNote,
    attrs: {
      note: str,
      onConfirm() {
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
          <p class="text-base font-semibold text-gray-900" v-text="item.customer_name"></p>
        </div>

        <button
          @click="openReturnNote(item.note)"
          class="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
          title="View Note"
        >
          <IconEye class="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div class="grid grid-cols-2 gap-x-4 gap-y-4 p-4 text-sm">
        <div class="flex flex-col">
          <span class="text-gray-500">Email</span>
          <span class="font-medium text-gray-900 truncate" v-text="item.customer_email"></span>
        </div>
        <div class="flex flex-col text-right">
          <span class="text-gray-500">Product Name</span>
          <span class="font-medium text-gray-900 truncate" v-text="item.product_name"></span>
        </div>

        <div class="flex flex-col">
          <span class="text-gray-500">Return Initiated By</span>
          <span class="font-medium text-gray-900 truncate" v-text="item.staff_name"></span>
        </div>
        <div class="flex flex-col text-right">
          <span class="text-gray-500">Total Amount</span>
          <span
            class="font-medium text-green-600"
            v-text="
              (item.subtotal || 0).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
            "
          ></span>
        </div>

        <div class="flex flex-col">
          <span class="text-gray-500">Return Type</span>
          <span
            :class="{
              'bg-green-100 text-green-900': item.return_type?.toLowerCase() === 'returnable',
              'bg-red-100 text-red-900': item.return_type?.toLowerCase() === 'nonreturnable',
              'bg-gray-100 text-gray-900': !item.return_type,
            }"
            class="rounded-md py-[1px] px-2 text-[.65em] capitalize w-fit mt-1"
          >
            {{ item.return_type?.toLowerCase() || 'unknown' }}
          </span>
        </div>
        <div class="flex flex-col text-right">
          <span class="text-gray-500">Date & Time</span>
          <span class="font-medium text-gray-900">
            {{ formatDateTime(item.created_at) }} | {{ formatTime(item.created_at) }}
          </span>
        </div>
      </div>

      <div v-if="!sales.length" class="text-center py-10 text-sm text-gray-500">
        No sales return found.
      </div>
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
            Email
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Return Initiated By
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Product Name
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
            Return Type
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Date & time
          </th>
          <th class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
            View Note
          </th>
        </tr>
      </thead>

      <tbody class="divide-y-8 divide-[#FAFAFA]">
        <tr class="rounded-3xl" v-for="(item, index) in sales" :key="index">
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.orders_id"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.customer_name"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.customer_email"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.staff_name"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.product_name"></p>
              </div>
            </div>
          </td>
          <!-- <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p
                  class="h-fit"
                  v-text="
                    item.subtotal.toLocaleString('en-NG', {
                      style: 'currency',
                      currency: 'NGN',
                    })
                  "
                ></p>
              </div>
            </div>
          </td> -->
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p
                  class="h-fit"
                  v-text="
                    (item.subtotal || 0).toLocaleString('en-NG', {
                      style: 'currency',
                      currency: 'NGN',
                    })
                  "
                ></p>
              </div>
            </div>
          </td>
          <!-- <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <p
                :class="{
                  'bg-green-100 text-green-900': item.return_type.toLowerCase() === 'returnable',
                  'bg-red-100 text-red-900': item.return_type.toLowerCase() === 'nonreturnable',
                }"
                class="rounded-md py-[1px] px-2 text-[.65em] capitalize"
              >
                {{ item.return_type.toLowerCase() }}
              </p>
            </div>
          </td> -->
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <p
                :class="{
                  'bg-green-100 text-green-900': item.return_type?.toLowerCase() === 'returnable',
                  'bg-red-100 text-red-900': item.return_type?.toLowerCase() === 'nonreturnable',
                  'bg-gray-100 text-gray-900': !item.return_type,
                }"
                class="rounded-md py-[1px] px-2 text-[.65em] capitalize"
              >
                {{ item.return_type?.toLowerCase() || 'unknown' }}
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
            <div class="flex space-x-2 justify-center">
              <button class="p-1 rounded-md hover:bg-gray-100" title="View Note">
                <IconEye @click="openReturnNote(item.note)" />
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="!sales.length">
          <td colspan="9" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
            No sales return found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
