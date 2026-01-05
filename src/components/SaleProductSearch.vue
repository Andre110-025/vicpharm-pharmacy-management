<script setup>
import { ref, watch } from 'vue'
import IconSearch from './IconSearch.vue'
import IconImage from './IconImage.vue'
import IconEmptyBox from './IconEmptyBox.vue'
import axios from 'axios'
import { toast } from 'vue3-toastify'
import { required } from '@vuelidate/validators'
import { db } from '@/db'

const props = defineProps({
  userType: {
    type: String,
    required: true,
  },
  userBranch: {
    required: true,
  },
})

const emit = defineEmits(['select-product'])

const isLoading = ref(false)
const searchQuery = ref('')
const productQuery = ref(null)
const showAddStock = ref(false)

// const getInventoryList = async (page = 1) => {
//   try {
//     isLoading.value = true
//     productQuery.value = null
//     showAddStock.value = false

//     const response = await axios.post(
//       `searchSellingProductByOwner/${props.userType}?branch=${props.userBranch}&active=1&search=${searchQuery.value}&page=${page}`,
//     )

//     if (response.data.success) {
//       productQuery.value = response.data.products.data
//       isLoading.value = false

//       if (productQuery.value.length === 0) {
//         showAddStock.value = true
//       }
//     }
//   } catch (error) {
//     console.error('Error fetching Data:', error)
//     isLoading.value = false
//   }
// }

const getInventoryList = async (page = 1) => {
  try {
    isLoading.value = true
    productQuery.value = null
    showAddStock.value = false

    // --- 1. OFFLINE LOGIC ---
    if (!navigator.onLine) {
      console.log('Offline: Searching local product cache...')
      
      let localData = await db.products.toArray()

      // A. Search Filter (by Product Name or SKU)
      if (searchQuery.value) {
        const s = searchQuery.value.toLowerCase()
        localData = localData.filter(item => 
          (item.product_name && item.product_name.toLowerCase().includes(s)) ||
          (item.sku && item.sku.some(s_item => s_item.sku_code && s_item.sku_code.includes(s)))
        )
      }

      productQuery.value = localData
      isLoading.value = false
      
      if (productQuery.value.length === 0) {
        showAddStock.value = true
      }
      return
    }

    // --- 2. ONLINE FETCH ---
    const response = await axios.post(
      `searchSellingProductByOwner/${props.userType}?branch=${props.userBranch}&active=1&search=${searchQuery.value}&page=${page}`,
    )

    if (response.data.success) {
      const result = response.data.products.data
      productQuery.value = result
      isLoading.value = false

      if (productQuery.value.length === 0) {
        showAddStock.value = true
      }

      // --- 3. CACHE SYNC ---
      if (result && result.length > 0) {
        // We use bulkPut to ensure our search cache is fresh
        // Note: We map 'id' to ensure Dexie has a primary key
        const dataToSave = result.map(item => ({
          ...item,
          id: item.id || item.product_name // fallback if id is missing
        }))
        await db.products.bulkPut(JSON.parse(JSON.stringify(dataToSave)))
      }
    }
  } catch (error) {
    console.error('Error fetching Data:', error)
    isLoading.value = false
  }
}

// const getInventoryList = async (page = 1) => {
//   try {
//     isLoading.value = true
//     productQuery.value = null
//     showAddStock.value = false

//     // --- 1. OFFLINE LOGIC ---
//     if (!navigator.onLine) {
//       console.log('Offline: Searching local product cache...')
      
//       let localData = await db.products.toArray()

//       // A. Search Filter (by Product Name or SKU)
//       if (searchQuery.value) {
//         const s = searchQuery.value.toLowerCase()
//         localData = localData.filter(item => 
//           (item.product_name && item.product_name.toLowerCase().includes(s)) ||
//           (item.sku && item.sku.some(s_item => s_item.sku_code && s_item.sku_code.includes(s)))
//         )
//       }

//       productQuery.value = localData
//       isLoading.value = false
      
//       if (productQuery.value.length === 0) {
//         showAddStock.value = true
//       }
//       return
//     }

//     // --- 2. ONLINE FETCH ---
//     const response = await axios.post(
//       `searchSellingProductByOwner/${props.userType}?branch=${props.userBranch}&active=1&search=${searchQuery.value}&page=${page}`,
//     )

//     if (response.data.success) {
//       const result = response.data.products.data
//       productQuery.value = result
//       isLoading.value = false

//       if (productQuery.value.length === 0) {
//         showAddStock.value = true
//       }

//       // --- 3. CACHE SYNC ---
//       if (result && result.length > 0) {
//         // We use bulkPut to ensure our search cache is fresh
//         // Note: We map 'id' to ensure Dexie has a primary key
//         const dataToSave = result.map(item => ({
//           ...item,
//           id: item.id || item.product_name // fallback if id is missing
//         }))
//         await db.products.bulkPut(JSON.parse(JSON.stringify(dataToSave)))
//       }
//     }
//   } catch (error) {
//     console.error('Error fetching Data:', error)
//     isLoading.value = false
//   }
// }

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

const selectProduct = (item) => {
  const availableQty = getTotalQuantity(item.sku)

  if (!item.sku.length || availableQty === 0) {
    toast.error('No Stock available for this product.')
    return
  }

  emit('select-product', {
    item,
    availableQty,
  })
}

// watch for changes in the search query
let delaySearch = null
watch(searchQuery, (newValue) => {
  if (delaySearch) {
    clearTimeout(delaySearch)
  }
  delaySearch = setTimeout(() => {
    getInventoryList(1)
  }, 1500)
})

// Initial load
getInventoryList()
</script>

<template>
  <div class="flex flex-col">
    <div class="relative w-[420px] mt-6">
      <IconSearch
        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
      />
      <input
        type="text"
        placeholder="Search for Product"
        v-model="searchQuery"
        class="w-full pl-10 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-mainColor"
      />
    </div>

    <div class="mt-3.5 max-h-[400px] flex-1 overflow-y-auto pr-2.5">
      <div v-if="productQuery?.length" class="flex flex-col gap-3">
        <button
          v-for="(item, index) in productQuery"
          :key="index"
          class="flex flex-row justify-between items-center hover:bg-gray-100 px-2.5 py-1.5"
          @click="selectProduct(item)"
        >
          <div class="flex flex-row gap-1 items-center">
            <img v-if="item.product_image" class="w-8 h-8 object-cover" :src="item.product_image" />
            <IconImage v-else class="w-8 h-8" />
            <div class="flex flex-col items-start">
              <p v-text="item.product_name"></p>
              <span
                v-if="item.prescription === 'true'"
                class="text-xs px-1.5 py-0.5 bg-mainColor/10 text-mainColor rounded-md font-medium"
              >
                Prescription
              </span>
            </div>
          </div>
          <div class="flex items-center">
            <p class="text-gray-400">{{ getTotalQuantity(item.sku) }} left</p>
          </div>
        </button>
      </div>

      <div
        class="p-5 rounded-xl flex flex-col gap-2.5 items-center bg-neutral-100 border border-slate-300"
        v-else-if="showAddStock && !isLoading"
      >
        <IconEmptyBox class="w-10 h-10 mx-auto" />
        <p>Item not found.</p>
        <p>Would you like to add the product?</p>

        <button class="bg-white border border-gray-400 rounded-lg text-center shadow-md">
          Add Item
        </button>
      </div>

      <div v-else-if="isLoading" class="h-24 flex justify-center items-center bg-white">
        <div
          class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
        ></div>
      </div>
    </div>
  </div>
</template>
