<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import IconEmail from './IconEmail.vue'
import IconImage from './IconImage.vue'
import { useUserStore } from '@/stores/user'
import { useChatbot } from '@/composables/useChatbot'

const { mount, unmount } = useChatbot()

onMounted(() => {
  mount()
})

onBeforeUnmount(() => {
  unmount()
})

const { user } = useUserStore()
</script>

<template>
  <header>
    <div>
      <h2 class="text-gray-900 border-b-2 pb-2">Profile</h2>
      <p class="mt-5 text-gray-900 font-bold">Admin Info</p>
      <!--using gap was the best way i tried other ways-->
      <div class="mt-5 flex flex-row gap-32 border-b border-t pb-5 pt-5">
        <p class="text-gray-600 w-[150px]">Admin Name</p>
        <p v-text="user.userInfo.full_name"></p>
      </div>
      <div class="mt-5 flex flex-row gap-32 border-b pb-5">
        <p class="text-gray-600 w-[150px]">Email Address</p>
        <div class="flex flex-row gap-2 items-center justify-center">
          <IconEmail class="w-5 h-5" />
          <p v-text="user.userInfo.email"></p>
        </div>
      </div>
      <div class="mt-5 flex flex-row gap-32 border-b pb-5">
        <p class="text-gray-600 w-[150px]">Phone Number</p>
        <p v-text="user.userInfo.phone_number"></p>
      </div>
      <div class="flex flex-col gap-8 border-b pb-5">
        <div v-if="false" class="mt-5 flex flex-row gap-32">
          <p class="text-gray-600 w-[150px]">Profile Image</p>
          <IconImage class="w-10 h-10" />
        </div>
        <div class="mt-5 flex flex-row gap-32">
          <p class="text-gray-600 w-[150px]">Admin Role</p>
          <p v-text="user.userType"></p>
        </div>
      </div>
    </div>
  </header>
</template>
