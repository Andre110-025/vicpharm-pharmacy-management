<script setup>
import { VueFinalModal } from 'vue-final-modal'
import IconCancel from './IconCancel.vue'
import { useHelpers } from '@/helper'

const { formatTime, formatDateTime } = useHelpers()

const emit = defineEmits(['confirm'])

const props = defineProps({
  inventoryRecord: {
    type: Object,
  },
})

const formatExpiryDate = (inputdate) => {
  const date = new Date(inputdate)

  // Extract and format the date parts
  const day = String(date.getDate()).padStart(2, '0') // 29
  const month = String(date.getMonth() + 1).padStart(2, '0') // 05
  const year = String(date.getFullYear()).slice(-2) // 25

  const formatted = `${day}/${month}/${year}`
  return formatted
}
</script>

<template>
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-[550px] max-w-[500px] rounded-2xl shadow-lg"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="true"
  >
    <div class="flex flex-col p-4">
      <div class="flex flex-row justify-between items-center border-b border-gray-300 pb-4">
        <h2 class="text-lg font-semibold">Inventory Details</h2>
        <button
          @click="emit('confirm')"
          type="button"
          class="border border-black rounded p-1 flex items-center justify-center"
        >
          <IconCancel color="black" class="w-5 h-5" />
        </button>
      </div>
      <div
        class="flex flex-col p-4 h-[460px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
      >
        <div class="flex flex-row justify-between items-center border-b border-gray-300 pb-2">
          <h6>Product</h6>
          <h6 v-text="inventoryRecord.product" class="text-mainColor"></h6>
        </div>
        <div
          class="mt-2.5 flex flex-row justify-between items-center border-b border-gray-300 pb-2"
        >
          <h6>Category</h6>
          <h6 v-text="inventoryRecord.category" class="text-mainColor"></h6>
        </div>
        <div
          class="mt-2.5 flex flex-row justify-between items-center border-b border-gray-300 pb-2"
        >
          <h6>Type of Inventory</h6>
          <h6 class="text-mainColor" v-text="inventoryRecord.type_of_inventory"></h6>
        </div>
        <div class="mt-2.5 flex flex-row justify-between items-center">
          <h6>Expiry Date</h6>
          <h6 class="text-mainColor" v-text="formatExpiryDate(inventoryRecord.expiry_date)"></h6>
        </div>
        <div class="mt-9 flex flex-row justify-between items-center border-b border-gray-300 pb-2">
          <h6>Unit</h6>
          <h6 class="text-mainColor" v-text="inventoryRecord.unit"></h6>
        </div>
        <div
          class="mt-2.5 flex flex-row justify-between items-center border-b border-gray-300 pb-2"
        >
          <h6>Added Quantity</h6>
          <h6 class="text-mainColor" v-text="inventoryRecord.added_quantity"></h6>
        </div>
        <div
          class="mt-2.5 flex flex-row justify-between items-center border-b border-gray-300 pb-2"
        >
          <h6>Total Quantity</h6>
          <h6 class="text-mainColor" v-text="inventoryRecord.total_quantity"></h6>
        </div>
        <!-- <div
          class="mt-2.5 flex flex-row justify-between items-center border-b border-gray-300 pb-2"
        >
          <h6>Re-order Quantity</h6>
          <h6 class="text-mainColor">2</h6>
        </div> -->
        <div
          class="mt-2.5 flex flex-row justify-between items-center border-b border-gray-300 pb-2"
        >
          <h6>Cost Price</h6>
          <h6 class="text-mainColor" v-text="inventoryRecord.cost_price"></h6>
        </div>
        <div class="mt-2.5 flex flex-row justify-between items-center">
          <h6>Wholesale Price</h6>
          <h6 class="text-mainColor" v-text="inventoryRecord.wholesale_price"></h6>
        </div>
        <div class="mt-9 flex flex-row justify-between items-center border-b border-gray-300 pb-2">
          <h6>Retail Price</h6>
          <h6 class="text-mainColor" v-text="inventoryRecord.retail_price"></h6>
        </div>
        <div
          class="mt-2.5 flex flex-row justify-between items-center border-b border-gray-300 pb-2"
        >
          <h6>Inventory Status</h6>
          <h6 class="text-mainColor" v-text="inventoryRecord.inventory_status"></h6>
        </div>
        <div
          class="mt-2.5 flex flex-row justify-between items-center border-b border-gray-300 pb-2"
        >
          <h6>Staff</h6>
          <h6 class="text-mainColor" v-text="inventoryRecord.staff"></h6>
        </div>
        <div
          class="mt-2.5 flex flex-row justify-between items-center border-b border-gray-300 pb-2"
        >
          <h6>Date of Inventory</h6>
          <h6 class="text-mainColor">
            {{ formatDateTime(inventoryRecord.created_at) }} |
            {{ formatTime(inventoryRecord.created_at) }}
          </h6>
        </div>
      </div>
    </div>
  </VueFinalModal>
</template>
