<script setup>
import { ref } from 'vue'
import IconCheckCertificate from './IconCheckCertificate.vue'
import IconSearch from './IconSearch.vue'
import IconImage from './IconImage.vue'
import IconCancel from './IconCancel.vue'
import { VueFinalModal } from 'vue-final-modal'

//Telling current time of transactions
const currentTime = ref(getCurrentTime())

function getCurrentTime() {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

let interval
onMounted(() => {
  interval = setInterval(() => {
    currentTime.value = getCurrentTime()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<template>
  <div class="flex w-full h-full">
    <!-- Left Section -->
    <div class="flex-1 p-6">
      <div class="flex flex-row items-start gap-4">
        <div
          class="mt-1.5 w-10 h-10 bg-[rgba(175,53,133,0.1)] rounded-sm flex items-center justify-center"
        >
          <IconCheckCertificate color="#9c417c" />
        </div>
        <div class="flex flex-col justify-center">
          <h2 class="text-lg font-semibold">Make a Sale</h2>
          <p class="text-gray-600">Select from your stock to make sales easily.</p>
        </div>
      </div>
      <div class="relative w-[420px] mt-6">
        <IconSearch
          class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search for Product"
          class="w-full pl-10 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-mainColor"
        />
      </div>
      <!--products. table or div?-->
      <div class="flex flex-col mt-2.5 gap-3">
        <div
          v-for="(item, index) in 6"
          :key="index"
          class="flex flex-row justify-between items-center"
        >
          <div class="flex flex-row gap-1 items-center">
            <IconImage class="w-8 h-8" />
            <p>Paracetamol</p>
          </div>
          <div><p class="text-gray-400">8 left</p></div>
        </div>
      </div>
    </div>
    <!-- Right Section -->
    <div class="bg-[#f7f8fa] flex-1 p-5 h-[599px] rounded-tr-2xl rounded-br-2xl">
      <div class="flex flex-col justify-between h-[460px] p-5 bg-white rounded-md shadow">
        <div>
          <div class="flex flex-row justify-between items-center">
            <div class="flex flex-col gap-1">
              <h4 class="text-sm font-semibold">CUSTOMER RECEIPT</h4>
              <div class="flex flex-row gap-4">
                <p class="text-gray-500 text-sm">Order #001</p>
                <p class="text-gray-500 text-sm">19 Nov 2024</p>
              </div>
            </div>
            <button class="border border-black rounded p-1 flex items-center justify-center">
              <IconCancel color="black" class="w-5 h-5" />
            </button>
          </div>
          <div
            class="mt-3 flex flex-col border-t-2 border-b-2 border-dotted border-gray-300 pt-2 pb-2"
          >
            <p>ITEM</p>
            <div class="p-1 flex flex-row justify-between">
              <h6 class="text-gray-500 text-sm">Solar Panels</h6>
              <h6 class="text-gray-500 text-sm">1</h6>
              <h6 class="text-gray-500 text-sm">₦10,000</h6>
            </div>
            <div class="p-1 flex flex-row justify-between">
              <h6 class="text-gray-500 text-sm">Anti Biotices</h6>
              <h6 class="text-gray-500 text-sm">1</h6>
              <h6 class="text-gray-500 text-sm">₦74,000</h6>
            </div>
            <div class="p-1 flex flex-row justify-between">
              <h6 class="text-gray-500 text-sm">Asprin Tablet</h6>
              <h6 class="text-gray-500 text-sm">1</h6>
              <h6 class="text-gray-500 text-sm">₦50,000</h6>
            </div>
            <div class="mt-4 flex flex-row justify-between">
              <h6 class="">TOTAL</h6>
              <h6 class="">3</h6>
              <h6 class="">₦234,000</h6>
            </div>
          </div>
        </div>
        <div>
          <h6 class="text-center text-gray-400">THANK YOU FOR YOUR PURCHASE!</h6>
          <p class="text-center text-gray-400">{{ currentTime }}</p>
        </div>
      </div>
      <button class="mt-8 w-full mainBtn transition duration-300" type="submit">
        Complete Sale
      </button>
    </div>
  </div>
</template>
