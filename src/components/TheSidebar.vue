<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import IconDashboard from './IconDashboard.vue'
import IconCustomers from './IconCustomers.vue'
import IconIncome from './IconIncome.vue'
import IconSale from './IconSale.vue'
import IconBox from './IconBox.vue'
import IconAdmin from './IconAdmin.vue'
import IconSettings from './IconSettings.vue'
import Logo from './Logo.vue'
import IconActivityLog from './IconActivityLog.vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import IconProfile from './IconProfile.vue'
import IconNoInternet from './IconNoInternet.vue'
import IconInternetDey from './IconInternetDey.vue'
import Icon3dot from './Icon3dot.vue'

const userStore = useUserStore()
const { user, privileges } = storeToRefs(userStore)

const isOnline = ref(navigator.onLine)
let heartbeatInterval = null

// The "Ping" function
const checkActualConnectivity = async () => {
  // If the browser thinks we're offline, don't even bother pinging
  if (!navigator.onLine) {
    isOnline.value = false
    return
  }

  try {
    // We fetch a tiny resource. Using a cache-buster (?t=...)
    // is critical so the browser doesn't lie to us from cache.
    const response = await fetch('https://google.com/favicon.ico', {
      mode: 'no-cors',
      cache: 'no-store',
    })

    // If fetch succeeds, we are definitely online
    isOnline.value = true
  } catch (error) {
    // If fetch fails but navigator.onLine is true, it's "Lie-Fi"
    isOnline.value = false
  }
}

const handleStatusChange = () => {
  // Immediate update based on browser event
  isOnline.value = navigator.onLine
  // Then verify with a ping
  checkActualConnectivity()
}

onMounted(() => {
  window.addEventListener('online', handleStatusChange)
  window.addEventListener('offline', handleStatusChange)

  // Initial check on load
  checkActualConnectivity()

  // Set up the heartbeat: Ping every 30 seconds to catch silent drops
  heartbeatInterval = setInterval(checkActualConnectivity, 30000)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', handleStatusChange)
  window.removeEventListener('offline', handleStatusChange)
  if (heartbeatInterval) clearInterval(heartbeatInterval)
})

const showMore = ref(false)
</script>

