<script setup>
import { ref, onBeforeMount } from 'vue'
import IconPlus from '@/components/IconPlus.vue'
import IconArrowBack from './IconArrowBack.vue'
import CustomerList from './CustomerList.vue'
import TopCustomerList from './TopCustomerList.vue'
import PropButtonIcon from './PropButtonIcon.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

//button for customer and Top customer
const activeTab = ref('allcustomer')

const showItem = (item) => {
  activeTab.value = item
}

const handleUrlParams = () => {
  // Get URL parameters
  const typeParam = route.query.type

  if (typeParam) {
    // Set the state filter if it exists in our filters array
    if (['allcustomer', 'topcustomer'].includes(typeParam)) {
      activeTab.value = typeParam
      // Apply filters
    }
    // getInventoryList()
  }
}

onBeforeMount(() => {
  handleUrlParams()
  // getInventoryList()
})
</script>

<template>
  <header>
    <div class="max-sm:flex max-sm:justify-between max-sm:items-center max-sm:pb-4 relative">
      <PropButtonIcon
        :icon-component="IconArrowBack"
        class="bg-gray-100 absolute left-0 sm:hidden"
      />

      <h2 class="text-gray-900 text-lg max-sm:h-fit max-sm:w-full max-sm:text-center">Customer</h2>

      <p class="mt-2.5 max-sm:hidden">Manage Your business Customer</p>

      <PropButtonIcon
        :icon-component="IconPlus"
        class="bg-mainColor sm:hidden max-sm:absolute max-sm:right-0"
      />
    </div>
    <!-- <IconArrowBack /> -->
  </header>

  <div class="mt-2.5 flex flex-row items-center space-x-4">
    <button
      class="mt-2.5 relative pb-2"
      :class="activeTab === 'allcustomer' ? 'text-[#9c417c] font-semibold' : 'text-gray-500'"
      @click="showItem('allcustomer')"
    >
      All Customer
      <span
        v-if="activeTab === 'allcustomer'"
        class="absolute left-0 right-0 -bottom-1 h-[2px] bg-[#9c417c] w-3/4 mx-auto"
      >
      </span>
    </button>

    <button
      class="mt-2.5 relative pb-2"
      :class="activeTab === 'topcustomer' ? 'text-[#9c417c] font-semibold' : 'text-gray-500'"
      @click="showItem('topcustomer')"
    >
      Customer By Performance
      <span
        v-if="activeTab === 'topcustomer'"
        class="absolute left-0 right-0 -bottom-1 h-[2px] bg-[#9c417c] w-3/4 mx-auto"
      >
      </span>
    </button>
  </div>

  <!-- Tab for all Customer -->
  <CustomerList v-if="activeTab === 'allcustomer'" />

  <!-- Tab for top Customer -->
  <TopCustomerList v-else-if="activeTab === 'topcustomer'" />
</template>
