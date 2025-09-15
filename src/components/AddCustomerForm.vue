<script setup>
import { reactive, ref } from 'vue'
import IconAccount from './IconAccount.vue'
import { toast } from 'vue3-toastify'
import axios from 'axios'

const props = defineProps({
  userType: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['customer-added', 'cancel'])

const isLoading = ref(false)
const countries = ref([
  { name: 'Nigeria', code: '+234', flag: 'ng' },
  { name: 'Ghana', code: '+233', flag: 'gh' },
  { name: 'United States', code: '+1', flag: 'us' },
  { name: 'United Kingdom', code: '+44', flag: 'gb' },
])
const selectedCountry = ref(countries.value[0])
const showCountryDropdown = ref(false)

const customerData = reactive({
  name: null,
  email: null,
  phone: null,
  branch: 'Abeokuta VicPharm',
  user_type: props.userType,
  address: null,
})

const selectCountry = (country) => {
  selectedCountry.value = country
  showCountryDropdown.value = false
}

const validateForm = () => {
  if (!customerData.name) {
    toast.error('Please enter customer name')
    return false
  }

  if (!customerData.phone) {
    toast.error('Please enter phone number')
    return false
  }

  return true
}

const addCustomer = async () => {
  if (!validateForm()) return

  try {
    isLoading.value = true

    // Format phone with country code
    const formattedPhone = `${selectedCountry.value.code}${customerData.phone.replace(/^0+/, '')}`

    // Prepare data for API
    const formData = {
      ...customerData,
      phone: formattedPhone,
    }

    // Replace with your actual API endpoint
    const response = await axios.post('addCustomer', formData)

    if (response.data.success) {
      toast.success('Customer added successfully')

      // Emit event with the newly created customer
      emit('customer-added', {
        id: response.data.customer.id,
        name: customerData.name,
        email: customerData.email,
        phone: formattedPhone,
      })
    } else {
      toast.error(response.data.message || 'Failed to add customer')
    }
  } catch (error) {
    console.error('Error adding customer:', error)
    toast.error('An error occurred. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const onCancel = () => {
  emit('cancel')
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-[rgba(175,53,133,0.1)] rounded-sm flex items-center justify-center"
        >
          <IconAccount class="w-5 h-5" color="#9c417c" />
        </div>
        <div>
          <h2 class="text-lg font-semibold">Add New Customer</h2>
          <p class="text-gray-600 text-sm">Fill in the details to add a new customer</p>
        </div>
      </div>
    </div>

    <div class="space-y-4 flex-1">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          v-model="customerData.name"
          required
          class="w-full h-[40px] border border-gray-400 px-4 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
          placeholder="Enter customer name"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <div class="relative w-full flex items-center border border-gray-400 rounded-md">
          <div class="relative">
            <button
              @click="showCountryDropdown = !showCountryDropdown"
              class="flex items-center gap-2 px-3 h-[40px] border-r border-gray-400 rounded-l-md"
            >
              <img
                :src="`https://flagcdn.com/w40/${selectedCountry.flag}.png`"
                class="w-5 h-5"
                alt="Flag"
              />
              <span>{{ selectedCountry.code }}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>

            <div
              v-if="showCountryDropdown"
              class="absolute left-0 mt-1 w-[120px] bg-white rounded shadow-md z-10"
            >
              <button
                v-for="country in countries"
                :key="country.code"
                @click="selectCountry(country)"
                class="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100"
              >
                <img
                  :src="`https://flagcdn.com/w40/${country.flag}.png`"
                  class="w-5 h-5"
                  :alt="`${country.name} Flag`"
                />
                <span>{{ country.code }}</span>
              </button>
            </div>
          </div>

          <input
            type="text"
            v-model="customerData.phone"
            required
            class="w-full h-[40px] px-4 focus:outline-none focus:ring-1 focus:ring-mainColor"
            placeholder="Phone number"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
        <input
          type="email"
          v-model="customerData.email"
          class="w-full h-[40px] border border-gray-400 px-4 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
          placeholder="Enter email address"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
        <textarea
          v-model="customerData.address"
          class="w-full border border-gray-400 px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
          placeholder="Enter address"
          rows="3"
        ></textarea>
      </div>
    </div>

    <div class="flex justify-between gap-4 mt-6">
      <button
        @click="onCancel"
        class="px-6 py-2 border border-gray-400 rounded-md text-gray-700 hover:bg-gray-100 transition"
      >
        Cancel
      </button>

      <button
        @click="addCustomer"
        class="flex-1 px-6 py-2 bg-[#9c417c] text-white rounded-md hover:bg-[#853369] transition flex items-center justify-center"
        :disabled="isLoading"
      >
        <span
          v-if="isLoading"
          class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"
        ></span>
        <span>Add Customer</span>
      </button>
    </div>
  </div>
</template>
