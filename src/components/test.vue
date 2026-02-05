<script>

import { computed } from 'vue'

const navItems = computed(() => [
  {
    name: 'overview',
    label: 'Dashboard',
    icon: IconDashboard,
    show: privileges.value.can_view_analytics,
  },
  {
    name: 'Customers',
    label: 'Customers',
    icon: IconCustomers,
    show: privileges.value.can_view_customers,
  },
  {
    name: 'Income',
    label: 'Income',
    icon: IconIncome,
    show: privileges.value.can_view_income_records,
  },
  {
    name: 'Sales',
    label: 'Sales',
    icon: IconSale,
    show: privileges.value.can_view_sales_records,
  },
  {
    name: 'Inventory',
    label: 'Inventory',
    icon: IconBox,
    show: privileges.value.can_view_products,
  },
  {
    name: 'Administration',
    label: 'Administration',
    icon: IconAdmin,
    show: privileges.value.can_view_staff,
  },
  {
    name: 'ActivityLog',
    label: 'Activity Log',
    icon: IconActivityLog,
    show: privileges.value.view_other_staff_activities,
  },
  {
    name: 'Settings',
    label: 'Settings',
    icon: IconSettings,
    show: true,
  },
  {
    name: 'Profile',
    label: 'Profile',
    icon: IconProfile,
    show: true,
  },
])




const visibleNavItems = computed(() =>
  navItems.value.filter(item => item.show)
)

const ULTRA_LIMIT = 5

const mainNavItems = computed(() =>
  visibleNavItems.value.slice(0, ULTRA_LIMIT)
)

const moreNavItems = computed(() =>
  visibleNavItems.value.slice(ULTRA_LIMIT)
)



  function calculateExpiry(months) {
  const now = new Date()
  const expiry = new Date(now)

  expiry.setMonth(expiry.getMonth() + Number(months))

  // Optional: normalize to end of day
  expiry.setHours(23, 59, 59, 999)

  return expiry
}

function subscriptionPayment() {
  loading.value = true
  const paystack = new PaystackPop()

  const selectedAmount = amountMap[selectedDuration.value]
  const duration = Number(selectedDuration.value)

  const expiryDate = calculateExpiry(duration)

  paystack.newTransaction({
    key: 'pk_test_68bed5e7669b41901990224f081528282093f60f',
    email: user.userInfo.email,
    amount: selectedAmount * 100,
    channels: ['card', 'bank', 'ussd', 'ussd', 'qr', 'mobile_money'],
    metadata: {
      paymentFor: 'Subscription Renewal',
      user_id: user.userInfo.id,
      duration_months: duration,
      subscription_start: new Date().toISOString(),
      subscription_expiry: expiryDate.toISOString(), // 🔥 THIS
    },
    onSuccess: (transaction) => {
      loading.value = false
      emit('confirm')

      toast.success('Payment is Successful', {
        position: toast.POSITION.TOP_CENTER,
      })
    },
    onCancel: () => {
      loading.value = false
      toast.error('Payment is Cancelled', {
        position: toast.POSITION.TOP_CENTER,
      })
    },
  })
}


import './assets/main.css'
import 'vue-final-modal/style.css'
import 'vue3-toastify/dist/index.css'
import { registerSW } from 'virtual:pwa-register'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVfm } from 'vue-final-modal'
import Vue3Toasity from 'vue3-toastify'

import App from './App.vue'
import router from './router'
import './app.service'

// Enhanced PWA registration with debugging
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('🔄 New content available, please refresh.')
  },
  onOfflineReady() {
    console.log('✅ App ready to work offline')
  },
  onRegistered(registration) {
    console.log('🎯 Service Worker registered:', registration)
    console.log('📡 Scope:', registration?.scope)
  },
  onRegisterError(error) {
    console.error('❌ Service Worker registration error:', error)
  }
})

// Log PWA status
console.log('📱 PWA Status Check:')
console.log('- Secure Context:', window.isSecureContext)
console.log('- Localhost:', window.location.hostname === 'localhost')
console.log('- Service Worker Support:', 'serviceWorker' in navigator)
console.log('- Display Mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser')

// Check if already installed
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('🏠 App is already installed as PWA')
}

const app = createApp(App)
app.use(createVfm())
app.use(createPinia())
app.use(Vue3Toasity, {
  autoClose: 1000,
  clearOnUrlChange: false,
})
app.use(router)

