<script setup>
import IconNotePad from './IconNotePad.vue'
import IconRestock from './IconRestock.vue'
import IconEye from './IconEye.vue'
import IconPrice from './IconPrice.vue'
import IconToggle from './IconToggle.vue'
import { useModal } from 'vue-final-modal'
import PopupAddEditProduct from './PopupAddEditProduct.vue'
import PopUpAddStock from './PopupAddStock.vue'
import PopUpUpdatePrice from './PopUpUpdatePrice.vue'
import PopUpConfirmAction from './PopUpConfirmAction.vue'
import { useHelpers } from '@/helper'
import IconImage from './IconImage.vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useUserStore } from '@/stores/user'

const { formatDateTime, formatTime } = useHelpers()
const { privileges } = useUserStore()

const emit = defineEmits(['refresh'])

const props = defineProps({
  inventoryData: {
    type: Array,
    default: () => [],
  },
})

const openEditProduct = (item) => {
  console.log(item)
  const { open, close } = useModal({
    component: PopupAddEditProduct,
    attrs: {
      edit: true,
      productItem: item,
      onConfirm(bool) {
        if (bool) {
          emit('refresh')
        }
        close()
      },
    },
  })

  open()
}

const openAddStock = (item) => {
  const { open, close } = useModal({
    component: PopUpAddStock,
    attrs: {
      productItem: item,
      onConfirm(bool) {
        if (bool) {
          emit('refresh')
        }
        close()
      },
    },
  })

  open()
}

const openUpdatePrice = (item) => {
  const { open, close } = useModal({
    component: PopUpUpdatePrice,
    attrs: {
      productItem: item,
      totalQuantity: getTotalQuantity(item.sku),
      onConfirm(bool) {
        if (bool) {
          emit('refresh')
        }
        close()
      },
    },
  })

  open()
}

const openActivateDeactivate = (id) => {
  const { open, close } = useModal({
    component: PopUpConfirmAction,
    attrs: {
      // edit: true,
      // customData: admin,
      onConfirm(bool) {
        if (bool) {
          deleteUser(id)
        }
        close()
      },
    },
  })

  open()
}

const ProductActivateDeactivate = async (product, action) => {
  return toast
    .promise(
      axios.get(`deleteproduct/${product.id}/${action}`),
      {
        pending: action === 'activate' ? 'Activating Product...' : 'Deactivating Product..',
        success: {
          render: ({ data }) => {
            return data.data[0] || 'Action Completed'
          },
        },
        error: 'Error Performing Action',
      },
      {
        position: toast.POSITION.TOP_CENTER,
      },
    )
    .then(() => {
      product.active = !product.active
      // emit('refresh')
    })
    .catch((error) => {
      // console.error('Error deleting user:', error)
      // Handle error state
    })
}

const toggleProductStatus = async (item) => {
  try {
    // You would replace this with your actual API call
    // Example: await apiService.updateProductStatus(item.id, !item.is_active)
    console.log(`Toggling product status for: ${item.product_name}`)

    // For demo purposes, let's just toggle a property and refresh
    item.is_active = !item.is_active
    emit('refresh')
  } catch (error) {
    console.error('Error toggling product status:', error)
  }
}

const formatExpiryDate = (inputdate) => {
  const date = new Date(inputdate)

  // Extract and format the date parts
  const day = String(date.getDate()).padStart(2, '0') // 29
  const month = String(date.getMonth() + 1).padStart(2, '0') // 05
  const year = String(date.getFullYear()).slice(-2) // 25

  const formatted = `${day}/${month}/${year}`
  return formatted
}

const productStatus = (quantity, threshold) => {
  if (quantity === 0) {
    return 'Out of Stock'
  } else if (quantity <= threshold) {
    return 'Low Stock'
  } else if (quantity > threshold) {
    return 'In Stock'
  } else {
    return 'Out of Stock'
  }
}

