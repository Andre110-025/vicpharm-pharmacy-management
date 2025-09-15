<script setup>
import { ref, onMounted, useTemplateRef, watchEffect } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import { useModal } from 'vue-final-modal'
import PopupReturnSale from './PopupReturnSale.vue'
import IconCheckCertificate from './IconCheckCertificate.vue'
import DynamicInput from './DynamicInput.vue'
import IconCancel from './IconCancel.vue'
import IconImage from './IconImage.vue'
import IconReturn from './IconReturn.vue'
import { useHelpers } from '@/helper'
import { useUserStore } from '@/stores/user'
import axios from 'axios'
import { toast } from 'vue3-toastify'

const { user, privileges } = useUserStore()

const { formatDateTime, formatTime } = useHelpers()

const props = defineProps({
  sales: {
    type: Object,
    default: () => ({}),
  },
})

const anchorLink = useTemplateRef('new-product-file')
const downloadLink = ref(null)

const emits = defineEmits(['confirm'])

const handleReturnItem = (item) => {
  const { open, close } = useModal({
    component: PopupReturnSale,
    attrs: {
      orderItem: item,
      onConfirm(bool) {
        if (bool) {
          downloadLink.value = null
          emits('confirm', true)
        }
        close()
      },
    },
  })

  open()
}

const getPdf = async () => {
  try {
    const { data } = await axios.get(
      `downloadinvoice/${props.sales.order_code}/${user.userType}/print`,
      {
        responseType: 'blob',
      },
    )

    // Create a blob from the Excel data
    const blob = new Blob([data], {
      type: 'application/pdf',
    })

    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob)

    // Set the download link
    downloadLink.value = url
  } catch (error) {
    console.error('Error getting file:', error)
  }
}

watchEffect(() => {
  if (downloadLink.value) {
    anchorLink.value.href = downloadLink.value
    anchorLink.value.download = `${props.sales.order_code}.pdf`
  }
})

onMounted(() => {
  getPdf()
})
</script>

<template>
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-[600px] max-w-[940px] rounded-2xl shadow-lg"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="true"
  >
    <div class="flex w-full h-full">
      <div class="flex flex-col p-6 w-2/5">
        <div class="flex flex-row items-start gap-4">
          <div
            class="mt-1.5 w-10 h-10 bg-[rgba(175,53,133,0.1)] rounded-sm flex items-center justify-center"
          >
            <IconCheckCertificate color="#9c417c" />
          </div>
          <div class="flex flex-col justify-center">
            <h2 class="text-lg font-semibold">Sale Details</h2>
            <p class="text-gray-600">An overview of sales.</p>
          </div>
        </div>
        <form class="flex flex-col gap-2 mt-6">
          <DynamicInput
            label="Initiated By"
            type="text"
            v-model="sales.paymenthistory[0].staff_name"
            readonly
          />
          <DynamicInput
            v-if="sales.payment_status.toLowerCase() === 'paid'"
            label="Completed By"
            type="text"
            v-model="sales.paymenthistory[sales.paymenthistory.length - 1].staff_name"
            readonly
          />
          <DynamicInput
            class="mb-0"
            label="Customer Details"
            type="text"
            v-model="sales.customer"
            readonly
          />
          <DynamicInput
            v-if="sales.customer_email"
            type="text"
            v-model="sales.customer_email"
            readonly
          />
          <div v-if="sales.note">
            <label class="block mb-2">Note</label>
            <textarea
              class="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor text-sm"
              name=""
              id=""
              cols="30"
              rows="2"
              v-model="sales.note"
              readonly
            ></textarea>
          </div>
        </form>
      </div>
      <div class="bg-[#f7f8fa] flex-1 p-5 h-full rounded-tr-2xl rounded-br-2xl">
        <div class="flex flex-col h-[560px] p-5 bg-white rounded-md shadow">
          <div class="flex flex-row justify-between items-center">
            <div class="flex flex-col gap-1">
              <h4 class="text-sm font-semibold">CUSTOMER RECEIPT</h4>
              <div class="flex flex-col gap-2.5">
                <p class="text-gray-500 text-sm">Order {{ sales.order_code }}</p>
                <p class="text-gray-500 text-sm">
                  {{ formatDateTime(sales.created_at) }} | {{ formatTime(sales.created_at) }}
                </p>
              </div>
            </div>
            <button
              @click="emits('confirm')"
              class="border border-black rounded p-1 flex items-center justify-center"
            >
              <IconCancel color="black" class="w-5 h-5" />
            </button>
          </div>
          <div
            class="mt-5 pt-2 pb-2 border-t-2 border-dotted border-gray-300 flex-1 overflow-y-auto"
          >
            <!-- Table for order details -->
            <div class="w-full overflow-x-auto">
              <table class="w-full border-collapse">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-medium text-gray-900">Product</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-900">Subtotal</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-gray-900">Quantity</th>
                    <th
                      v-if="privileges.can_return_sales_orders"
                      class="px-4 py-2 text-right text-sm font-medium text-gray-900"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in sales.orderdetails"
                    :key="item.id"
                    class="border-b border-gray-100"
                  >
                    <td class="px-4 py-3 text-sm">
                      <div class="flex flex-row items-center gap-2">
                        <IconImage class="w-8 h-8 hidden" />
                        <p>{{ item.product_name }}</p>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm text-right text-gray-500">
                      {{
                        item.subtotal.toLocaleString('en-NG', {
                          style: 'currency',
                          currency: 'NGN',
                        })
                      }}
                    </td>
                    <td class="px-4 py-3 text-sm text-right text-gray-500">{{ item.qty }} QTY</td>
                    <td
                      v-if="privileges.can_return_sales_orders"
                      class="px-4 py-3 text-sm text-right"
                    >
                      <button
                        @click="handleReturnItem(item)"
                        class="inline-flex items-center justify-center p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Return Item"
                        :disabled="item.qty <= 0"
                      >
                        <IconReturn />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Summary section -->
            <div class="mt-4 grid grid-cols-2 gap-2">
              <div class="text-left font-medium">TOTAL</div>
              <div class="text-right font-medium">
                {{
                  sales.total_amount.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
                }}
              </div>

              <div class="text-left font-medium">AMOUNT PAID</div>
              <div class="text-right font-medium">
                {{
                  sales.amount_paid.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
                }}
              </div>
            </div>
          </div>

          <div>
            <a
              class="mt-8 w-full block text-center rounded-md px-5 py-2.5 text-sm mainBtn transition duration-300"
              ref="new-product-file"
              type="button"
            >
              Print Receipt
            </a>
          </div>
        </div>
      </div>
    </div>
  </VueFinalModal>
</template>
