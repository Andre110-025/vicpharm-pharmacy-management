<script setup>
const props = defineProps({
  incomes: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
    <div class="block min-[451px]:hidden space-y-4">
    <div
      v-for="(item, index) in incomes"
      :key="index"
      class="bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.99] transition"
    >
      <div class="p-4 border-b border-gray-100 grid grid-cols-2 gap-x-4">
        <div class="flex flex-col">
          <span class="text-gray-500 text-xs uppercase tracking-wide">Product</span>
          <span class="font-semibold text-gray-900" v-text="item.product"></span>
        </div>
        <div class="flex flex-col text-right">
          <span class="text-gray-500 text-xs uppercase tracking-wide">Quantity Sold</span>
          <span class="font-semibold text-gray-900" v-text="item.quantity"></span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-x-4 gap-y-4 p-4 text-sm">
        <div class="flex flex-col">
          <span class="text-gray-500">Sell Price</span>
          <span class="font-medium text-green-600">
            {{
              item.selling_price.toLocaleString('en-NG', {
                style: 'currency',
                currency: 'NGN',
              })
            }}
          </span>
        </div>

        <div class="flex flex-col text-right">
          <span class="text-gray-500">Profit</span>
          <span class="font-medium text-green-600">
            {{
              item.profit.toLocaleString('en-NG', {
                style: 'currency',
                currency: 'NGN',
              })
            }}
          </span>
        </div>

        <div class="flex flex-col">
          <span class="text-gray-500">Cost Price</span>
          <span class="font-medium text-gray-900">
            {{
              item.cost_price.toLocaleString('en-NG', {
                style: 'currency',
                currency: 'NGN',
              })
            }}
          </span>
        </div>

        <div class="flex flex-col text-right">
          <span class="text-gray-500">Date</span>
          <span class="font-medium text-gray-900" v-text="item.date"></span>
        </div>
      </div>
    </div>

    <div v-if="!incomes.length" class="text-center py-10 text-sm text-gray-500">
      No Income Record found.
    </div>
  </div>

  <div class="hidden min-[451px]:block overflow-x-auto">
    <table class="w-full min-w-[800px] border-collapse bg-white">
      <thead class="bg-gray-50">
        <tr>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center"
          >
            Date
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center"
          >
            Product Name
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center"
          >
            Quantity Sold
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center"
          >
            Sell Price
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center"
          >
            Cost Price
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center"
          >
            Profit
          </th>
        </tr>
      </thead>

      <tbody class="divide-y-8 divide-[#FAFAFA]">
        <tr class="rounded-3xl" v-for="(item, index) in incomes" :key="index">
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.date"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.product"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <div class="flex flex-row gap-4">
              <div class="flex flex-row gap-2 items-center">
                <p class="h-fit" v-text="item.quantity"></p>
              </div>
            </div>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p
              class="h-fit text-end"
              v-text="
                item.selling_price.toLocaleString('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                })
              "
            ></p>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p
              class="h-fit text-end"
              v-text="
                item.cost_price.toLocaleString('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                })
              "
            ></p>
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            <p
              class="h-fit text-end"
              v-text="
                item.profit.toLocaleString('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                })
              "
            ></p>
          </td>
        </tr>
        <tr v-if="!incomes.length">
          <td colspan="6" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
            No Income Record found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
