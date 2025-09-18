<script setup>
import { ref } from 'vue'
import ManageAdmins from './ManageAdmins.vue'
import ManageRoles from './ManageRoles.vue'

//button for sales and salesReturn
const activeTab = ref('admins')

const showItem = (item) => {
  activeTab.value = item
}
</script>

<template>
  <header>
    <h2 class="text-gray-900">Administration</h2>
    <p class="mt-2.5">Assign role to your staff here.</p>
  </header>

  <div class="mt-2.5 flex flex-row items-center space-x-4">
    <button
      class="mt-2.5 relative pb-2"
      :class="activeTab === 'admins' ? 'text-[#05716c] font-semibold' : 'text-gray-500'"
      @click="showItem('admins')"
    >
      Manage Users
      <span
        v-if="activeTab === 'admins'"
        class="absolute left-0 right-0 -bottom-1 h-[2px] bg-[#05716c] w-3/4 mx-auto"
      ></span>
    </button>

    <button
      class="mt-2.5 relative pb-2"
      :class="activeTab === 'roles' ? 'text-[#05716c] font-semibold' : 'text-gray-500'"
      @click="showItem('roles')"
    >
      Manage Roles
      <span
        v-if="activeTab === 'roles'"
        class="absolute left-0 right-0 -bottom-1 h-[2px] bg-[#05716c] w-3/4 mx-auto"
      ></span>
    </button>
  </div>

  <ManageAdmins v-if="activeTab === 'admins'" />
  <ManageRoles v-else-if="activeTab === 'roles'" />
</template>
