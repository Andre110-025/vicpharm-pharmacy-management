// import { reactive, ref, watch } from 'vue'
// import { defineStore, acceptHMRUpdate } from 'pinia'
// import { useStorage } from '@vueuse/core'
// import axios from 'axios'
// import { useRouter } from 'vue-router'
// import { toast } from 'vue3-toastify'

// export const useUserStore = defineStore('user', () => {
//   const router = useRouter()

//   const dataFetched = ref(false)
//   const Unauthorized = ref(false)

//   const user = useStorage('vicPharmUnique', {
//     userInfo: null,
//     branchId: null,
//     account: null,
//     token: null,
//     expirationTime: null,
//     userType: null,
//   })

//   // const notificationData = reactive({
//   //   expiring: 0,
//   //   low_stock: 0,
//   //   due_payments: 0,
//   // })

//   const notificationData = useStorage('vicPharmNotifications', {
//     expiring: 0,
//     low_stock: 0,
//     due_payments: 0,
//     subscription_expiry: 0,
//   })

//   // const privileges = ref({
//   //   can_view_analytics: false,
//   //   can_view_income_records: false,
//   //   can_view_products: false,
//   //   can_add_products: false,
//   //   can_edit_products_details: false,
//   //   can_add_bulk_products: false,
//   //   can_add_new_sku: false,
//   //   can_deactivate_products: false,
//   //   can_view_customers: false,
//   //   can_add_edit_customers: false,
//   //   can_view_sales_records: false,
//   //   can_return_sales_records: false,
//   //   can_return_sales_orders: false,
//   //   can_complete_sales_orders: false,
//   //   can_make_sales: false,
//   //   view_other_staff_activities: false,
//   //   add_delete_staff: false,
//   //   change_staff_position: false,
//   //   can_view_staff: false,
//   //   can_create_role: false,
//   // })

//    const privileges = useStorage('vicPharmPrivileges', {
//     can_view_analytics: false,
//     can_view_income_records: false,
//     can_view_products: false,
//     can_add_products: false,
//     can_edit_products_details: false,
//     can_add_bulk_products: false,
//     can_add_new_sku: false,
//     can_deactivate_products: false,
//     can_view_customers: false,
//     can_add_edit_customers: false,
//     can_view_sales_records: false,
//     can_return_sales_records: false,
//     can_return_sales_orders: false,
//     can_complete_sales_orders: false,
//     can_make_sales: false,
//     view_other_staff_activities: false,
//     add_delete_staff: false,
//     change_staff_position: false,
//     can_view_staff: false,
//     can_create_role: false,
//   })

//   const resetData = reactive({
//     userid: null,
//     email: null,
//     // otp: null,
//     // password: null,
//   })

//   const getUserDetails = async () => {
//     // console.log(dataFetched.value, user.value.userInfo, Unauthorized.value)

//     // if offline, do not attempt fetch
//     if (!navigator.online && user.value.userInfo) { 
//       dataFetched.value = true
//       return
//     }

//     // If data already fetched and we have user info, return early
//     if (dataFetched.value && user.value.userInfo && !Unauthorized.value) {
//       return
//     }

//     // If unauthorized, always reset and return
//     if (Unauthorized.value) {
//       await $reset()
//       return
//     }

//     // If no token available, reset and return
//     if (!user.value.token) {
//       await $reset()
//       return
//     }

//     try {
//       const { data, status } = await axios.get('getStoreDetailByUser')

//       if (data.success) {
//         console.log('got here', data)
//         const {
//           email_verified_at,
//           created_at,
//           updated_at,
//           email_verify_token,
//           forget_password_token,
//           plans,
//           expiry_products,
//           low_stock_product,
//           due_date,
//           subscription_expiry_date,
//           branch,
//           account,
//           role,
//           ...filteredUser
//         } = data['all branches'][0]

//         user.value.userInfo = filteredUser
//         user.value.userType = filteredUser.user_type
//         user.value.branchId = branch[0].id
//         user.value.account = account[0].id

//         // These updates now automatically trigger localStorage saves
//         notificationData.value.expiring = expiry_products
//         notificationData.value.low_stock = low_stock_product
//         notificationData.value.due_payments = due_date
//         notificationData.value.subscription_expiry = subscription_expiry_date

//         const {
//           created_at: created,
//           updated_at: updated,
//           id,
//           role_id,
//           ...filteredPermission
//         } = role.rolepreviledges

//         if (user.value.userInfo.is_pass_change) {
//           privileges.value = filteredPermission
//         }

//         dataFetched.value = true
//         // Clear unauthorized flag on successful fetch
//         Unauthorized.value = false
//       } else {
//         // API returned success: false - treat as unauthorized
//         console.log('API returned unsuccessful response')
//         // await handleUnauthorized()
//         await $reset()
//       }
//     } catch (error) {
//       console.log('Error in getUserDetails:', error)

