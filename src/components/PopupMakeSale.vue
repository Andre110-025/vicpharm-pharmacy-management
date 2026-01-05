<script setup>
import { ref, reactive } from 'vue'
import { onMounted, onUnmounted } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import IconCheckCertificate from './IconCheckCertificate.vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useUserStore } from '@/stores/user'
import ProductSearch from './SaleProductSearch.vue'
import ReceiptView from './SaleReceiptView.vue'
import CustomerSale from './CustomerSale.vue'
import { db } from '@/db'

const { user } = useUserStore()

const isLoading = ref(false)
const selectedSale = ref([])
const currentView = ref('first')
const currentTime = ref(getCurrentTime())
const customerView = ref('search') // 'search' or 'form'
const selectedCustomer = ref(null)

// Sale data structure
const saleData = reactive({
  customer: 'Falana',
  customer_id: null,
  tax: 0, // Default to 0, will be updated when tax checkbox is toggled
  total_amount: 0,
  payment_status: 'unpaid',
  payment_mode: 'credit',
  amount_paid: 0,
  note: '',
  branch_id: user.branchId,
  account_id: user.account,
  user_type: user.userType,
  allproducts: {
    product: [],
  },
})

const emits = defineEmits(['confirm'])

// View navigation functions
const goToCustomerSomething = () => {
  if (selectedSale.value.length === 0) {
    toast.error('Please add at least one product to the sale')
    return
  }
  // First prepare the sale data
  prepareSaleData()
  // Then change view
  currentView.value = 'second'
}