const getTotalQuantity = (item) => {
  let total = 0

  if (item.length > 0) {
    item.forEach((product) => {
      if (product.productbranch.length > 0) {
        product.productbranch.forEach((branch) => {
          total += branch.qty_remaining_by_lowest
        })
      }
    })
  }

  return total
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
            Stock
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Product Category
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Brand
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Cost Price
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Retail Price
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Wholesale Price
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Stock Left
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Expiry Date
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Total Orders
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Threshold
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Status
          </th>
          <th class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
            Action
          </th>
        </tr>
      </thead>

      <tbody class="divide-y-8 divide-[#FAFAFA]">
        <tr class="rounded-3xl" v-for="(item, index) in inventoryData" :key="index">
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-2 items-center">
              <img
                :src="item.product_image"
                :alt="item.product_name"
                class="w-6 h-6 inline-block object-contain bg-gray-400 rounded"
                v-if="item.product_image"
              />
              <IconImage v-else class="w-6 h-6 inline-block" />
              <p class="h-fit" v-text="item.product_name"></p>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.category"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.brand"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p
              class="h-fit text-end"
              v-text="
                item.sku[0].skusale[0]?.unit_cost_price?.toLocaleString('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                }) || '₦0.00'
              "
            ></p>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p
              class="h-fit text-end"
              v-text="
                item.sku[0]?.skusale[0]?.unit_amount?.toLocaleString('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                }) || '₦0.00'
              "
            ></p>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p
              class="h-fit text-end"
              v-text="
                item.sku[0]?.skusale[0]?.whole_sale_amount?.toLocaleString('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                }) || '₦0.00'
              "
            ></p>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p class="h-fit text-end" v-text="(getTotalQuantity(item.sku) || 0).toLocaleString()"></p>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-2 items-center">
              <p class="h-fit" v-text="formatExpiryDate(item.sku[0].expiry_date)"></p>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-2 items-center">
              <!-- <p class="h-fit" v-text="item.times_sold.toLocaleString()"></p> -->
              <p class="h-fit" v-text="(item.times_sold || 0).toLocaleString()"></p>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-2 items-center">
              <p class="h-fit" v-text="item.threshold"></p>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <p
                v-text="productStatus(getTotalQuantity(item.sku), item.threshold)"
                class="rounded-md py-[1px] px-2 text-[.65em]"
                :class="{
                  'bg-orange-100 text-orange-900':
                    productStatus(getTotalQuantity(item.sku), item.threshold) === 'Low Stock',
                  'bg-green-100 text-green-900':
                    productStatus(getTotalQuantity(item.sku), item.threshold) === 'In Stock',
                  'bg-red-100 text-red-900':
                    productStatus(getTotalQuantity(item.sku), item.threshold) === 'Out of Stock',
                }"
              ></p>
            </div>
          </td>
          <td>
            <div class="flex space-x-2 justify-center">
              <button
                @click="openEditProduct(item)"
                class="p-1 rounded-md hover:bg-gray-100"
                title="Edit Product"
                v-if="privileges.can_edit_products_details"
              >
                <IconNotePad class="w-6 h-6" />
              </button>
              <button
                @click="openAddStock(item)"
                class="p-1 rounded-md hover:bg-gray-100"
                title="Add to product"
                v-if="privileges.can_add_new_sku"
              >
                <IconRestock class="w-6 h-6" :color="'#000'" />
              </button>
              <button
                @click="openUpdatePrice(item)"
                class="p-1 rounded-md hover:bg-gray-100"
                title="Update Price"
                v-if="privileges.can_edit_products_details"
              >
                <IconPrice class="w-6 h-6" />
              </button>
              <button
                @click="ProductActivateDeactivate(item, item.active ? 'deactivate' : 'activate')"
                class="p-1 rounded-md hover:bg-gray-100"
                :title="item.active ? 'Deactivate Product' : 'Activate Product'"
                v-if="privileges.can_deactivate_products"
              >
                <IconToggle class="w-6 h-6" :active="item.active" />
              </button>
              <button
                v-if="false"
                class="p-1 rounded-md hover:bg-gray-100"
                title="View product info"
              >
                <IconEye />
              </button>
            </div>
          </td>
        </tr>

        <tr v-if="!inventoryData.length">
          <td colspan="12" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
            No Products found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
