<script setup>
import { VueFinalModal } from 'vue-final-modal'
import IconCancel from './IconCancel.vue'
import IconAlert from './IconAlert.vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const { notificationData, privileges } = useUserStore()

const router = useRouter()

const emits = defineEmits(['confirm'])

const handleViewLowStock = () => {
  router.push('/dashboard/Inventory?state=low stock')
  emits('confirm')
}

const handleViewExpiring = () => {
  router.push('/dashboard/Inventory?state=expiry')
  emits('confirm')
}

const handleViewCredit = () => {
  router.push('/dashboard/sales?type=creditSales')
  emits('confirm')
}
</script>

<template>
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-fit max-w-[500px] rounded-2xl flex flex-col shadow-lg overflow-hidden"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="true"
  >
    <div class="flex flex-row justify-between items-center p-5 border-b">
      <div class="flex flex-row items-center gap-3">
        <div
          class="w-10 h-10 bg-[rgba(175,53,133,0.1)] rounded-md flex items-center justify-center"
        >
          <IconAlert />
        </div>
        <div class="flex flex-col">
          <h2 class="text-lg font-semibold">Inventory Alert</h2>
          <p class="text-gray-600 text-sm">Attention needed for your inventory</p>
        </div>
      </div>
      <button
        @click="emits('confirm')"
        type="button"
        class="border border-black rounded p-1 flex items-center justify-center"
      >
        <IconCancel color="black" class="w-5 h-5" />
      </button>
    </div>

    <div class="p-6 space-y-4">
      <!-- Alert cards -->
      <div
        v-if="notificationData.low_stock > 0 && privileges.can_view_products"
        class="bg-orange-50 border border-orange-200 rounded-lg p-4"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-orange-800">Low Stock Alert</h3>
            <div class="mt-2 text-sm text-orange-700">
              <p>
                You have <span class="font-bold">{{ notificationData.low_stock }}</span> products
                with low stock levels.
              </p>
            </div>
            <div class="mt-3">
              <button
                @click="handleViewLowStock"
                class="text-sm font-medium text-orange-800 hover:text-orange-900 flex items-center"
              >
                View Low Stock Items
                <svg class="ml-1 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="notificationData.expiring > 0 && privileges.can_view_products"
        class="bg-red-50 border border-red-200 rounded-lg p-4"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Products Expiring Soon</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>
                You have <span class="font-bold">{{ notificationData.expiring }}</span> products
                that will expire soon.
              </p>
            </div>
            <div class="mt-3">
              <button
                @click="handleViewExpiring"
                class="text-sm font-medium text-red-800 hover:text-red-900 flex items-center"
              >
                View Expiring Products
                <svg class="ml-1 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="notificationData.due_payments > 0 && privileges.can_view_sales_records"
        class="bg-red-50 border border-red-200 rounded-lg p-4"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4z" />
              <path
                d="M6 8a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2V8zm4 3a1 1 0 100-2 1 1 0 000 2z"
              />
              <circle cx="15" cy="9" r="1" fill="currentColor" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Payments Due Soon</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>
                You have <span class="font-bold">{{ notificationData.due_payments }}</span> Payments
                due soon. Please review your sales records to ensure timely payments.
              </p>
            </div>
            <div class="mt-3">
              <button
                @click="handleViewCredit"
                class="text-sm font-medium text-red-800 hover:text-red-900 flex items-center"
              >
                View Credit Records
                <svg class="ml-1 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end p-4 gap-5 w-full bg-slate-100">
      <button @click="emits('confirm')" class="mainBtn">Close</button>
    </div>
  </VueFinalModal>
</template>