//       if (error.response?.status === 401 || error.response?.data?.message === 'Unauthenticated.') {
//         // Handle 401 specifically
//         // await handleUnauthorized('Session expired')
//         // await $reset()
//          // Only reset if we are actually online
//           if (navigator.onLine) await $reset()
//       } else if (error.code === 'NETWORK_ERROR' || !error.response) {
//         // Network error - don't reset user data
//         toast.error('Network error. Using offline mode.')
//       } else {
//         // Other API errors - could be server issues
//         toast.error('Error fetching user details. Please try again.')
//         // Don't reset user data for server errors, just mark as not fetched
//         dataFetched.value = false
//       }
//     }
//   }

//   const logOut = async () => {
//     try {
//       const { data, status } = await axios.get('logout')

//       if (status === 201) {
//         $reset()
//       } else {
//         $reset()
//       }
//     } catch (error) {
//       $reset()
//     }
//   }

//   const $reset = async () => {
//     try {
//       // Clear axios authorization header immediately
//       delete axios.defaults.headers.common['Authorization']

//       // Clear localStorage
//       localStorage.removeItem('vicPharmUnique')
//       localStorage.removeItem('vicPharmPrivileges')
//       localStorage.removeItem('vicPharmNotifications')

//       // Reset all reactive state
//       user.value = {
//         userInfo: null,
//         token: null,
//         branchId: null,
//         expirationTime: null,
//         userType: null,
//         account: null,
//       }

//       notificationData.value = { expiring: 0, low_stock: 0, due_payments: 0, subscription_expiry: 0 }

//       privileges.value = {
//         can_view_analytics: false,
//         can_view_income_records: false,
//         can_view_products: false,
//         can_add_products: false,
//         can_edit_products_details: false,
//         can_add_bulk_products: false,
//         can_add_new_sku: false,
//         can_deactivate_products: false,
//         can_view_customers: false,
//         can_add_edit_customers: false,
//         can_view_sales_records: false,
//         can_return_sales_records: false,
//         can_return_sales_orders: false,
//         can_complete_sales_orders: false,
//         can_make_sales: false,
//         view_other_staff_activities: false,
//         add_delete_staff: false,
//         change_staff_position: false,
//         can_view_staff: false,
//         can_create_role: false,
//       }

//       // notificationData.expiring = 0
//       // notificationData.low_stock = 0
//       // notificationData.due_payments = 0
//       dataFetched.value = false
//       Unauthorized.value = false
//       resetData.userid = null
//       resetData.email = null

//       // Navigate to login
//       await router.push({ name: 'login' })
//     } catch (error) {
//       console.error('Error during reset:', error)
//       // Force navigation even if there's an error
//       window.location.href = '/auth'
//     }
//   }

//   return {
//     user,
//     privileges,
//     resetData,
//     notificationData,
//     getUserDetails,
//     logOut,
//     $reset,
//   }
// })

// if (import.meta.hot) {
//   import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
// }


import { reactive, ref } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import { useStorage } from '@vueuse/core'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

