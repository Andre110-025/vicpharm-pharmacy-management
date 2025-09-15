import axios from 'axios'
import { toast } from 'vue3-toastify'
import { useUserStore } from './stores/user'

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

export default axios
