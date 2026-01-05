<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import IconPlus from './IconPlus.vue'
import IconSearch from './IconSearch.vue'
import IconFilter from './IconFilter.vue'
import PropPaginator from './PropPaginator.vue'
import PropButtonIcon from './PropButtonIcon.vue'
import AdminRoleTable from './AdminRoleTable.vue'
import { useModal } from 'vue-final-modal'
import PopUpCreateEditRole from './PopUpCreateEditRole.vue'
import { useUserStore } from '@/stores/user'
import { db } from '@/db'

const { privileges } = useUserStore()

const isLoading = ref(false)
const searchTerm = ref('')
const roleList = ref(null)

// const getRoleList = async () => {
//   try {
//     isLoading.value = true
//     roleList.value = null

//     const response = await axios.get(`getrole`)

//     if (response.status === 202) {
//       roleList.value = response.data.Data
//       isLoading.value = false
//     }
//   } catch (error) {
//     console.error('Error fetching Date:', error)
//     isLoading.value = false
//   }

//   console.log(roleList.value)
// }

// const getRoleList = async () => {
//   try {
//     isLoading.value = true

//     if (!navigator.onLine) {
//       const localData = await db.adminRole.toArray()
//       // We wrap it so the Paginator doesn't crash, 
//       // but we must handle this in the template as shown above
//       roleList.value = {
//         data: localData || [],
//         current_page: 1,
//         last_page: 1,
//         total: localData ? localData.length : 0
//       }
//       isLoading.value = false
//       return
//     }

//     const response = await axios.get(`getrole`)
//     if (response.status === 202) {
//       roleList.value = response.data.Data
      
//       // Cache logic
//       const dataToCache = Array.isArray(roleList.value) 
//         ? roleList.value 
//         : (roleList.value.data || [])

//       if (dataToCache.length > 0) {
//         await db.adminRole.clear()
//         await db.adminRole.bulkPut(JSON.parse(JSON.stringify(dataToCache)))
//       }
//     }
//     isLoading.value = false
//   } catch (error) {
//     console.error('Error:', error)
//     isLoading.value = false
//   }
// }


const getRoleList = async () => {
  try {
    isLoading.value = true

    // Attempt the network request
    const response = await axios.get(`getrole`)

    if (response.status === 202) {
      const result = response.data.Data
      roleList.value = result

      // --- ONLINE: SYNC CACHE ---
      // Roles can come back as a simple array or a paginated object
      const dataArray = Array.isArray(result) ? result : (result.data || [])
      
      if (dataArray.length > 0) {
        const cleanData = JSON.parse(JSON.stringify(dataArray))

        const dataToSave = cleanData.map((item, index) => ({
          ...item,
          // Ensure field consistency for Dexie schema
          id: item.id || `role-${index}-${Date.now()}`,
          role_name: item.role_name || item.name || 'Unnamed Role'
        }))

        try {
          // Roles change infrequently, so clear + put is best to keep it clean
          await db.adminRole.clear()
          await db.adminRole.bulkPut(dataToSave)
        } catch (dexieErr) {
          console.error('Dexie Role Sync Error:', dexieErr)
        }
      }

      isLoading.value = false
    }
  } catch (error) {
    // --- OFFLINE / TIMEOUT FALLBACK ---
    const isOffline = error.isViewOnly || error.isOfflineHandled || !navigator.onLine

    if (isOffline) {
      console.log('🌐 Connection Issue: Loading Roles from local cache...')
      
      let localData = await db.adminRole.toArray()

      // Local Search Filter (Optional, but good for UX)
      if (searchTerm.value) {
        const s = searchTerm.value.toLowerCase().trim()
        localData = localData.filter(item => 
          String(item.role_name || item.name || '').toLowerCase().includes(s)
        )
      }

      // Mock the paginated structure so PropPaginator doesn't break
      roleList.value = {
        data: localData,
        current_page: 1,
        last_page: 1,
        total: localData.length
      }
      
      isLoading.value = false
      return
    }

    console.error('Error fetching Roles:', error)
    isLoading.value = false
  }
}

