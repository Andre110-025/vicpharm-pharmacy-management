<script setup>
import { ref, reactive, watch, computed } from 'vue'
import DynamicInput from './DynamicInput.vue'
import { useUserStore } from '@/stores/user'
import { VueFinalModal } from 'vue-final-modal'
import IconBox from './IconBox.vue'
import IconCancel from './IconCancel.vue'
import useVuelidate from '@vuelidate/core'
import { required, minValue } from '@vuelidate/validators'
import axios from 'axios'
import { toast } from 'vue3-toastify'

const { user } = useUserStore()
const isLoading = ref(false)

const props = defineProps({
  productItem: {
    type: Object,
    default: null,
  },
})

const emits = defineEmits(['confirm'])

const productData = reactive({
  user_type: user.userType,
  created_by: user.userInfo.full_name,
  purchase_unit_type: props.productItem.sku[0].purchase_unit_type,
  purchased_date: null,
  expiry_date: null,
  purchased_unit_qty: 1,
  purchased_total_amount: 0,
  product_id: props.productItem.id,
  unit_cost_price: 0,
  unit_amount: 0,
  whole_sale_amount: 0,
  saleInfo: {
    skuSale: [
      {
        sale_unit_type: props.productItem.sku[0].purchase_unit_type,
        sale_unit_parent: props.productItem.sku[0].purchase_unit_type,
        qty_in_parent: 1,
        unit_amount: 0, //will change
        unit_cost_price: 0, //will change
        whole_sale_amount: 0, //will change
      },
    ],
  },
  addProduct: {
    branch: [
      {
        qty_to_assign: 0, // same as purchased_unit_qty
        branch_id: user.branchId,
      },
    ],
  },
  id: null,
})

watch(
  [() => productData.purchased_total_amount, () => productData.purchased_unit_qty],
  ([newTotalAmount, newUnitQty]) => {
    // Check if both values exist and quantity is not zero
    if (newTotalAmount && newUnitQty && newUnitQty !== 0) {
      // Calculate unit cost price
      productData.unit_cost_price = newTotalAmount / newUnitQty
      productData.saleInfo.skuSale[0].unit_cost_price = newTotalAmount / newUnitQty
    }
  },
)

const rules = computed(() => ({
  purchased_date: {
    required,
  },
  expiry_date: {
    required,
  },
  purchased_unit_qty: {
    required,
  },
  purchased_total_amount: {
    required,
  },
  whole_sale_amount: {
    required,
    minValue: minValue(productData.unit_cost_price),
  },
  unit_amount: {
    required,
    minValue: minValue(productData.unit_cost_price),
  },
  unit_cost_price: {
    required,
    minValue: minValue(0),
  },
}))

const v$ = useVuelidate(rules, productData)

const addNewStock = async () => {
  productData.saleInfo.skuSale[0].unit_cost_price = productData.unit_cost_price
  productData.saleInfo.skuSale[0].whole_sale_amount = productData.whole_sale_amount
  productData.saleInfo.skuSale[0].unit_amount = productData.unit_amount
  productData.addProduct.branch[0].qty_to_assign = productData.purchased_unit_qty

  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) return

  try {
    isLoading.value = true
    // console.log('after validation', productData)

    const response = await axios.post('addnewstock', productData)
    console.log(response, response.status)

    if (response.status === 201) {
      toast.success('Stock added Successfully', {
        position: toast.POSITION.TOP_CENTER,
      })

      emits('confirm', true)
    } else {
      if (response.data.errors) {
        toast.warning(response.data.errors, {
          position: toast.POSITION.TOP_CENTER,
        })
      } else {
        toast.error('An Error was encountered while adding Stock', {
          position: toast.POSITION.TOP_CENTER,
        })
      }
      isLoading.value = false
    }
  } catch (error) {
    toast.error('An Error was encountered while adding Stock', {
      position: toast.POSITION.TOP_CENTER,
    })
    isLoading.value = false
  }
}
</script>

<template>
  <VueFinalModal
    class="flex h-full w-full items-center justify-center"
    content-class="relative bg-white border w-full h-fit max-w-[400px] rounded-2xl shadow-lg"
    overlay-class="bg-black/50 backdrop-blur-sm"
    :overlayTransition="'vfm-fade'"
    :contentTransition="'vfm-fade'"
    :clickToClose="true"
  >
    <form @submit.prevent="addNewStock" class="flex flex-col w-full h-full">
      <div class="flex flex-row justify-between items-center p-5">
        <div class="flex flex-row items-center gap-3">
          <div
            class="w-10 h-10 bg-[rgba(5,113,108,0.1)] rounded-md flex items-center justify-center"
          >
            <IconBox class="w-8 h-8 stroke-mainColor stroke-1" />
          </div>
          <div class="flex flex-col">
            <h2 class="text-lg font-semibold">Add Stock to Product</h2>
            <p class="text-gray-600" v-text="props.productItem.product_name"></p>
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

      <div class="flex flex-col flex-1 overflow-y-auto p-4">
        <!-- Add your form or content here -->
        <DynamicInput
          v-model="productData.purchased_total_amount"
          type="Number"
          placeholder="Purchased Total Amount (₦)"
          :label="'Purchased Total Amount (₦)'"
          :currency="true"
        />

        <div>
          <span class="block mb-2 text-base">Total Unit Purchased</span>
          <div class="flex flex-row gap-2.5 mb-4">
            <button
              @click="--productData.purchased_unit_qty"
              :disabled="productData.purchased_unit_qty <= 1"
              type="button"
              class="py-2 px-3.5 w-10 text-center border border-black"
            >
              -
            </button>
            <DynamicInput
              v-model="productData.purchased_unit_qty"
              type="Number"
              placeholder="Unit amount"
              style="flex: 1; margin-bottom: 0"
            />
            <button
              @click="++productData.purchased_unit_qty"
              type="button"
              class="py-2 px-3.5 w-10 text-center border border-black"
            >
              +
            </button>
          </div>
        </div>

        <div class="flex flex-row gap-2.5">
          <DynamicInput
            v-model="productData.unit_amount"
            type="Number"
            placeholder="Retail Price (₦)"
            class="flex-1"
            :label="'Retail Price (₦)'"
            :currency="true"
          />

          <DynamicInput
            v-model="productData.whole_sale_amount"
            type="Number"
            placeholder="Wholesale Price (₦)"
            class="flex-1"
            :label="'Wholesale Price (₦)'"
            :currency="true"
          />
        </div>

        <div class="flex flex-row gap-2.5">
          <DynamicInput
            v-model="productData.purchased_date"
            type="Date"
            placeholder="Purchase Date"
            class="flex-1"
            :label="'Purchase Date'"
          />

          <DynamicInput
            v-model="productData.expiry_date"
            type="Date"
            placeholder="Expiry Date"
            class="flex-1"
            :label="'Expiry Date'"
          />
        </div>
      </div>

      <div class="p-4">
        <button
          :disabled="isLoading || v$.$invalid"
          type="submit"
          class="bg-mainColor w-full text-white px-4 py-2 rounded-md"
        >
          Add New Stock
        </button>
      </div>
    </form>
  </VueFinalModal>
</template>
