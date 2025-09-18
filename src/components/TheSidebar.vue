<script setup>
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

const userStore = useUserStore()
const { user, privileges } = storeToRefs(userStore)
</script>

<template>
  <aside
    class="fixed bottom-0 left-0 top-0 z-50 hidden w-64 overflow-y-auto bg-white py-5 px-5 lg:flex flex-col"
  >
    <div class="pb-5 flex items-center justify-center">
      <!-- <img class="w-32" src="/logo.png" alt="" /> -->

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

      <div class="pt-2.5 flex flex-row gap-2.5">
        <!-- <img class="w-10 h-10 rounded-full object-cover" src="/profile-placeholder.png" alt="" /> -->
        <div>
          <p v-text="user.userInfo?.full_name"></p>
          <!-- <p>ID: 3457</p> -->
          <RouterLink :to="{ name: 'Profile' }" class="text-mainColor"> Profile </RouterLink>
        </div>
      </div>
    </div>
  </aside>
</template>
