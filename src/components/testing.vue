<script>
const getInventoryList = async (page = 1) => {
  try {
    isLoading.value = true
    productQuery.value = null
    showAddStock.value = false

    // --- 1. OFFLINE LOGIC ---
    if (!navigator.onLine) {
      console.log('Offline: Searching local product cache...')
      
      let localData = await db.products.toArray()

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

const addNewProduct = async () => {
  productData.product_type = productData.category
  productData.sale_unit_type = productData.purchase_unit_type
  productData.sale_unit_parent = productData.purchase_unit_type
  productData.addProduct.branch[0].qty_to_assign = productData.purchased_unit_qty

  const isFormCorrect = await v$.value.$validate()
  if (!isFormCorrect) return

  try {
    isLoading.value = true

    // --- 1. OFFLINE LOGIC ---
    if (!navigator.onLine) {
      console.log('Offline: Saving product to local queue...')

      // Create a clean, non-reactive object for Dexie
      const cleanProductData = JSON.parse(JSON.stringify(productData))
      const tempId = props.edit ? productData.id : `temp-prod-${Date.now()}`
      
      // A. Add to Sync Queue
      await db.syncQueue.add({
        endpoint: 'addproduct',
        method: 'POST',
        payload: cleanProductData,
        timestamp: Date.now(),
        type: props.edit ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT',
      })

      // B. Optimistic Update: Update the local products table 
      // so it shows up in search immediately
      const productForSearch = {
        ...cleanProductData,
        id: tempId,
        sku: [{
          id: productData.sku_id || `temp-sku-${Date.now()}`,
          purchase_unit_type: productData.purchase_unit_type,
          productbranch: [{
            qty_remaining_by_lowest: productData.purchased_unit_qty
          }],
          skusale: [{
            unit_amount: productData.unit_amount,
            whole_sale_amount: productData.whole_sale_amount,
            unit_cost_price: productData.unit_cost_price
          }]
        }]
      }

      await db.products.put(JSON.parse(JSON.stringify(productForSearch)))

      toast.info('Product saved locally. It will sync when online.', {
        position: toast.POSITION.TOP_CENTER,
      })

      emits('confirm', true)
      return
    }

    // --- 2. ONLINE LOGIC ---
    const { data, status } = await axios.post('addproduct', productData)

    if (status === 201 && !data.errors && data.Product !== 'null') {
      toast.success(props.edit ? 'Product Updated' : 'Product Added')
      
      // Update local cache so the search list is fresh
      await db.products.put(JSON.parse(JSON.stringify(data.Product)))
      
      emits('confirm', true)
    } else {
      // ... existing error handling ...
      isLoading.value = false
    }
  } catch (error) {
    console.error('Submission error:', error)
    toast.error('An Error was encountered')
    isLoading.value = false
  }
}

const getProductCategory = async () => {
  try {
    isLoading.value = true
    
    // 1. Try to get categories from Dexie first (Always fast)
    const localCategories = await db.categories.toArray()
    if (localCategories.length > 0) {
      productCategoryList.value = localCategories
    }

    // 2. If online, refresh the list from the server
    if (navigator.onLine) {
      const { data, status } = await axios.get('getProductCategory')
      if (status === 202 && data.success) {
        productCategoryList.value = data['all category']
        // Update local cache
        await db.categories.clear()
        await db.categories.bulkAdd(JSON.parse(JSON.stringify(data['all category'])))
      }
    }
  } catch (error) {
    console.error('Category fetch error:', error)
  } finally {
    isLoading.value = false
  }
}

const getProductCategory = async () => {
  try {
    isLoading.value = true

    // 1. Get from local cache
    const localCategories = await db.categories.toArray()
    if (localCategories.length > 0) {
      productCategoryList.value = localCategories
    }

    // 2. Refresh from server if online
    if (navigator.onLine) {
      const { data, status } = await axios.get('getProductCategory')
      
      if (status === 202 && data.success) {
        const rawCategories = data['all category']
        
        // CLEANING STEP: 
        // Ensure every category object has the key defined in your db.js
        // If your db.js uses 'id', but API doesn't provide it, we create it.
        const cleanCategories = rawCategories.map((cat, index) => ({
          id: cat.id || index + 1, // Fallback if id is missing
          name: cat.name
        }))

        productCategoryList.value = cleanCategories

        // Update local cache
        await db.categories.clear()
        // Use the cleaned data
        await db.categories.bulkAdd(JSON.parse(JSON.stringify(cleanCategories)))
      }
    }
  } catch (error) {
    console.error('Category fetch error:', error)
  } finally {
    isLoading.value = false
  }
}

// Inside PopupAddEditProduct.vue -> addNewProduct
const productForSearch = {
  ...cleanProductData,
  id: tempId,
  times_sold: 0, // Add this default
  active: 1,     // Add this default
  sku: [
    {
      id: productData.sku_id || `temp-sku-${Date.now()}`,
      purchase_unit_type: productData.purchase_unit_type,
      expiry_date: productData.expiry_date, // Ensure this is here for the formatter
      productbranch: [
        {
          qty_remaining_by_lowest: Number(productData.purchased_unit_qty),
        },
      ],
      skusale: [
        {
          unit_amount: Number(productData.unit_amount),
          whole_sale_amount: Number(productData.whole_sale_amount),
          unit_cost_price: Number(productData.unit_cost_price),
        },
      ],
    },
  ],
}

import { reactive, ref, watch } from 'vue' // Added watch
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

  // --- CACHING LOGIC START ---
  // We wrap the existing objects in useStorage. 
  // This ensures they stay in localStorage and reload automatically on refresh.
  const notificationData = useStorage('vicPharmNotifications', {
    expiring: 0,
    low_stock: 0,
    due_payments: 0,
  })

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
  // --- CACHING LOGIC END ---

  const resetData = reactive({
    userid: null,
    email: null,
  })

  const getUserDetails = async () => {
    // If offline and we have cached data, don't crash, just stop here
    if (!navigator.onLine && user.value.userInfo) {
        dataFetched.value = true
        return 
    }

    if (dataFetched.value && user.value.userInfo && !Unauthorized.value) {
      return
    }

    if (Unauthorized.value) {
      await $reset()
      return
    }

    if (!user.value.token) {
      await $reset()
      return
    }

    try {
      const { data, status } = await axios.get('getStoreDetailByUser')

      if (data.success) {
        const {
          email_verified_at, created_at, updated_at, email_verify_token,
          forget_password_token, plans, expiry_products, low_stock_product,
          due_date, branch, account, role, ...filteredUser
        } = data['all branches'][0]

        user.value.userInfo = filteredUser
        user.value.userType = filteredUser.user_type
        user.value.branchId = branch[0].id
        user.value.account = account[0].id
        
        // These updates now automatically trigger localStorage saves
        notificationData.value.expiring = expiry_products
        notificationData.value.low_stock = low_stock_product
        notificationData.value.due_payments = due_date

        const {
          created_at: created, updated_at: updated, id, role_id, ...filteredPermission
        } = role.rolepreviledges

        if (user.value.userInfo.is_pass_change) {
          privileges.value = filteredPermission
        }

        dataFetched.value = true
        Unauthorized.value = false
      } else {
        await $reset()
      }
    } catch (error) {
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        toast.error('Network error. Using cached data.')
      } else if (error.response?.status === 401) {
          // Only reset if we are actually online
          if (navigator.onLine) await $reset()
      } else {
        dataFetched.value = false
      }
    }
  }

  const logOut = async () => {
    try {
      await axios.get('logout')
      $reset()
    } catch (error) {
      $reset()
    }
  }

  const $reset = async () => {
    try {
      delete axios.defaults.headers.common['Authorization']

      // Clear all storage keys
      localStorage.removeItem('vicPharmUnique')
      localStorage.removeItem('vicPharmNotifications')
      localStorage.removeItem('vicPharmPrivileges')

      user.value = { userInfo: null, token: null, branchId: null, expirationTime: null, userType: null, account: null }
      
      // Reset the cached refs back to default
      notificationData.value = { expiring: 0, low_stock: 0, due_payments: 0 }
      privileges.value = { 
          can_view_analytics: false, can_view_income_records: false, can_view_products: false,
          can_add_products: false, can_edit_products_details: false, can_add_bulk_products: false,
          can_add_new_sku: false, can_deactivate_products: false, can_view_customers: false,
          can_add_edit_customers: false, can_view_sales_records: false, can_return_sales_records: false,
          can_return_sales_orders: false, can_complete_sales_orders: false, can_make_sales: false,
          view_other_staff_activities: false, add_delete_staff: false, change_staff_position: false,
          can_view_staff: false, can_create_role: false,
      }

      dataFetched.value = false
      Unauthorized.value = false
      resetData.userid = null
      resetData.email = null

      await router.push({ name: 'login' })
    } catch (error) {
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

// Inside axios.interceptors.response.use ...
(error) => {
  if (error.isOfflineHandled) return Promise.resolve({ data: { status: 'offline-saved' } })

  // --- UPDATE THIS PART ---
  if (error.message === 'Network Error' || !navigator.onLine) {
    // Only show toast once, or don't show it at all for GET requests
    if (error.config?.method !== 'get') {
       toast.error('No internet connection')
    }
    // We reject so the syncFromServer catch block can still trigger loadLocal()
    return Promise.reject(error)
  }
  // --- END UPDATE ---
}

export function useOfflineSync(tableName, endpoint) {
  const loadLocal = async () => {
    return await db[tableName].toArray();
  };

  const syncFromServer = async () => {
    // 1. If offline, don't even try the network, just load local immediately
    if (!navigator.onLine) {
      console.log(`🌐 Offline: Loading ${tableName} from local storage.`);
      return await loadLocal();
    }

    try {
      const res = await axios.get(endpoint);
      const data = res.data?.data || res.data;
      
      await db[tableName].clear();
      await db[tableName].bulkPut(data);
      
      return data;
    } catch (err) {
      // 2. Only warn if there was an actual server error, not just "no internet"
      if (navigator.onLine) {
        console.warn(`Sync failed for ${tableName} due to server error.`);
      }
      return await loadLocal();
    }
  };

  return { loadLocal, syncFromServer };
}
  // ... rest of error handling

  const getRoleList = async () => {
  try {
    isLoading.value = true

    // --- 1. OFFLINE LOGIC ---
    if (!navigator.onLine) {
      console.log('Offline: Loading Roles from cache...')
      
      const localData = await db.adminRole.toArray()

      // Format as expected by AdminRoleTable and Paginator
      // We must ensure 'data' exists even if empty to prevent crashes
      roleList.value = {
        data: localData || [],
        current_page: 1,
        last_page: 1,
        total: localData ? localData.length : 0
      }
      
      isLoading.value = false
      return
    }

    // --- 2. ONLINE FETCH ---
    const response = await axios.get(`getrole`)

    if (response.status === 202) {
      const result = response.data.Data
      roleList.value = result

      // --- 3. CACHE SYNC ---
      // Standardize the data array from the server response
      const dataArray = Array.isArray(result) ? result : (result.data || [])
      
      if (dataArray.length > 0) {
        // Use structuredClone or JSON parse to ensure we have a clean data set
        const cleanData = JSON.parse(JSON.stringify(dataArray))

        try {
          await db.adminRole.clear()
          await db.adminRole.bulkPut(cleanData)
        } catch (dexieErr) {
          console.error('Dexie Role Sync Error:', dexieErr)
        }
      }
      
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error fetching Roles:', error)
    isLoading.value = false
  }
}

const getSalesReturnList = async (page = 1) => {
  try {
    isLoading.value = true;
    
    // Quick check first
    let isConnected = navigator.onLine;
    
    // If the browser thinks it's online, verify with a ping
    if (isConnected) {
      isConnected = await checkActualOnline();
    }

    // --- 1. OFFLINE LOGIC ---
    // Now this triggers if the laptop is offline OR if the phone data is off
    if (!isConnected) {
      console.log('Offline: Actual internet check failed. Using cache...');
      
      let localData = await db.sales_returns.toArray();
      // ... your filtering logic ...
      
      saleReturns.value = { data: localData, /* ... */ };
      isLoading.value = false;
      return;
    }

    // --- 2. ONLINE FETCH ---
    const response = await axios.post(`returnslist?page=${page}`, filterData);
    // ..
  }
}

export const checkActualOnline = async () => {
  // If the browser says we are offline, we definitely are.
  if (!navigator.onLine) return false;

  try {
    // Try to fetch a tiny resource with a short timeout.
    // We use a "cache: no-store" to avoid being fooled by service workers.
    const response = await fetch('https://www.google.com/generate_204', {
      mode: 'no-cors',
      cache: 'no-store',
      signal: AbortSignal.timeout(3000) // 3-second timeout
    });
    return !!response;
  } catch (err) {
    // If fetch fails, the hotspot is active but the internet is dead.
    return false;
  }
};

const checkConnection = async () => {
  // 1. If browser says offline, we are offline.
  if (!navigator.onLine) return false;

  // 2. If it's the Browser (not PWA), we might not want the "gimmick" anyway
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  if (!isPWA) return true; // Let the browser fail naturally if not PWA

  // 3. For PWA, verify the "Hotspot but no Data" scenario
  try {
    const response = await fetch('https://www.google.com/generate_204', {
      mode: 'no-cors',
      cache: 'no-store',
      signal: AbortSignal.timeout(2000) // Fast 2s timeout
    });
    return !!response;
  } catch {
    return false; // Reachability failed
  }
};

</script>


<template>
  <p v-text="item.sku[0]?.skusale[0]?.whole_sale_amount?.toLocaleString('en-NG', {
  style: 'currency',
  currency: 'NGN',
}) || '₦0.00'"></p>

<p class="h-fit text-end" v-text="(getTotalQuantity(item.sku) || 0).toLocaleString()"></p>

<p class="h-fit" v-text="(item.times_sold || 0).toLocaleString()"></p>
</template>


