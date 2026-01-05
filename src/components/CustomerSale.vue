<script setup>
import { ref } from 'vue'
import IconSearch from './IconSearch.vue'
import IconAccount from './IconAccount.vue'
import IconCheckCertificate from './IconCheckCertificate.vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { useModal } from 'vue-final-modal'
import PopupAddCustomer from './PopupAddCustomer.vue'
import { db } from '@/db'

const { user } = useUserStore()

const emit = defineEmits(['select-customer', 'show-add-form'])

const searchQuery = ref('')
const customers = ref([])
const isLoading = ref(false)
const noResults = ref(false)

// const searchCustomers = async (page = 1) => {
//   // if (!searchQuery.value.trim()) return

//   try {
//     isLoading.value = true
//     noResults.value = false

//     // Replace with your actual API endpoint
//     const response = await axios.post('getCustomer', {
//       user_type: user.userType,
//       search: searchQuery.value,
//       page,
//     })

//     console.log(response)
//     if (response.status === 201) {
//       customers.value = response.data['save type'].data || response.data['save type'] || []
//       noResults.value = customers.value.length === 0
//     } else {
//       customers.value = []
//       noResults.value = true
//     }
//   } catch (error) {
//     console.error('Error searching customers:', error)
//     customers.value = []
//     noResults.value = true
//   } finally {
//     isLoading.value = false
//   }
// }

const searchCustomers = async (page = 1) => {
  try {
    isLoading.value = true
    noResults.value = false

    // --- 1. OFFLINE LOGIC ---
    if (!navigator.onLine) {
      console.log('Offline: Searching local customer database...')
      
      // Get all customers from Dexie
      let localData = await db.customers.toArray()

      // Filter by name, email, or phone
      if (searchQuery.value) {
        const s = searchQuery.value.toLowerCase()
        localData = localData.filter(c => 
          (c.name && c.name.toLowerCase().includes(s)) ||
          (c.email && c.email.toLowerCase().includes(s)) ||
          (c.phone && c.phone.includes(s))
        )
      }

      customers.value = localData
      noResults.value = customers.value.length === 0
      isLoading.value = false
      return
    }

    // --- 2. ONLINE FETCH ---
    const response = await axios.post('getCustomer', {
      user_type: user.userType,
      search: searchQuery.value,
      page,
    })

    if (response.status === 201) {
      const result = response.data['save type'].data || response.data['save type'] || []
      customers.value = result
      noResults.value = customers.value.length === 0

      // --- 3. CACHE SYNC ---
      if (result.length > 0) {
        // We use bulkPut to save the searched customers to local storage
        // This ensures they are available for the NEXT offline search
        await db.customers.bulkPut(JSON.parse(JSON.stringify(result)))
      }
    } else {
      customers.value = []
      noResults.value = true
    }
  } catch (error) {
    console.error('Error searching customers:', error)

    // Fallback to local data if the request fails due to sudden network drop
    const fallback = await db.customers.toArray()
    customers.value = fallback.slice(0, 20)
    noResults.value = customers.value.length === 0
  } finally {
    isLoading.value = false
  }
}

const selectCustomer = (customer) => {
  emit('select-customer', customer)
}

const showAddCustomerForm = () => {
  emit('show-add-form')
}

const { open, close } = useModal({
  component: PopupAddCustomer,
  attrs: {
    onConfirm(bool) {
      if (bool) {
        searchCustomers()
      }
      close()
    },
  },
})

// Initialize with mock data for demonstration
searchCustomers()
</script>

<template>
  <div class="flex flex-col h-full">
    <h2 class="text-lg font-semibold mb-4">Select Customer</h2>

    <div class="flex justify-between mb-4">
      <div class="relative flex-1 mr-2">
        <IconSearch
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
        />
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search by name, email, or phone"
          class="w-full pl-10 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-mainColor"
          @keyup.enter="searchCustomers"
        />
      </div>
      <button @click="searchCustomers" class="px-4 py-2 bg-[#05716c] text-white rounded-lg text-sm">
        Search
      </button>
    </div>

    <div class="flex justify-between mb-4">
      <p class="text-sm text-gray-600">Select an existing customer or create a new one</p>
      <button @click="open()" class="flex items-center gap-2 text-[#05716c] font-medium text-sm">
        <span>Add New Customer</span>
        <IconAccount class="w-4 h-4" />
      </button>
    </div>

    <div class="flex-1 max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg p-2">
      <div v-if="isLoading" class="flex justify-center items-center h-32">
        <div
          class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
        ></div>
      </div>

      <div v-else-if="noResults" class="flex flex-col items-center justify-center h-32">
        <p class="text-gray-500">No customers found</p>
        <button
          @click="showAddCustomerForm"
          class="mt-2 px-4 py-2 bg-[#05716c] text-white rounded-lg text-sm"
        >
          Add New Customer
        </button>
      </div>

      <div v-else class="space-y-2">
        <button
          v-for="customer in customers"
          :key="customer.id"
          @click="selectCustomer(customer)"
          class="w-full flex justify-between items-center p-3 hover:bg-gray-100 rounded-lg transition"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-[rgba(5,113,108,0.1)] rounded-full flex items-center justify-center"
            >
              <IconAccount class="w-5 h-5" color="#9c417c" />
            </div>
            <div class="text-left">
              <p class="font-medium">{{ customer.name }}</p>
              <p class="text-sm text-gray-500">{{ customer.phone }}</p>
            </div>
          </div>
          <IconCheckCertificate class="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  </div>
</template>