// Time functions
function getCurrentTime() {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

let interval
onMounted(() => {
  interval = setInterval(() => {
    currentTime.value = getCurrentTime()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})

// Product selection function
const initializeSelected = (productData) => {
  const { item, availableQty } = productData

  if (availableQty === 0) {
    toast.error('No Stock available for this product.')
    return
  }

  const existingProduct = selectedSale.value.find((product) => product.product_id === item.id)
  if (existingProduct) {
    toast.error('Product already selected.')
    return
  }

  const data = {
    product_id: item.id,
    product_name: item.product_name,
    unit_type: item.sku[0].purchase_unit_type,
    qty: 1,
    qty_by_lowest: 1,
    max: availableQty,
    discount: 0,
    subtotal: 0, // Will be calculated in prepareSaleData
    profit: 0, // Will be calculated in prepareSaleData
    wholesale_price: item.sku[0].skusale[0].whole_sale_amount,
    retail_price: item.sku[0].skusale[0].unit_amount,
    cost_price: item.sku[0].skusale[0].unit_cost_price,
  }

  selectedSale.value.push(data)
}

const deleteSelect = (index) => {
  selectedSale.value.splice(index, 1)
}

// Function to handle tax updates from the ReceiptView component
const updateTax = (taxPercentage) => {
  saleData.tax = taxPercentage
}

// Calculate total function (without tax)
const calculateTotal = () => {
  if (!selectedSale.value.length) return 0

  return selectedSale.value.reduce((total, item) => {
    // Use wholesale price if quantity > 1, otherwise use retail price
    const price = item.qty > 1 && item.wholesale_price ? item.wholesale_price : item.retail_price
    return total + price * item.qty
  }, 0)
}

// Function to prepare the sale data for submission
const prepareSaleData = () => {
  // Calculate the final total (without tax - tax will be applied on the server)
  const totalAmount = calculateTotal()

  // Update saleData with current sale information
  saleData.total_amount = totalAmount

  // Replace the product array with the current selected products
  saleData.allproducts.product = selectedSale.value.map((item) => {
    // Calculate subtotal for each item
    const price = item.qty > 1 && item.wholesale_price ? item.wholesale_price : item.retail_price
    const subtotal = price * item.qty
    const costTotal = item.cost_price * item.qty

    // Calculate profit for each item
    const profit = subtotal - costTotal

    return {
      product_id: item.product_id,
      product_name: item.product_name,
      unit_type: item.unit_type,
      qty: item.qty,
      qty_by_lowest: item.qty,
      discount: item.discount || 0,
      subtotal: subtotal,
      profit: profit,
    }
  })

  return saleData
}

const selectCustomer = (customer) => {
  selectedCustomer.value = customer
  saleData.customer = customer.name
  // saleData.customer_number = customer.name
  saleData.customer_id = `${customer.id}`

  toast.success(`Customer ${customer.name} selected`)
}

const completeSale = async () => {
  const finalSaleData = prepareSaleData()
  
  try {
    isLoading.value = true

    // 1. ALWAYS TRY THE SERVER FIRST
    const response = await axios.post('makeSales', finalSaleData)

    if (response.status === 200 || response.status === 201) {
      toast.success('Sale completed successfully')
      emits('confirm', true)
    }
  } catch (error) {
    // 2. OFFLINE FALLBACK
    // Check if browser is offline OR if our interceptor handled an offline request
    const isOffline = !navigator.onLine || error.isOfflineHandled

    if (isOffline) {
      console.log('🌐 Connection Issue: Processing Sale and deducting stock locally...')

      const offlineSaleId = `offline-sale-${Date.now()}`
      const rawSaleData = {
        ...finalSaleData,
        id: offlineSaleId,
        invoice_number: `PENDING-${Date.now()}`, // Temporary invoice number
        created_at: new Date().toISOString(),
        is_offline: true,
        status: 'pending', // Matches your sales table status
      }

      // "Clean" for Dexie
      const cleanSaleData = JSON.parse(JSON.stringify(rawSaleData))

      // 3. ADD TO SYNC QUEUE (to be sent to backend later)
      await db.syncQueue.add({
        endpoint: 'makeSales',
        method: 'POST',
        payload: cleanSaleData,
        timestamp: Date.now(),
        type: 'MAKE_SALE',
      })

      // 4. DEDUCT STOCK LOCALLY (Immediate UI feedback)
      for (const soldProduct of finalSaleData.allproducts.product) {
        const localProduct = await db.products.get(soldProduct.product_id)
        if (localProduct) {
          const newQty = parseInt(localProduct.quantity || 0) - parseInt(soldProduct.qty)
          await db.products.update(soldProduct.product_id, {
            quantity: newQty >= 0 ? newQty : 0,
          })
        }
      }

      // 5. ADD TO LOCAL SALES TABLE (So it shows up in the list immediately)
      await db.sales.add(cleanSaleData)

      toast.info('Sale saved offline. Stock has been updated.', {
        position: 'top-center',
      })

      emits('confirm', true)
      return
    }

    // 6. REAL SERVER ERROR (e.g., 500 or 422 Validation Error)
    console.error('Error completing sale', error)
    const errorMsg = error.response?.data?.message || 'Error completing sale'
    toast.error(errorMsg)
  } finally {
    isLoading.value = false
  }
}

// Complete the sale function
// const completeSale = async () => {
//   const finalSaleData = prepareSaleData()
//   console.log('Final sale data:', finalSaleData)
//   // Here we would typically send this data to the API

//   try {
//     isLoading.value = true

//     if (!navigator.online) {
//       console.log('Offline: Processing Sale and deducting stock locally...')

//       const offlineSaleId = `offline-sale-${Date.now()}`

//       const rawSaleData = {
//         ...finalSaleData,
//         id: offlineSaleId,
//         created_at: new Date().toISOString(),
//         is_offline: true,
//       }

//       // 2. "Clean" it for Dexie
//       const cleanSaleData = JSON.parse(JSON.stringify(rawSaleData))

//       await db.syncQueue.add({
//         endpoint: 'makeSales',
//         method: 'POST',
//         payload: cleanSaleData,
//         timestamp: Date.now(),
//         type: 'MAKE_SALE',
//       })

//       for (const soldProduct of finalSaleData.allproducts.product) {
//         const localProduct = await db.products.get(soldProduct.product_id)
//         if (localProduct) {
//           const newQty = parseInt(localProduct.quantity || 0) - parseInt(soldProduct.qty)
//           await db.products.update(soldProduct.product_id, {
//             quantity: newQty >= 0 ? newQty : 0,
//           })
//         }
//       }

//       await db.sales.add({
//         ...cleanSaleData,
//         invoice_number: `OFF-${Date.now()}`,
//         total: finalSaleData.total_amount,
//         status: 'pending-sync',
//       })

//       toast.info('Sale saved offline. Stock has been updated.', {
//         position: toast.POSITION.TOP_CENTER,
//       })

//       emits('confirm', true)
//       return
//     }

//     const response = await axios.post('makeSales', finalSaleData)

//     if (response.status === 200 || response.status === 201) {
//       toast.success('Sale completed successfully')
//     }
//   } catch (error) {
//     console.error('Error completing sale', error)
//     toast.error('Error completing sale')
//   }
//   // Close modal or navigate as needed
//   emits('confirm', true)
// }
</script>

<template>
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-[600px] max-w-[940px] rounded-2xl shadow-lg max-[450px]:h-full max-[450px]:max-w-full max-[450px]:rounded-none max-[450px]:overflow-y-auto"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="true"
  >
    <div class="flex w-full h-full max-[450px]:flex-col max-[450px]:h-auto max-[450px]:min-h-full">
      <div v-if="currentView === 'first'" class="flex w-full h-full max-[450px]:flex-col">
        <div class="flex-1 flex flex-col p-6 max-[450px]:p-4 max-[450px]:pb-0">
          <div class="flex flex-row items-start gap-4 max-[450px]:gap-2">
            <div
              class="mt-1.5 w-10 h-10 bg-[rgba(5,113,108,0.1)] rounded-sm flex items-center justify-center max-[450px]:w-8 max-[450px]:h-8 max-[450px]:mt-0.5"
            >
              <IconCheckCertificate color="#05716c" class="max-[450px]:w-5 max-[450px]:h-5" />
            </div>
            <div class="flex flex-col justify-center">
              <h2 class="text-lg font-semibold max-[450px]:text-base">Make a Sale</h2>
              <p class="text-gray-600 max-[450px]:text-sm">
                Select from your stock to make sales easily.
              </p>
            </div>
          </div>

          <ProductSearch
            :userType="user.userType"
            :userBranch="user.branchId"
            @select-product="initializeSelected"
          />
        </div>

        <div
          class="bg-[#f7f8fa] flex-1 p-5 rounded-tr-2xl rounded-br-2xl max-[450px]:p-4 max-[450px]:rounded-none max-[450px]:border-t max-[450px]:border-gray-200"
        >
          <ReceiptView
            :selectedItems="selectedSale"
            :currentTime="currentTime"
            :initialTaxEnabled="false"
            @close="emits('confirm')"
            @delete-item="deleteSelect"
            @update-tax="updateTax"
          />

          <button
            @click="goToCustomerSomething"
            class="mt-2.5 w-full mainBtn transition duration-300"
            type="submit"
          >
            Complete Sale
          </button>
        </div>
      </div>

      <div v-if="currentView === 'second'" class="flex w-full h-full max-[450px]:flex-col-reverse">
        <div
          class="bg-[#f7f8fa] flex-1 p-5 h-[599px] rounded-tl-2xl rounded-bl-2xl max-[450px]:h-auto max-[450px]:p-4 max-[450px]:rounded-none max-[450px]:border-t max-[450px]:border-gray-200"
        >
          <ReceiptView
            :selectedItems="selectedSale"
            :currentTime="currentTime"
            :updatable="false"
            :initialTaxEnabled="saleData.tax > 0"
            @close="emits('confirm')"
          />
        </div>

        <div class="w-1/2 p-6 flex flex-1 h-600px flex-col max-[450px]:w-full max-[450px]:p-4">
          <div class="flex flex-row justify-between items-center mb-4 max-[450px]:mb-3">
            <div class="flex flex-row gap-3 max-[450px]:gap-2">
              <div
                class="mt-1.5 w-10 h-10 bg-[rgba(5,113,108,0.1)] rounded-sm flex items-center justify-center max-[450px]:w-8 max-[450px]:h-8 max-[450px]:mt-0.5"
              >
                <IconCheckCertificate color="#05716c" class="max-[450px]:w-5 max-[450px]:h-5" />
              </div>
              <div class="flex flex-col justify-center">
                <h2 class="text-lg font-semibold max-[450px]:text-base">
                  {{ selectedCustomer ? 'Complete Sale' : 'Select Customer' }}
                </h2>
                <p class="text-gray-600 max-[450px]:text-sm max-[450px]:hidden">
                  {{
                    selectedCustomer
                      ? 'Finalize payment details'
                      : 'Choose a customer for this sale'
                  }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex-1 max-[450px]:overflow-y-auto">
            <div v-if="!selectedCustomer" class="h-full">
              <CustomerSale v-if="customerView === 'search'" @select-customer="selectCustomer" />
            </div>

            <div v-else class="h-full flex flex-col">
              <div class="bg-gray-50 p-4 rounded-lg mb-4 max-[450px]:p-3">
                <div class="flex flex-col gap-2.5 max-[450px]:gap-2">
                  <div>
                    <h3 class="font-medium max-[450px]:text-sm">Selected Customer</h3>
                    <p class="text-gray-600 max-[450px]:text-sm">{{ selectedCustomer.name }}</p>
                    <p class="text-sm text-gray-500 max-[450px]:text-xs">
                      {{ selectedCustomer.phone }}
                    </p>
                    <p
                      v-if="selectedCustomer.email"
                      class="text-sm text-gray-500 max-[450px]:text-xs"
                    >
                      {{ selectedCustomer.email }}
                    </p>
                  </div>

                  <textarea
                    class="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor text-sm max-[450px]:text-xs"
                    name=""
                    id=""
                    cols="30"
                    rows="2"
                    placeholder="Enter a note (Optional)"
                    v-model="saleData.note"
                  ></textarea>
                </div>
              </div>

              <button
                @click="completeSale"
                :disabled="isLoading"
                class="w-full mainBtn flex items-center justify-center transition duration-300 rounded-md max-[450px]:py-3"
              >
                <IconCheckCertificate
                  class="w-5 h-5 max-[450px]:w-4 max-[450px]:h-4"
                  color="#ffffff"
                />
                <span class="max-[450px]:text-sm">End Sale</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </VueFinalModal>
</template>
