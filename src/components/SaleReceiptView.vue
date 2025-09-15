<script setup>
import { computed, ref } from 'vue'
import IconTooltip from './IconTooltip.vue'
import IconCancel from './IconCancel.vue'

const props = defineProps({
  selectedItems: {
    type: Array,
    required: true,
  },
  currentTime: {
    type: String,
    required: true,
  },
  updatable: {
    type: Boolean,
    default: true,
  },
  initialTaxEnabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'delete-item', 'update-tax'])

const taxEnabled = ref(props.initialTaxEnabled)
const TAX_RATE = 0.075 // 7.5%

const totalItems = computed(() => props.selectedItems.length)

const calculateSubtotal = computed(() => {
  if (!props.selectedItems.length) return 0

  return props.selectedItems.reduce((total, item) => {
    const price = item.qty > 1 && item.wholesale_price ? item.wholesale_price : item.retail_price
    return total + price * item.qty
  }, 0)
})

const calculateTaxAmount = computed(() => {
  return taxEnabled.value ? calculateSubtotal.value * TAX_RATE : 0
})

const calculateTotal = computed(() => {
  return calculateSubtotal.value + calculateTaxAmount.value
})

const handleTaxToggle = () => {
  taxEnabled.value = !taxEnabled.value
  emit('update-tax', taxEnabled.value ? TAX_RATE * 100 : 0)
}
</script>

<template>
  <div class="flex flex-col justify-between h-[500px] p-5 bg-white rounded-md shadow">
    <div class="overflow-y-auto flex-1">
      <div class="flex flex-row justify-between items-center">
        <div class="flex flex-col gap-1">
          <h4 class="text-sm font-semibold">CUSTOMER RECEIPT</h4>
          <div class="flex flex-row gap-4">
            <!-- <p class="text-gray-500 text-sm">Order #001</p> -->
            <p class="text-gray-500 text-sm">
              {{
                new Date().toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
              }}
            </p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="border border-black rounded p-1 flex items-center justify-center"
        >
          <IconCancel color="black" class="w-5 h-5" />
        </button>
      </div>

      <div class="mt-3 flex flex-col pt-2 pb-2 border-t-2 border-b-2 border-dotted border-gray-300">
        <p>ITEM</p>
        <div class="max-h-[280px] overflow-y-auto">
          <table class="w-full">
            <thead class="sticky top-0 bg-white">
              <tr class="text-left">
                <th class="py-2 text-sm font-medium">Product</th>
                <th class="py-2 text-sm font-medium text-center">Quantity</th>
                <th class="py-2 text-sm font-medium text-right">Price</th>
                <th v-if="updatable"></th>
              </tr>
            </thead>
            <tbody v-if="selectedItems.length">
              <tr
                v-for="(item, index) in selectedItems"
                :key="'sale' + item.product_id"
                class="border-b border-gray-100"
              >
                <td class="py-2 flex items-center">
                  <span class="text-gray-500 text-sm mr-1" v-text="item.product_name"></span>
                  <div v-if="updatable" class="relative inline-block group">
                    <IconTooltip class="" />
                    <div
                      class="absolute invisible group-hover:visible bg-slate-200 text-black text-xs rounded py-1 px-2 left-5 bottom-0 z-10 w-32"
                    >
                      Wholesale:
                      {{
                        item.wholesale_price.toLocaleString('en-NG', {
                          style: 'currency',
                          currency: 'NGN',
                        })
                      }}<br />Retail:
                      {{
                        item.retail_price.toLocaleString('en-NG', {
                          style: 'currency',
                          currency: 'NGN',
                        })
                      }}
                    </div>
                  </div>
                </td>
                <td class="py-2 text-center">
                  <input
                    type="number"
                    min="1"
                    :max="item.max"
                    class="w-12 text-center text-gray-500 text-sm border rounded"
                    v-model="item.qty"
                    v-if="props.updatable"
                  />
                  <p v-else v-text="item.qty"></p>
                </td>
                <td class="py-2 text-gray-500 text-sm text-right">
                  {{
                    (item.qty > 1 && item.wholesale_price
                      ? item.qty * item.wholesale_price
                      : item.retail_price * item.qty
                    ).toLocaleString('en-NG', {
                      style: 'currency',
                      currency: 'NGN',
                    })
                  }}
                </td>
                <td v-if="updatable" class="py-2 text-center">
                  <button
                    @click="emit('delete-item', index)"
                    class="text-red-500 hover:text-red-700 px-0 py-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot class="sticky bottom-0 bg-white">
              <tr>
                <td class="pt-4">Subtotal</td>
                <td class="pt-4 text-center" v-text="totalItems"></td>
                <td class="pt-4 text-right">
                  {{
                    calculateSubtotal.toLocaleString('en-NG', {
                      style: 'currency',
                      currency: 'NGN',
                    })
                  }}
                </td>
                <td v-if="updatable"></td>
              </tr>
              <tr v-if="false">
                <td class="pt-2 flex items-center">
                  Tax (7.5%)
                  <div v-if="updatable" class="ml-2">
                    <input
                      type="checkbox"
                      :checked="taxEnabled"
                      @change="handleTaxToggle"
                      class="w-4 h-4 accent-mainColor"
                    />
                  </div>
                </td>
                <td class="pt-2 text-center"></td>
                <td class="pt-2 text-right">
                  {{
                    calculateTaxAmount.toLocaleString('en-NG', {
                      style: 'currency',
                      currency: 'NGN',
                    })
                  }}
                </td>
                <td v-if="updatable"></td>
              </tr>
              <tr class="font-medium">
                <td class="pt-4">TOTAL</td>
                <td class="pt-4 text-center" v-text="totalItems"></td>
                <td class="pt-4 text-right">
                  {{
                    calculateTotal.toLocaleString('en-NG', {
                      style: 'currency',
                      currency: 'NGN',
                    })
                  }}
                </td>
                <td v-if="updatable"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <div>
      <h6 class="text-center text-gray-400">THANK YOU FOR YOUR PURCHASE!</h6>
      <p class="text-center text-gray-400">{{ currentTime }}</p>
    </div>
  </div>
</template>
