<script setup>
import { ref } from 'vue'

const props = defineProps({
  topCustomer: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="block min-[451px]:hidden space-y-4">
    <div
      v-for="(item, index) in topCustomer"
      :key="index"
      class="bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.99] transition"
    >
      <div class="p-4 border-b border-gray-100">
        <p class="text-xs text-gray-500 uppercase tracking-wide">Customer Name</p>
        <p class="text-base font-semibold text-gray-900" v-text="item.customer"></p>
      </div>

      <div class="grid grid-cols-2 gap-x-4 gap-y-5 p-4 text-sm">
        <div class="flex flex-col">
          <span class="text-gray-500">Phone</span>
          <span class="font-medium text-gray-900" v-text="item.customer_number"></span>
        </div>

        <div class="flex flex-col text-right">
          <span class="text-gray-500">Total Sales</span>
          <span class="font-semibold text-green-600">
            {{
              item.total_amount.toLocaleString('en-NG', {
                style: 'currency',
                currency: 'NGN',
              })
            }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="!topCustomer.length" class="text-center py-10 text-sm text-gray-500">
      No top customers found.
    </div>
  </div>
  <div class="hidden min-[451px]:block w-full overflow-x-auto">
    <table class="w-full border-collapse bg-white">
      <thead class="bg-gray-50">
        <tr>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Customer Name
          </th>
          <!-- <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Email Address
          </th> -->
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Contact Number
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center"
          >
            Total Sales
          </th>
        </tr>
      </thead>

      <tbody class="divide-y-8 divide-[#FAFAFA]">
        <tr class="rounded-3xl" v-for="(item, index) in topCustomer" :key="index">
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p class="h-fit" v-text="item.customer"></p>
          </td>
          <!-- <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p class="h-fit" v-text="item.customer_email"></p>
          </td> -->
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p class="h-fit" v-text="item.customer_number"></p>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p
              class="h-fit text-end"
              v-text="
                item.total_amount.toLocaleString('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                })
              "
            ></p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
