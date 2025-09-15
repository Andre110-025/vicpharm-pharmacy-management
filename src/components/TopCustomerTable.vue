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
  <div class="w-full overflow-x-auto">
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
