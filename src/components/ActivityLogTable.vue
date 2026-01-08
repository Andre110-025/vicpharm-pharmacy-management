<script setup>
const Props = defineProps({
  activityLogData: {
    type: Array,
    default: () => [],
  },
})

const returnFormatted = (dataTimeStr) => {
  const date = new Date(dataTimeStr)

  // Format parts
  const options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(date)

  const getPart = (type) => parts.find((p) => p.type === type)?.value || ''

  // Build custom format: Thu, 01 Feb 2024 | 12:55 AM
  const formatted = `${getPart('weekday')}, ${getPart('day')} ${getPart('month')} ${getPart('year')} | ${getPart('hour')}:${getPart('minute')} ${getPart('dayPeriod')}`

  //   console.log(formatted, parts, getPart)
  return formatted
}
</script>

<template>
  <div class="block min-[451px]:hidden space-y-4">
    <div
      v-for="(data, index) in activityLogData"
      :key="index"
      class="bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.99] transition"
    >
      <div class="p-4 border-b border-gray-100 flex justify-between items-start">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Admin Name</p>
          <p class="text-base font-semibold text-gray-900" v-text="data.name"></p>
        </div>

        <div class="flex flex-col text-right">
          <span class="text-xs text-gray-500 uppercase tracking-wide">Date Added</span>
          <span class="font-medium text-gray-900">{{ returnFormatted(data.created_at) }}</span>
        </div>
      </div>

      <div class="p-4 text-sm">
        <span class="text-gray-500">Log</span>
        <p class="font-medium text-gray-900 mt-1" v-text="data.action"></p>
      </div>

      <div v-if="!activityLogData.length" class="text-center py-10 text-sm text-gray-500">
        No admin activities found.
      </div>
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
            Admin Name
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Log
          </th>
          <th
            scope="col"
            class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
          >
            Date Added
          </th>
        </tr>
      </thead>

      <tbody class="divide-y-8 divide-[#FAFAFA]">
        <tr class="rounded-3xl" v-for="(data, index) in activityLogData" :key="index">
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            {{ data.name }}
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            {{ data.action }}
          </td>
          <td class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
            {{ returnFormatted(data.created_at) }}
          </td>
        </tr>

        <tr v-if="!activityLogData.length">
          <td colspan="5" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
            No admin activities found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