export const useUserStore = defineStore('user', () => {
  const router = useRouter()

  const dataFetched = ref(false)
  const Unauthorized = ref(false)

  const user = useStorage('vicPharmUnique', {
    userInfo: null,
    branchId: null,
    account: null,
    token: null,
    expirationTime: null,
    userType: null,
  })

  // const notificationData = reactive({
  //   expiring: 0,
  //   low_stock: 0,
  //   due_payments: 0,
  // })

  const notificationData = useStorage('vicPharmNotifications', {
    expiring: 0,
    low_stock: 0,
    due_payments: 0,
    subscription_expiry: 0,
  })

  // const privileges = ref({
  //   can_view_analytics: false,
  //   can_view_income_records: false,
  //   can_view_products: false,
  //   can_add_products: false,
  //   can_edit_products_details: false,
  //   can_add_bulk_products: false,
  //   can_add_new_sku: false,
  //   can_deactivate_products: false,
  //   can_view_customers: false,
  //   can_add_edit_customers: false,
  //   can_view_sales_records: false,
  //   can_return_sales_records: false,
  //   can_return_sales_orders: false,
  //   can_complete_sales_orders: false,
  //   can_make_sales: false,
  //   view_other_staff_activities: false,
  //   add_delete_staff: false,
  //   change_staff_position: false,
  //   can_view_staff: false,
  //   can_create_role: false,
  // })

   const privileges = useStorage('vicPharmPrivileges', {
    can_view_analytics: false,
    can_view_income_records: false,
    can_view_products: false,
    can_add_products: false,
    can_edit_products_details: false,
    can_add_bulk_products: false,
    can_add_new_sku: false,
    can_deactivate_products: false,
    can_view_customers: false,
    can_add_edit_customers: false,
    can_view_sales_records: false,
    can_return_sales_records: false,
    can_return_sales_orders: false,
    can_complete_sales_orders: false,
    can_make_sales: false,
    view_other_staff_activities: false,
    add_delete_staff: false,
    change_staff_position: false,
    can_view_staff: false,
    can_create_role: false,
  })

  const resetData = reactive({
    userid: null,
    email: null,
    // otp: null,
    // password: null,
  })

  const getUserDetails = async () => {
    // console.log(dataFetched.value, user.value.userInfo, Unauthorized.value)
    if (!navigator.onLine && user.value.userInfo) {
      console.log('Using offline cached user/privileges')
      dataFetched.value = true
      return
    }

    // If data already fetched and we have user info, return early
    if (dataFetched.value && user.value.userInfo && !Unauthorized.value) {
      return
    }

    // If unauthorized, always reset and return
    if (Unauthorized.value) {
      await $reset()
      return
    }

    // If no token available, reset and return
    if (!user.value.token) {
      await $reset()
      return
    }

    try {
      const { data, status } = await axios.get('getStoreDetailByUser')

      if (data.success) {
        console.log('got here', data)
        const {
          email_verified_at,
          created_at,
          updated_at,
          email_verify_token,
          forget_password_token,
          plans,
          expiry_products,
          low_stock_product,
          due_date,
          subscription_expiry_date,
          branch,
          account,
          role,
          ...filteredUser
        } = data['all branches'][0]

        user.value.userInfo = filteredUser
        user.value.userType = filteredUser.user_type
        user.value.branchId = branch[0].id
        user.value.account = account[0].id

        notificationData.value.expiring = expiry_products
        notificationData.value.low_stock = low_stock_product
        notificationData.value.due_payments = due_date
        notificationData.value.subscription_expiry = subscription_expiry_date

        const {
          created_at: created,
          updated_at: updated,
          id,
          role_id,
          ...filteredPermission
        } = role.rolepreviledges

        if (user.value.userInfo.is_pass_change) {
          privileges.value = filteredPermission
        }

        dataFetched.value = true
        // Clear unauthorized flag on successful fetch
        Unauthorized.value = false
      } else {
        // API returned success: false - treat as unauthorized
        console.log('API returned unsuccessful response')
        // await handleUnauthorized()
        await $reset()
      }
    } catch (error) {
      console.log('Error in getUserDetails:', error)

      if (error.response?.status === 401 || error.response?.data?.message === 'Unauthenticated.') {
        // Handle 401 specifically
        // await handleUnauthorized('Session expired')
        // await $reset()
        if (navigator.onLine) await $reset()
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        // Network error - don't reset user data
        toast.error('Network error. Please check your connection.')
      } else {
        // Other API errors - could be server issues
        toast.error('Error fetching user details. Please try again.')
        // Don't reset user data for server errors, just mark as not fetched
        dataFetched.value = false
      }
    }
  }

  const logOut = async () => {
    try {
      const { data, status } = await axios.get('logout')

      if (status === 201) {
        $reset()
      } else {
        $reset()
      }
    } catch (error) {
      $reset()
    }
  }

  const $reset = async () => {
    try {
      // Clear axios authorization header immediately
      delete axios.defaults.headers.common['Authorization']

      // Clear localStorage
      localStorage.removeItem('vicPharmUnique')
      localStorage.removeItem('vicPharmPrivileges')
      localStorage.removeItem('vicPharmNotifications')

      // Reset all reactive state
      user.value = {
        userInfo: null,
        token: null,
        branchId: null,
        expirationTime: null,
        userType: null,
        account: null,
      }

      privileges.value = {
        can_view_analytics: false,
        can_view_income_records: false,
        can_view_products: false,
        can_add_products: false,
        can_edit_products_details: false,
        can_add_bulk_products: false,
        can_add_new_sku: false,
        can_deactivate_products: false,
        can_view_customers: false,
        can_add_edit_customers: false,
        can_view_sales_records: false,
        can_return_sales_records: false,
        can_return_sales_orders: false,
        can_complete_sales_orders: false,
        can_make_sales: false,
        view_other_staff_activities: false,
        add_delete_staff: false,
        change_staff_position: false,
        can_view_staff: false,
        can_create_role: false,
      }

      // notificationData.expiring = 0
      // notificationData.low_stock = 0
      // notificationData.due_payments = 0
      notificationData.value = { expiring: 0, low_stock: 0, due_payments: 0, subscription_expiry: 0 }
      
      dataFetched.value = false
      Unauthorized.value = false
      resetData.userid = null
      resetData.email = null

      // Navigate to login
      await router.push({ name: 'login' })
    } catch (error) {
      console.error('Error during reset:', error)
      // Force navigation even if there's an error
      window.location.href = '/auth'
    }
  }

  return {
    user,
    privileges,
    resetData,
    notificationData,
    getUserDetails,
    logOut,
    $reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
