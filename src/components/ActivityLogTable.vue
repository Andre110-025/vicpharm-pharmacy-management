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
  <div class="w-full overflow-x-auto">
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
