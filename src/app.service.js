// import axios from 'axios'
// import { toast } from 'vue3-toastify'
// import { useUserStore } from './stores/user'
// import { db } from './db'

// // Set default configs
// axios.defaults.baseURL = import.meta.env.VITE_API_URL
// axios.defaults.headers.common['Content-Type'] = 'application/json'
// axios.defaults.headers.common['Accept'] = 'application/json'

// // Initialize auth headers on app startup
// const initAuthHeaders = () => {
//   // Get user data from localStorage
//   const userDataString = window.localStorage.getItem('vicPharmUnique')

//   // Only set the Authorization header if user data exists and has a token
//   if (userDataString) {
//     try {
//       const userData = JSON.parse(userDataString)
//       if (userData?.token) {
//         axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`
//       } else {
//         // Clear the Authorization header if no token exists
//         delete axios.defaults.headers.common['Authorization']
//       }
//     } catch (error) {
//       console.error('Error parsing user data from localStorage:', error)
//       delete axios.defaults.headers.common['Authorization']
//     }
//   } else {
//     delete axios.defaults.headers.common['Authorization']
//   }
// }

// // Run initialization
// initAuthHeaders()

// // Add request interceptor
// axios.interceptors.request.use(
//   async (config) => {
//     // Get the latest user data from localStorage on each request
//     const userDataString = window.localStorage.getItem('vicPharmUnique')

//     if (userDataString) {
//       try {
//         const userData = JSON.parse(userDataString)
//         if (userData?.token) {
//           config.headers['Authorization'] = `Bearer ${userData.token}`
//         }
//       } catch (error) {
//         console.error('Error parsing user data in request interceptor:', error)
//       }
//     }

//     if (!navigator.onLine && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
//       if (config.url.includes('getCustomersAnalytics')) {
//         return Promise.reject({ isOfflineHandled: true, isViewOnly: true })
//       }
//       const viewOnlyEndpoints = ['getCustomersAnalytics', 'getCustomer', 'getInventory']
//       if (viewOnlyEndpoints.some((url) => config.url.includes(url))) {
//         // Tell the component: "I'm not queuing this, just handle it yourself"
//         return Promise.reject({ isOfflineHandled: true, isViewOnly: true })
//       }

//       await db.syncQueue.add({
//         method: config.method,
//         endpoint: config.url,
//         payload: config.data,
//         timestamp: Date.now(),
//       })
//       console.log('Offline hijack triggered!')

//       toast.info('Saved. Will sync when online.')

//       // Cancel the real request and return a "Fake" success to the component
//       return Promise.reject({ isOfflineHandled: true })
//     }

//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   },
// )

// // Add Response Interceptor
// axios.interceptors.response.use(
//   (response) => {
//     return response
//   },
//   (error) => {
//     if (error.isOfflineHandled) return Promise.resolve({ data: { status: 'offline-saved' } })
//     // Handle network errors
//     if (error.message === 'Network Error' || !navigator.onLine) {
//       if (error.config?.method !== 'get') {
//         toast.error('No internet connection', {
//           position: toast.POSITION.TOP_CENTER,
//         })
//       }
//     }
//     // Handle authentication errors
//     else if (
//       error.response?.status === 401 ||
//       error.response?.data?.message === 'Unauthenticated.'
//     ) {
//       toast.error('Session expired. Please login again', {
//         position: toast.POSITION.TOP_CENTER,
//       })

//       // Get a new instance of the store
//       const userStore = useUserStore()
//       userStore.$reset()
//     }

//     return Promise.reject(error)
//   },
// )

// export default axios


import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useUserStore } from './stores/user'
import { db } from './db'

axios.defaults.baseURL = import.meta.env.VITE_API_URL
axios.defaults.headers.common['Content-Type'] = 'application/json'
axios.defaults.headers.common['Accept'] = 'application/json'

// --- UNIFIED ENDPOINT LIST, these are all the cached fetch endpoint, for all tables ---
const viewOnlyEndpoints = [
  'getCustomersAnalytics',
  'getCustomer',
  'getInventory',
  'incomeretuns',
  'searchtransactionsByOwner',
  'inventoryrecord',
  'returnslist',
  'getStoreStaffByOwner',
  'getrole',
  'searchSellingProductByOwner',
  'staffloglist',
  'customerspent',
]