<template>
  <aside
    class="fixed bottom-0 left-0 top-0 z-50 hidden w-64 overflow-y-auto bg-white py-5 px-5 lg:flex flex-col"
  >
    <div class="pb-5 flex items-center justify-center">
      <Logo class="w-[135px]" />
    </div>
    <div class="flex-1 space-y-3.5 overflow-y-auto py-5">
      <RouterLink v-if="privileges.can_view_analytics" :to="{ name: 'overview' }" class="dashNav">
        <IconDashboard class="" />
        Dashboard
      </RouterLink>
      <RouterLink v-if="privileges.can_view_customers" :to="{ name: 'Customers' }" class="dashNav">
        <IconCustomers class="" />
        Customers
      </RouterLink>
      <RouterLink
        v-if="privileges.can_view_income_records"
        :to="{ name: 'Income' }"
        class="dashNav"
      >
        <IconIncome class="" />
        Income
      </RouterLink>
      <RouterLink v-if="privileges.can_view_sales_records" :to="{ name: 'Sales' }" class="dashNav">
        <IconSale class="" />
        Sales
      </RouterLink>
      <RouterLink v-if="privileges.can_view_products" :to="{ name: 'Inventory' }" class="dashNav">
        <IconBox class="" />
        Inventory
      </RouterLink>
      <RouterLink v-if="privileges.can_view_staff" :to="{ name: 'Administration' }" class="dashNav">
        <IconAdmin class="" />
        Administration
      </RouterLink>
      <RouterLink
        v-if="privileges.view_other_staff_activities"
        :to="{ name: 'ActivityLog' }"
        class="dashNav"
      >
        <IconActivityLog class="" />
        Activity Log
      </RouterLink>
    </div>

    <div class="divide-y divide-gray-300">
      <RouterLink :to="{ name: 'Settings' }" class="dashNav mb-2.5">
        <IconSettings class="" />
        Settings
      </RouterLink>

      <div class="pt-2.5 flex flex-row justify-between items-center">
        <div>
          <p v-text="user.userInfo?.full_name"></p>
          <RouterLink :to="{ name: 'Profile' }" class="text-mainColor"> Profile </RouterLink>
        </div>
        <div>
          <div
            title="No internet connection"
            v-if="!isOnline"
            class="flex justify-center ml-3.5 mt-3.5 bg-red-200 rounded-full p-1 w-[40px]"
          >
            <IconNoInternet class="text-red-500" />
          </div>
          <div
            title="Internet access"
            v-else
            class="flex justify-center ml-3.5 mt-3.5 bg-green-200 rounded-full p-1 w-[40px]"
          >
            <IconInternetDey class="text-green-500 w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
    <a
      href="https://www.gesoftech.com/"
      target="_blank"
      class="mt-6 text-center text-[10px] text-gray-400 hover:text-mainColor transition-colors duration-200"
    >
      Creation © Golden Edge Softech
    </a>
  </aside>

  <nav
    class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-300 hidden min-[451px]:block lg:hidden"
  >
    <div class="absolute left-1/2 -top-5 transform -translate-x-1/2">
      <div
        v-if="!isOnline"
        title="No internet connection"
        class="flex justify-center bg-red-200 rounded-full p-1 w-10 h-10 items-center"
      >
        <IconNoInternet class="text-red-500 w-5 h-5" />
      </div>
      <div
        v-else
        title="Internet access"
        class="flex justify-center bg-green-200 rounded-full p-1 w-10 h-10 items-center"
      >
        <IconInternetDey class="text-green-500 w-5 h-5" />
      </div>
    </div>
    <div class="flex overflow-x-auto py-3 px-4 space-x-6 hide-scrollbar">
      <RouterLink
        v-if="privileges.can_view_analytics"
        :to="{ name: 'overview' }"
        class="dashNav w-[60px]"
      >
        <IconDashboard class="" />
      </RouterLink>
      <RouterLink
        v-if="privileges.can_view_customers"
        :to="{ name: 'Customers' }"
        class="dashNav w-[60px]"
      >
        <IconCustomers class="" />
      </RouterLink>
      <RouterLink
        v-if="privileges.can_view_income_records"
        :to="{ name: 'Income' }"
        class="dashNav w-[60px]"
      >
        <IconIncome class="" />
      </RouterLink>
      <RouterLink
        v-if="privileges.can_view_sales_records"
        :to="{ name: 'Sales' }"
        class="dashNav w-[60px]"
      >
        <IconSale class="" />
      </RouterLink>
      <RouterLink
        v-if="privileges.can_view_products"
        :to="{ name: 'Inventory' }"
        class="dashNav w-[60px]"
      >
        <IconBox class="" />
      </RouterLink>
      <RouterLink
        v-if="privileges.can_view_staff"
        :to="{ name: 'Administration' }"
        class="dashNav w-[60px]"
      >
        <IconAdmin class="" />
      </RouterLink>
      <RouterLink
        v-if="privileges.view_other_staff_activities"
        :to="{ name: 'ActivityLog' }"
        class="dashNav w-[60px]"
      >
        <IconActivityLog class="" />
      </RouterLink>
      <RouterLink :to="{ name: 'Settings' }" class="dashNav w-[60px]">
        <IconSettings class="" />
      </RouterLink>
      <RouterLink :to="{ name: 'Profile' }" class="dashNav w-[60px]">
        <IconProfile class="" />
      </RouterLink>
    </div>
  </nav>

  <!-- Ultra Mobile Nav (≤450px) -->
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-300 max-[450px]:block hidden"
  >
    <!-- Connection bubble -->
    <div class="absolute left-1/2 -top-5 transform -translate-x-1/2">
      <div
        v-if="!isOnline"
        class="flex justify-center bg-red-200 rounded-full p-1 w-10 h-10 items-center"
      >
        <IconNoInternet class="text-red-500 w-5 h-5" />
      </div>
      <div v-else class="flex justify-center bg-green-200 rounded-full p-1 w-10 h-10 items-center">
        <IconInternetDey class="text-green-500 w-5 h-5" />
      </div>
    </div>

    <!-- MAIN (first 5 icons ONLY) -->
    <div class="flex justify-between px-4 py-3">
      <RouterLink
        v-if="privileges.can_view_analytics"
        :to="{ name: 'overview' }"
        class="dashNav w-[56px]"
      >
        <IconDashboard />
      </RouterLink>

      <RouterLink
        v-if="privileges.can_view_customers"
        :to="{ name: 'Customers' }"
        class="dashNav w-[56px]"
      >
        <IconCustomers />
      </RouterLink>

      <RouterLink
        v-if="privileges.can_view_income_records"
        :to="{ name: 'Income' }"
        class="dashNav w-[56px]"
      >
        <IconIncome />
      </RouterLink>

      <RouterLink
        v-if="privileges.can_view_sales_records"
        :to="{ name: 'Sales' }"
        class="dashNav w-[56px]"
      >
        <IconSale />
      </RouterLink>

      <RouterLink
        v-if="privileges.can_view_products"
        :to="{ name: 'Inventory' }"
        class="dashNav w-[56px]"
      >
        <IconBox />
      </RouterLink>

      <!-- 3 DOT BUTTON -->
      <button
        v-if="privileges.can_view_staff || privileges.view_other_staff_activities"
        @click="showMore = !showMore"
        class="dashNav w-[56px]"
      >
        <Icon3dot />
      </button>
    </div>

    <!-- MORE MENU -->
    <div
      v-if="showMore"
      class="absolute bottom-16 right-4 bg-white rounded-xl shadow-lg p-3 space-y-2"
    >
      <RouterLink
        v-if="privileges.can_view_staff"
        :to="{ name: 'Administration' }"
        class="dashNav"
        @click="showMore = false"
      >
        <IconAdmin class="w-5 h-5" />
        <span class="text-sm">Administration</span>
      </RouterLink>

      <RouterLink
        v-if="privileges.view_other_staff_activities"
        :to="{ name: 'ActivityLog' }"
        class="dashNav"
        @click="showMore = false"
      >
        <IconActivityLog class="w-5 h-5" />
        <span class="text-sm">Activity Log</span>
      </RouterLink>

      <RouterLink :to="{ name: 'Settings' }" class="dashNav" @click="showMore = false">
        <IconSettings class="w-5 h-5" />
        <span class="text-sm">Settings</span>
      </RouterLink>

      <RouterLink :to="{ name: 'Profile' }" class="dashNav" @click="showMore = false">
        <IconProfile class="w-5 h-5" />
        <span class="text-sm">Profile</span>
      </RouterLink>
      <a
        href="https://www.gesoftech.com/"
        target="_blank"
        class="mt-6 text-center ml-[30px] text-[10px] text-gray-400 hover:text-mainColor transition-colors duration-200"
      >
        © Golden Edge Softech
      </a>
    </div>
  </nav>
</template>

<style scoped>
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
