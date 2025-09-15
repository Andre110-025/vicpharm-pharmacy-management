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
  <div class="w-full overflow-x-auto">
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
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
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
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
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