// Helper to check if a URL is view-only, i.e., safe to serve cached data
const isViewOnlyRequest = (url) =>
  url && viewOnlyEndpoints.some((endpoint) => url.includes(endpoint))

// --- REQUEST INTERCEPTOR (Layer 1: Fast Fail) ---
axios.interceptors.request.use(
  async (config) => {
    // 1. Auth Logic
    const userDataString = window.localStorage.getItem('vicPharmUnique')
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString)
        if (userData?.token) config.headers['Authorization'] = `Bearer ${userData.token}`
      } catch (e) {
        console.error(e)
      }
    }

    config.timeout = 10000 // 3-second "ping" effect

    // 2. Physical Offline Check, Don’t send request Let app show cached data instead
    if (!navigator.onLine) {
      if (isViewOnlyRequest(config.url)) {
        return Promise.reject({ isOfflineHandled: true, isViewOnly: true })
      }

      // If it's a mutation Save the request to IndexedDB Tell user: “Offline. Saved to sync later.”
      if (navigator.onLine === false) {
        if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
          await db.syncQueue.add({
            method: config.method,
            endpoint: config.url,
            payload: config.data,
            type: config.url.includes('transaction') ? 'MAKE_SALE' : 'OTHER',
            timestamp: Date.now(),
          })
          toast.info('Offline. Saved to sync later.')
          return Promise.reject({ isOfflineHandled: true })
        }
      }
      // if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      //   await db.syncQueue.add({
      //     method: config.method,
      //     endpoint: config.url,
      //     payload: config.data,
      //     timestamp: Date.now(),
      //   })
      //   toast.info('Offline. Saved to sync later.')
      //   return Promise.reject({ isOfflineHandled: true })
      // }
    }

    return config
  },
  (error) => Promise.reject(error),
)

// --- RESPONSE INTERCEPTOR (Layer 2: Real Access Check) ---
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Already handled by Request Interceptor (Layer 1)
    if (error.isOfflineHandled) return Promise.reject(error)

    const config = error.config
    if (!config) return Promise.reject(error)

    // Check for "No Actual Internet access" (Timeout or Network Error)
    const isNetworkError =
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      error.message === 'Network Error' ||
      error.message.includes('timeout')

    if (isNetworkError) {
      // Logic for View-Only (Reports/Tables)
      if (isViewOnlyRequest(config.url)) {
        toast.info('No connection. Showing cached data.', { toastId: 'cache-toast' })
        return Promise.reject({ isOfflineHandled: true, isViewOnly: true })
      }

      // Logic for Mutations (Saving Data)
      // if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      //   try {
      //     await db.syncQueue.add({
      //       method: config.method,
      //       endpoint: config.url,
      //       payload: config.data,
      //       timestamp: Date.now(),
      //     })
      //     toast.info('Connection lost. Saved for later sync.')
      //     return Promise.resolve({ data: { status: 'offline-saved' } })
      //   } catch (dbError) {
      //     toast.error('Failed to save offline')
      //   }
      // }
      if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
        // Determine Type based on URL
        let taskType = 'UNKNOWN'
        if (config.url.includes('Customer'))
          taskType = config.url.includes('edit') ? 'EDIT_CUSTOMER' : 'ADD_CUSTOMER'
        if (config.url.includes('Product')) taskType = 'ADD_PRODUCT'
        if (config.url.includes('sale') || config.url.includes('transaction'))
          taskType = 'MAKE_SALE'

        await db.syncQueue.add({
          method: config.method,
          endpoint: config.url,
          payload: config.data,
          type: taskType,
          timestamp: Date.now(),
        })

        toast.info('Offline. Saved to sync later.')
        return Promise.resolve({ data: { status: 'offline-saved' } })
      }
    }

    // Handle Auth Expiry
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.$reset()
      toast.error('Session expired. Please login again')
    }

    return Promise.reject(error)
  },
)

export default axios