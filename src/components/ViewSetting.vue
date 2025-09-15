<script setup>
import { ref } from 'vue'
import IconLogout from './IconLogout.vue'
import IconNotification from './IconNotification.vue'
import IconPasswordLock from './IconPasswordLock.vue'
import IconButtonNotification from './IconButtonNotification.vue'
import SettingPasswordChange from './SettingPasswordChange.vue'
import { useUserStore } from '@/stores/user'

const { logOut } = useUserStore()

const activeSetting = ref('setting1')
</script>

<template>
  <header>
    <div>
      <h2 class="text-gray-900">Setting</h2>
      <p class="mt-2.5">Configure your dashboard</p>
    </div>
  </header>

  <div class="w-full min-h-[80vh] border-2 border-gray-200 mt-7 flex flex-row gap-6">
    <!--Three buttons (convert to div)-->
    <div
      class="flex flex-col justify-between h-full min-h-[400px] w-[350px] border-r border-gray-100"
    >
      <!-- Top Section -->
      <div class="flex-1">
        <div
          @click="activeSetting = 'setting1'"
          class="flex flex-row items-start space-x-2 transition w-100 p-2 cursor-pointer border-b"
          :class="{ 'bg-gray-100': activeSetting === 'setting1' }"
        >
          <div class="w-6 h-6 bg-[#f43c3e] flex items-center justify-center rounded">
            <IconPasswordLock class="w-4 h-4 text-white" />
          </div>
          <div class="text-left">
            <h6 class="font">Password</h6>
            <p class="text-xs text-gray-600">
              Secure your account by setting up or changing your password
            </p>
          </div>
        </div>
        <div
          @click="activeSetting = 'setting2'"
          class="flex flex-row items-start space-x-2 transition w-100 p-2 cursor-pointer border-b"
          :class="{ 'bg-gray-100': activeSetting === 'setting2' }"
          v-if="false"
        >
          <div class="w-6 h-6 bg-[#763ce8] flex items-center justify-center rounded">
            <IconNotification class="w-4 h-4 text-white" />
          </div>
          <div class="text-left">
            <h6 class="font">Notification Center</h6>
            <p class="text-xs text-gray-600">
              Stay updated on the activities going on in your<br />dashboard
            </p>
          </div>
        </div>
      </div>
      <!-- Bottom (Logout Button) -->
      <div>
        <button @click="logOut()" class="flex flex-row items-center space-x-2">
          <div class="w-6 h-6 bg-[#1bb56f] flex items-center justify-center rounded">
            <IconLogout class="w-4 h-4 text-white" />
          </div>
          <div class="text-left">
            <h6 class="font-semibold">Log out</h6>
          </div>
        </button>
      </div>
    </div>

    <!--Call to action section for change password-->
    <SettingPasswordChange v-if="activeSetting === 'setting1'" />

    <!--Call to action section for Notification-->
    <div v-if="activeSetting === 'setting2'" class="w-[700px] p-2">
      <div class="flex flex-col gap-3">
        <div class="border-b h-20 flex flex-col justify-center">
          <h6 class="font-bold">Notification Center</h6>
          <p class="text-gray-500 text-xs">View and change your notification settings</p>
        </div>
        <div class="flex flex-col">
          <div class="h-20 flex flex-row items-center">
            <div class="flex flex-row items-start gap-4">
              <IconButtonNotification class="w-8 h-8" />
              <div>
                <h6 class="text-sm">In-App Notification</h6>
                <p class="text-gray-500 text-xs">Get Notification In-app</p>
              </div>
            </div>
          </div>
          <div class="border-b h-20 flex flex-row items-center">
            <div class="flex flex-row items-start gap-4">
              <IconButtonNotification class="w-8 h-8" />
              <div>
                <h6 class="text-sm">Every Status update</h6>
                <p class="text-gray-500 text-xs">Notify me on every status update</p>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-row items-center justify-between">
          <div class="flex flex-col justify-center">
            <h6 class="font-bold">Confiqure credit notification</h6>
            <p class="text-gray-500 text-xs">
              Get notified when credit transactions get to a<br />Particular treshold
            </p>
          </div>
          <div class="mr-4">
            <select
              id="credit"
              name="credit"
              class="w-60 h-[40px] border border-gray-400 px-4 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-mainColor"
            >
              <option value="5 days to due date">5 days to due date</option>
              <option value="10 days to due date">10 days to due date</option>
              <option value="15 days to due date">15 days to due date</option>
              <option value="20 days to due date">20 days to due date</option>
              <option value="25 days to due date">25 days to due date</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
