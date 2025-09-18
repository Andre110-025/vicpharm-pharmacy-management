<script setup>
import { ref, computed } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import IconAccount from './IconAccount.vue'
import IconCancel from './IconCancel.vue'
import DynamicInput from './DynamicInput.vue'
import SearchBar from './SearchBar.vue'
import IconDownload from './IconDownload.vue'
import IconFilter from './IconFilter.vue'
import { useUserStore } from '@/stores/user'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import ButtonReceiptDownload from './ButtonReceiptDownload.vue'

const { user, privileges } = useUserStore()

const emit = defineEmits(['confirm'])

const props = defineProps({
  customData: {
    type: Object,
    default: () => ({}),
  },
})

const searchQuery = ref('')

const orders = ref(props.customData.orders || [])

// Search and filter state
const showFilters = ref(false)
const filters = ref({
  paid: false,
  pending: false,
  unpaid: false,
  partiallyPaid: false,
  declined: false,
  returned: false,
})

// Computed property for filtered orders
const filteredOrders = computed(() => {
  let result = orders.value

  // Filter by search query (order_code)
  if (searchQuery.value.trim() !== '') {
    result = result.filter((order) =>
      order.order_code.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  // Filter by payment status
  const activeFilters = Object.entries(filters.value).filter(([_, value]) => value)

  if (activeFilters.length > 0) {
    result = result.filter((order) => {
      const status = order.payment_status.toLowerCase()

      if (filters.value.paid && status === 'paid') return true
      if (filters.value.pending && status === 'pending') return true
      if (filters.value.unpaid && status === 'unpaid') return true
      if (filters.value.partiallyPaid && status === 'partially paid') return true
      if (filters.value.declined && status === 'declined') return true
      if (filters.value.refunded && status === 'refunded') return true

      return false
    })
  }

  return result
})

// Helper functions
const clearFilters = () => {
  Object.keys(filters.value).forEach((key) => {
    filters.value[key] = false
  })
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date
    .toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .toLowerCase()
}

const formatCurrency = (amount) => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const getStatusClass = (status) => {
  const statusLower = status.toLowerCase()
  switch (statusLower) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'unpaid':
      return 'bg-red-100 text-red-800'
    case 'partially paid':
      return 'bg-blue-100 text-blue-800'
    case 'declined':
      return 'bg-gray-100 text-gray-800'
    case 'refunded':
      return 'bg-purple-100 text-purple-800'
    case 'returned':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const openPdf = async (orderCode) => {
  return toast
    .promise(
      axios.get(`downloadinvoice/${orderCode}/${user.userType}/print`, {
        responseType: 'blob',
      }),
      {
        pending: 'Preparing PDF...',
        success: {
          render: ({ data }) => {
            const blob = new Blob([data.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            // window.open(url, '_blank')
            return 'PDF opened successfully'
          },
        },
        error: 'Failed to download PDF',
      },
      {
        position: toast.POSITION.TOP_CENTER,
      },
    )
    .catch((error) => {
      console.log(error)
      throw error // Re-throw to maintain promise rejection chain
    })
}
</script>

<template>
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-[600px] flex flex-row max-w-[940px] rounded-2xl shadow-lg"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="true"
  >
    <div class="flex-1 flex flex-col h-full p-5 space-y-5">
      <div class="flex flex-row items-center gap-3 border-b border-dashed border-b-gray-300 pb-4">
        <div
          class="w-10 h-10 bg-[rgba(5,113,108,0.1)] rounded-md flex items-center justify-center"
        >
          <IconAccount class="w-8 h-8" />
        </div>
        <div class="flex flex-col justify-center flex-1">
          <h2 class="text-lg font-semibold">Customer Information</h2>
          <p class="text-gray-600">View Information about your customer</p>
        </div>

        <button
          @click="emit('confirm')"
          type="button"
          class="border border-black rounded p-1 flex items-center justify-center"
        >
          <IconCancel color="black" class="w-5 h-5" />
        </button>
      </div>

      <div class="flex-1 px-2.5 overflow-y-auto">
        <DynamicInput label="Name" type="text" v-model="customData.name" readonly />
        <DynamicInput label="Email" type="email" v-model="customData.email" readonly />
        <DynamicInput label="Phone Number" type="tel" v-model="customData.phone" readonly />

        <div>
          <label class="block mb-2">Address</label>
          <textarea
            class="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor text-sm"
            name=""
            id=""
            cols="30"
            rows="2"
            v-model="customData.address"
            readonly
          ></textarea>
        </div>

        <div class="flex flex-row gap-2.5 mt-2.5">
          <button @click="emit('confirm')" class="secondaryBtn rounded-md flex-1">Cancel</button>
          <button
            v-if="privileges.can_add_edit_customers"
            @click="emit('confirm', true)"
            class="mainBtn rounded-md flex-1"
          >
            Edit Info
          </button>
        </div>
      </div>
    </div>
    <div class="flex-1 bg-gray-100 p-5 rounded-tr-2xl rounded-br-2xl">
      <div class="flex flex-col justify-between h-full p-5 bg-white rounded-md shadow">
        <div class="space-y-2.5">
          <h5 class="font-medium">Recent Orders</h5>
          <div class="flex flex-row gap-2.5 items-center justify-between">
            <SearchBar class="w-full" v-model="searchQuery" />
            <div class="relative">
              <button
                @click="showFilters = !showFilters"
                class="p-2 border border-neutral-300 rounded-md hover:bg-gray-100 flex items-center"
              >
                <IconFilter class="w-5 h-5" />
              </button>
              <div
                v-if="showFilters"
                class="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10"
              >
                <div class="p-2">
                  <p class="font-medium text-sm mb-2">Payment Status</p>
                  <div class="space-y-1">
                    <label class="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="filters.paid"
                        class="form-checkbox mr-2 accent-mainColor"
                      />
                      Paid
                    </label>
                    <label class="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="filters.pending"
                        class="form-checkbox mr-2 accent-mainColor"
                      />
                      Pending
                    </label>
                    <label class="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="filters.unpaid"
                        class="form-checkbox mr-2 accent-mainColor"
                      />
                      Unpaid
                    </label>
                    <label class="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="filters.partiallyPaid"
                        class="form-checkbox mr-2 accent-mainColor"
                      />
                      Partially Paid
                    </label>
                    <label class="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="filters.declined"
                        class="form-checkbox mr-2"
                      />
                      Declined
                    </label>
                    <label class="flex items-center text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="filters.returned"
                        class="form-checkbox mr-2"
                      />
                      Returned
                    </label>
                  </div>
                  <div class="mt-2 flex justify-between">
                    <button @click="clearFilters" class="text-xs text-gray-600 hover:text-gray-800">
                      Clear filters
                    </button>
                    <button
                      @click="showFilters = false"
                      class="text-xs bg-mainColor text-white px-2 py-1 rounded"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 mt-5 overflow-y-auto">
          <div v-if="filteredOrders.length === 0" class="text-center py-8 text-gray-500">
            No orders match your search criteria
          </div>
          <div v-for="(order, index) in filteredOrders" :key="index" class="mb-4">
            <div
              class="border border-b-0 rounded-t-xl border-neutral-200 bg-neutral-100 w-fit p-1.5"
            >
              <span class="text-xs font-semibold">{{ formatDate(order.created_at) }}</span> |
              <span class="text-xs">{{ formatTime(order.created_at) }}</span>
            </div>
            <div
              class="border border-neutral-200 p-2 rounded-tr-xl rounded-b-xl flex flex-row gap-2.5"
            >
              <div class="flex-1 flex flex-col gap-2.5 justify-between">
                <div>
                  <p class="text-neutral-500 text-sm">Order Code</p>
                  <p class="text-xs font-medium">{{ order.order_code }}</p>
                </div>
                <div>
                  <p class="text-neutral-500 text-sm">Payment Status</p>
                  <span
                    class="text-xs px-2 py-1 rounded-full"
                    :class="getStatusClass(order.payment_status)"
                  >
                    {{ order.payment_status }}
                  </span>
                </div>
              </div>
              <div class="flex-1 flex flex-col gap-2.5 justify-between">
                <div v-if="false">
                  <button
                    class="flex items-center justify-center px-1 gap-1 w-full border border-neutral-300 bg-neutral-200"
                    @click="openPdf(order.order_code)"
                  >
                    <IconDownload class="w-4 h-4" />
                    <span>Download Receipt</span>
                  </button>
                </div>
                <ButtonReceiptDownload :orderCode="order.order_code" />
                <div class="text-end">
                  <p class="text-neutral-500 text-sm">Total Amount</p>
                  <p class="font-medium">₦{{ formatCurrency(order.total_amount) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VueFinalModal>
</template>
