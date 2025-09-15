<script setup>
import { ref, reactive, computed } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import { useUserStore } from '@/stores/user'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import IconCancel from './IconCancel.vue'

const { user } = useUserStore()

const emit = defineEmits(['confirm'])

const props = defineProps({
  productItem: {
    type: Object,
    required: true,
  },
  totalQuantity: {
    type: Number,
    required: true,
    // default: 0,
  },
})

const loading = ref(false)
const priceUpdateData = reactive({
  costPrice: props.productItem.sku[0].skusale[0].unit_cost_price,
  retailPrice: props.productItem.sku[0].skusale[0].unit_amount,
  wholesalePrice: props.productItem.sku[0].skusale[0].whole_sale_amount,
  quantityReduction: 0,
  // reason: '',
})

const validateForm = computed(() => {
  return (
    priceUpdateData.retailPrice &&
    priceUpdateData.wholesalePrice &&
    priceUpdateData.costPrice &&
    priceUpdateData.quantityReduction <= props.totalQuantity
    // priceUpdateData.quantityReduction >= 0 &&
    //&& (priceUpdateData.quantityReduction === 0 || priceUpdateData.reason.trim())
  )
})

const remainingQuantity = computed(() => {
  return props.totalQuantity - priceUpdateData.quantityReduction
})

const updatePrice = async () => {
  try {
    loading.value = true

    // Prepare the update payload
    const updatePayload = {
      editPrice: {
        user_type: user.userType,
        saleFormat: [
          {
            id: props.productItem.sku[0].skusale[0].id,
            cost_price: priceUpdateData.costPrice,
            selling_price: priceUpdateData.retailPrice,
            whole_selling_price: priceUpdateData.wholesalePrice,
            total_qty: remainingQuantity.value,
          },
        ],
      },
    }

    // console.log('Update Payload:', updatePayload)
    // return

    const { data, status } = await axios.post('editSalesPrice', updatePayload)

    console.log(data, status)

    if (status === 201 && (!data.error || !data.Error)) {
      // Successfully updated
      const message =
        priceUpdateData.quantityReduction > 0
          ? `Product prices updated and quantity reduced by ${priceUpdateData.quantityReduction}`
          : 'Product prices updated'
      toast.success(message)
      emit('confirm', true)
    }
  } catch (error) {
    console.error('Failed to update product:', error)
    toast.error('Failed to update product')
  } finally {
    loading.value = false
  }
}

const cancel = () => {
  emit('confirm', false)
}

const calculateProfitMargin = (costPrice, sellingPrice) => {
  if (!costPrice || costPrice === 0) return 0
  const profit = sellingPrice - costPrice
  return ((profit / costPrice) * 100).toFixed(2)
}

const validateQuantityInput = () => {
  if (priceUpdateData.quantityReduction > props.totalQuantity) {
    priceUpdateData.quantityReduction = props.totalQuantity
  }
  if (priceUpdateData.quantityReduction < 0) {
    priceUpdateData.quantityReduction = 0
  }
}
</script>

<template>
  <VueFinalModal
    overlay-class="bg-black/50 backdrop-blur-sm"
    class="flex justify-center items-center"
  >
    <div class="bg-white p-4 rounded-lg flex flex-col w-96 max-w-full max-h-[90vh]">
      <div>
        <div class="flex justify-between items-center mb-4">
          <div>
            <h3 class="text-xl font-semibold">Update Product</h3>
            <p>Update prices and adjust quantity</p>
          </div>
          <button
            @click="emit('confirm')"
            type="button"
            class="border border-black rounded p-1 flex items-center justify-center"
          >
            <IconCancel color="black" class="w-5 h-5" />
          </button>
        </div>

        <div class="mb-4">
          <p class="text-lg font-medium">{{ props.productItem.product_name }}</p>
          <p class="text-sm text-gray-500">
            {{ props.productItem.category }} | {{ props.productItem.brand }}
          </p>
          <p class="text-sm text-blue-600 font-medium">
            Current Quantity: {{ props.totalQuantity }}
          </p>
        </div>
      </div>

      <div class="space-y-4 pr-2 pl-1 flex-1 overflow-y-auto">
        <!-- Cost Price -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cost Price (₦)</label>
          <input
            type="number"
            v-model.number="priceUpdateData.costPrice"
            class="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-mainColor"
            step="0.01"
            min="0"
          />
        </div>

        <!-- Retail Price -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Retail Price (₦)</label>
          <input
            type="number"
            v-model.number="priceUpdateData.retailPrice"
            class="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-mainColor"
            step="0.01"
            min="0"
          />
          <p class="text-sm text-gray-500 mt-1">
            Profit Margin:
            {{ calculateProfitMargin(priceUpdateData.costPrice, priceUpdateData.retailPrice) }}%
          </p>
        </div>

        <!-- Wholesale Price -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Wholesale Price (₦)</label>
          <input
            type="number"
            v-model.number="priceUpdateData.wholesalePrice"
            class="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-mainColor"
            step="0.01"
            min="0"
          />
          <p class="text-sm text-gray-500 mt-1">
            Profit Margin:
            {{ calculateProfitMargin(priceUpdateData.costPrice, priceUpdateData.wholesalePrice) }}%
          </p>
        </div>

        <!-- Quantity Reduction Section -->
        <div class="border-t pt-4">
          <h4 class="text-md font-medium text-gray-800 mb-2">Quantity Adjustment</h4>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"> Reduce Quantity By </label>
            <input
              type="number"
              v-model.number="priceUpdateData.quantityReduction"
              @input="validateQuantityInput"
              class="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-mainColor"
              min="0"
              :max="props.totalQuantity"
              placeholder="0"
            />
            <p class="text-sm text-gray-500 mt-1">Remaining Quantity: {{ remainingQuantity }}</p>
          </div>

          <!-- Reason for reduction (required if reducing quantity) -->
          <div v-if="priceUpdateData.quantityReduction > 0 && false" class="mt-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Reason for Reduction <span class="text-red-500">*</span>
            </label>
            <select
              v-model="priceUpdateData.reason"
              class="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-mainColor"
            >
              <option value="">Select reason</option>
              <option value="damaged">Damaged goods</option>
              <option value="expired">Expired</option>
              <option value="lost">Lost/Missing</option>
              <option value="returned">Customer return</option>
              <option value="quality_issue">Quality issue</option>
              <option value="theft">Theft/Shrinkage</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <button
          @click="cancel"
          class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          @click="updatePrice"
          class="px-4 py-2 bg-mainColor/90 text-white rounded-md hover:bg-mainColor disabled:opacity-50"
          :disabled="!validateForm || loading"
        >
          {{ loading ? 'Updating...' : 'Update Product' }}
        </button>
      </div>
    </div>
  </VueFinalModal>
</template>