app.mount('#hephzihub')

// Export for manual update if needed
if (import.meta.env.DEV) {
  window.updatePWA = updateSW
}

</script>

<script setup>
import { ref, onMounted } from 'vue'

const showSplash = ref(false)

onMounted(() => {
  // Check if running as installed PWA (not browser)
  const isPWA = window.matchMedia('(display-mode: standalone)').matches
  
  if (isPWA) {
    showSplash.value = true
    setTimeout(() => {
      showSplash.value = false
    }, 3000)
  }
})




// formal app.service
// import axios from 'axios'
// import { toast } from 'vue3-toastify'
// import { useUserStore } from './stores/user'

// Set default configs
axios.defaults.baseURL = import.meta.env.VITE_API_URL
axios.defaults.headers.common['Content-Type'] = 'application/json'
axios.defaults.headers.common['Accept'] = 'application/json'

// Initialize auth headers on app startup
const initAuthHeaders = () => {
  // Get user data from localStorage
  const userDataString = window.localStorage.getItem('vicPharmUnique')

  // Only set the Authorization header if user data exists and has a token
  if (userDataString) {
    try {
      const userData = JSON.parse(userDataString)
      if (userData?.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`
      } else {
        // Clear the Authorization header if no token exists
        delete axios.defaults.headers.common['Authorization']
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error)
      delete axios.defaults.headers.common['Authorization']
    }
  } else {
    delete axios.defaults.headers.common['Authorization']
  }
}

// Run initialization
initAuthHeaders()

// Add request interceptor
axios.interceptors.request.use(
  (config) => {
    // Get the latest user data from localStorage on each request
    const userDataString = window.localStorage.getItem('vicPharmUnique')

    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString)
        if (userData?.token) {
          config.headers['Authorization'] = `Bearer ${userData.token}`
        }
      } catch (error) {
        console.error('Error parsing user data in request interceptor:', error)
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add Response Interceptor
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle network errors
    if (error.message === 'Network Error') {
      toast.error('No internet connection', {
        position: toast.POSITION.TOP_CENTER,
      })
    }
    // Handle authentication errors
    else if (
      error.response?.status === 401 ||
      error.response?.data?.message === 'Unauthenticated.'
    ) {
      toast.error('Session expired. Please login again', {
        position: toast.POSITION.TOP_CENTER,
      })

      // Get a new instance of the store
      const userStore = useUserStore()
      userStore.$reset()
    }

    return Promise.reject(error)
  },
)

// export default axios


const getIncomeList = async (page = 1) => {
  try {
    isLoading.value = true

    // 1. Check Offline
    if (!navigator.onLine) {
      console.log('Offline: Loading Income from cache...')
      
      // Load the table list
      const cachedIncome = await db.income.toArray()
      
      // Load the specific metrics object using the 'income_metrics' key
      const cachedMetrics = await db.dashboard_cache.get('income_metrics')

      if (cachedIncome.length > 0) {
        incomeList.value = {
          data: cachedIncome,
          current_page: 1,
          last_page: 1,
          total: cachedIncome.length
        }
        
        if (cachedMetrics) {
          incomeMetrics.value = cachedMetrics.data
        }
        
        isLoading.value = false
        return
      }
    }

    // 2. Online: Fetch from Server
    const response = await axios.post(`incomeretuns?page=${page}`, incomeFilter)

    if (response.status === 201 && response.data.success) {
      const result = response.data.IncomeList
      const metrics = response.data.totals
      
      incomeMetrics.value = metrics
      incomeList.value = result

      // 3. Update Dexie
      if (result.data && result.data.length > 0) {
        const rawData = JSON.parse(JSON.stringify(result.data))
        
        // Add IDs so Dexie doesn't crash (since we need 'id' per your schema)
        const dataWithIds = rawData.map((item, index) => ({
          ...item,
          id: item.id || `inc-${index}-${Date.now()}`
        }))

        // Save the list
        await db.income.bulkPut(dataWithIds)

        // Save the totals/metrics object to your existing dashboard_cache
        await db.dashboard_cache.put({
          id: 'income_metrics', // This unique ID keeps it from overwriting other stats
          data: JSON.parse(JSON.stringify(metrics))
        })
      }

      isLoading.value = false
    }
  } catch (error) {
    console.error('Error fetching income:', error)
    isLoading.value = false
  }
}

const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

const getIncomeList = async (page = 1) => {
  try {
    isLoading.value = true

    // --- 1. OFFLINE CHECK (Only for PWA) ---
    if (isPWA && !navigator.onLine) {
      const cachedIncome = await db.income.toArray()
      const cachedMetrics = await db.dashboard_cache.get('income_metrics')

      if (cachedIncome.length > 0) {
        incomeList.value = { data: cachedIncome, current_page: 1, last_page: 1 }
        if (cachedMetrics) incomeMetrics.value = cachedMetrics.data
        isLoading.value = false
        return
      }
    }

    // --- 2. REGULAR FETCH ---
    const response = await axios.post(`incomeretuns?page=${page}`, incomeFilter)

    if (response.status === 201 && response.data.success) {
      incomeMetrics.value = response.data.totals
      incomeList.value = response.data.IncomeList

      // --- 3. CACHE ONLY IF PWA ---
      if (isPWA && response.data.IncomeList.data) {
        const rawData = JSON.parse(JSON.stringify(response.data.IncomeList.data))
        
        // Save to Dexie
        const dataWithIds = rawData.map((item, index) => ({
          ...item,
          id: item.id || `inc-${index}-${Date.now()}`
        }))
        
        await db.income.bulkPut(dataWithIds)
        await db.dashboard_cache.put({
          id: 'income_metrics',
          data: JSON.parse(JSON.stringify(response.data.totals))
        })
      }
    }
    isLoading.value = false
  } catch (error) {
    console.error('Error:', error)
    isLoading.value = false
  }
}

// src/composables/usePwa.js)
import { ref } from 'vue'

export function usePwa() {
  // Check if it's running as a standalone app (PWA)
  const isPwa = ref(
    window.matchMedia('(display-mode: standalone)').matches || 
    window.navigator.standalone === true
  )

  // Internet Status
  const isOnline = ref(window.navigator.onLine)
  
  window.addEventListener('online', () => (isOnline.value = true))
  window.addEventListener('offline', () => (isOnline.value = false))

  // The Magic Logic: Only allow offline mode IF it is a PWA
  const shouldShowOffline = () => {
    return isPwa.value && !isOnline.value
  }

  return { isPwa, isOnline, shouldShowOffline }
}

import { usePwa } from '@/composables/usePwa'
const { isPwa, isOnline, shouldShowOffline } = usePwa()

const getTopCustomerList = async (page = 1) => {
  try {
    isLoading.value = true

    // GLOBAL GUARD: Only run offline logic if it's a PWA AND offline
    if (shouldShowOffline()) {
       console.log("PWA detected and Offline. Running local filter...")
       // ... your offline filter logic here ...
       return 
    }

    // NORMAL BROWSER behavior or PWA while Online
    const response = await axios.post(...)
    
    // ... rest of your code ...

    // Only save to Dexie if it's a PWA
    if (isPwa.value && response.data) {
       await db.top_customers.bulkPut(...)
    }

  } catch (error) { ... }
}
<template>
<!-- Wrapper -->
<div class="space-y-5">

  <!-- ================= TOP ANALYTICS ================= -->
  <div class="grid grid-cols-6 gap-4">

    <div class="col-span-3 bg-white p-4 rounded-xl shadow">
      Sales Overview
    </div>

    <div class="col-span-2 bg-white p-4 rounded-xl shadow">
      Inventory Summary
    </div>

    <div class="col-span-1 bg-white p-4 rounded-xl shadow">
      Expenses
    </div>

  </div>


  <!-- ================= MAIN DASHBOARD ================= -->
  <div class="grid grid-cols-5 gap-4">

    <div class="col-span-3 bg-white p-4 rounded-xl shadow">
      Top Selling
    </div>

    <div class="col-span-2 bg-white p-4 rounded-xl shadow">
      Stock by Brand
    </div>

    <div class="col-span-3 bg-white p-4 rounded-xl shadow">
      Revenue Chart
    </div>

    <div class="col-span-2 bg-white p-4 rounded-xl shadow">
      Low Stock
    </div>

    <div class="col-span-3 bg-white p-4 rounded-xl shadow">
      Top Customers
    </div>

    <div class="col-span-2 bg-white p-4 rounded-xl shadow">
      Slowest Selling
    </div>

  </div>

</div>


</template>