// const getRoleList = async () => {
//   try {
//     isLoading.value = true

//     // --- 1. OFFLINE LOGIC ---
//     if (!navigator.onLine) {
//       console.log('Offline: Loading Roles from cache...')
      
//       let localData = await db.adminRole.toArray()

//       // Local Search Filter (Filter by role name)
//       // Note: Added search logic since your template has a search bar
//       // if (searchTerm.value) {
//       //   const s = searchTerm.value.toLowerCase()
//       //   localData = localData.filter(item => 
//       //     item.role_name && item.role_name.toLowerCase().includes(s)
//       //   )
//       // }

//       // Format as expected by AdminRoleTable and Paginator
//       roleList.value = {
//         data: localData || [],
//         current_page: 1,
//         last_page: 1,
//         total: localData ? localData.length : 0
//       }
      
//       isLoading.value = false
//       return
//     }

//     // --- 2. ONLINE FETCH ---
//     const response = await axios.get(`getrole`)

//     if (response.status === 202) {
//       const result = response.data.Data
//       roleList.value = result

//       // --- 3. CACHE SYNC ---
//       // We assume result is an object with a .data array or a direct array
//       const dataArray = Array.isArray(result) ? result : (result.data || [])
      
//       if (dataArray.length > 0) {
//         const cleanData = JSON.parse(JSON.stringify(dataArray))

//         // const dataToSave = cleanData.map((item, index) => ({
//         //   ...item,
//         //   // Match 'id' and 'role_name' from your db.js schema
//         //   id: item.id || `role-${index}`,
//         //   role_name: item.role_name || item.name 
//         // }))

//         try {
//           await db.adminRole.clear()
//           await db.adminRole.bulkPut(dataToSave)
//         } catch (dexieErr) {
//           console.error('Dexie Role Sync Error:', dexieErr)
//         }
//       }
      
//       isLoading.value = false
//     }
//   } catch (error) {
//     console.error('Error fetching Roles:', error)
//     isLoading.value = false
//   }
// }

const { open: openRoleCreate, close: closeRoleCreate } = useModal({
  component: PopUpCreateEditRole,
  attrs: {
    // edit: true,
    onConfirm(bool) {
      if (bool) {
        getRoleList()
      }
      closeRoleCreate()
    },
  },
})

onMounted(() => {
  getRoleList()
})
</script>

<template>
  <div class="flex justify-between items-center w-full p-4 mt-2.5">
    <div class="relative w-64 -ml-3">
      <IconSearch
        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
      />
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search...."
        class="w-full pl-10 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-mainColor"
      />
    </div>
    <div>
      <button
        class="w-30 mainBtn flex items-center justify-center gap-2 transition duration-300 rounded-md"
        @click="openRoleCreate()"
        v-if="privileges.can_create_role"
      >
        <IconPlus class="w-5 h-5" />
        <span class="hidden md:inline">Create Role</span>
      </button>
    </div>
    <div v-if="false" class="flex gap-2.5">
      <PropButtonIcon
        class="border-gray-400 text-black hover:bg-gray-100 transition"
        :icon-component="IconFilter"
        text="Filter"
      />
      <!-- <PropButtonIcon
        class="border-gray-400 text-black hover:bg-gray-100 transition"
        :icon-component="IconExport"
        text="Export"
      /> -->
    </div>
  </div>
  <div class="w-full overflow-hidden rounded-lg">
    <AdminRoleTable v-if="!isLoading && roleList" @refresh="getRoleList()" :admin-data="Array.isArray(roleList) ? roleList : roleList.data" />

    <div v-else-if="isLoading" class="h-24 flex justify-center items-center bg-white">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
      ></div>
    </div>

    <!-- Updated Paginator implementation -->
    <!-- Improved Paginator implementation with original styling -->
    <PropPaginator
      v-if="roleList && !isLoading"
      :pagination="roleList"
      :limit="2"
      :keepLength="false"
      :showInfo="true"
      @page-changed="getRoleList"
    />
    <!--<PropTable :table-info="admin.slice(tableStart,tableEnd)" :can-view-info="true" />-->
  </div>
</template>
