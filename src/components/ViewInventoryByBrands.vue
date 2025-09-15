<script setup>
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import PropPaginator from './PropPaginator.vue'
import IconFilter from './IconFilter.vue'
import PropButtonIcon from './PropButtonIcon.vue'
import PropFilter from './PropFilter.vue'
import { useHelpers } from '@/helper'

const { formatDate } = useHelpers()

const { user, privileges } = useUserStore()
const isLoading = ref(false)

const inventory = ref(null)
const showDateFilter = ref(false)
const endDate = new Date()

const dateFilter = reactive({
  user_type: user.userType,
  start: '01/01/2025',
  end: formatDate(endDate),
})

const getInventoryList = async (page = 1) => {
  try {
    isLoading.value = true
    inventory.value = null
    //searchSellingProductByOwner/owner?search=dangote&page=1
    const response = await axios.post(`stockbybrand?page=${page}`, dateFilter)

    if (response.status === 201 || response.data.success) {
      inventory.value = response.data.Product
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error fetching Data:', error)
    // Handle error state
    isLoading.value = false
  }
}

onMounted(() => {
  getInventoryList()
})
</script>

<template>
  <header>
    <div>
      <h2 class="text-gray-900">Inventory By Brands</h2>
      <p class="mt-2.5">Monitor your stock level by brands</p>
    </div>
  </header>

  <!-- Desktop Filter Section -->
  <div class="flex justify-end items-center w-full p-4 mt-2.5 max-xs:p-2 max-sm:hidden">
    <div class="flex gap-2.5 justify-end">
      <PropButtonIcon
        class="border-gray-400 text-black hover:bg-gray-100 transition"
        :icon-component="IconFilter"
        text="Filter Date"
        @click="showDateFilter = true"
      />
    </div>
  </div>

  <!-- Filter Popup -->
  <div class="relative">
    <PropFilter
      :dateFilter="dateFilter"
      v-model:showFilter="showDateFilter"
      @changeDate="updateDate"
    />
  </div>

  <div class="w-full overflow-hidden rounded-lg">
    <div v-if="!isLoading && inventory" class="w-full overflow-x-auto">
      <table class="w-full border-collapse bg-white">
        <thead class="bg-gray-50">
          <tr>
            <th
              scope="col"
              class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
            >
              Brand
            </th>
            <th
              scope="col"
              class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-end"
            >
              Stock Value
            </th>
            <th
              scope="col"
              class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-end"
            >
              Product Quantity
            </th>
          </tr>
        </thead>

        <tbody class="divide-y-8 divide-[#FAFAFA]">
          <tr class="rounded-3xl" v-for="(item, index) in inventory.data" :key="index">
            <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
              <div class="flex flex-row gap-4">
                <div class="flex flex-row gap-2 items-center">
                  <p class="h-fit" v-text="item.brand"></p>
                </div>
              </div>
            </td>
            <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
              <p
                class="h-fit text-end"
                v-text="
                  item.stock_value.toLocaleString('en-NG', {
                    style: 'currency',
                    currency: 'NGN',
                  })
                "
              ></p>
            </td>
            <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
              <p class="h-fit text-end" v-text="item.product_count.toLocaleString()"></p>
            </td>
          </tr>

          <tr v-if="!inventory.data.length">
            <td colspan="3" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
              No Products found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="isLoading" class="h-24 flex justify-center items-center bg-white">
      <div
        class="animate-spin rounded-full h-8 w-8 border-2 border-mainColor border-t-transparent"
      ></div>
    </div>

    <!-- Updated Paginator implementation -->
    <PropPaginator
      v-if="inventory && !isLoading"
      :pagination="inventory"
      :show-info="true"
      @page-changed="getInventoryList"
      :limit="2"
      :keepLength="false"
    />
  </div>
</template>
