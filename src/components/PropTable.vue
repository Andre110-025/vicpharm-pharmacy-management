<script setup>
import { ref, computed, onMounted, onUpdated } from 'vue'
import IconNotePad from './IconNotePad.vue'
import IconVThreeDot from './IconVThreeDot.vue'

const props = defineProps({
  tableInfo: {
    type: Array,
    default: [],
  },
  canViewInfo: {
    type: Boolean,
    default: false,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
})

const icons = ref([])

function camelCaseToSentenceCase(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .replace(/\s/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

onMounted(() => {
  props.tableInfo.forEach((data) => {
    if (data.hasOwnProperty('icon')) {
      icons.value.push(data.icon)
      delete data.icon
    }
  })
})

onUpdated(() => {
  props.tableInfo.forEach((data) => {
    if (data.hasOwnProperty('icon')) {
      icons.value.push(data.icon)
      delete data.icon
    }
  })
})
</script>

<template>
  <!-- Table -->
  <table class="w-full border-collapse bg-white">
    <!-- Table Header -->
    <thead class="bg-gray-50">
      <tr>
        <th
          v-for="(header, index) in Object.keys(tableInfo[0])"
          :key="index"
          scope="col"
          class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
        >
          {{ camelCaseToSentenceCase(header) }}
        </th>
        <th
          v-if="canEdit || canViewInfo"
          class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left"
        >
          Action
        </th>
      </tr>
    </thead>

    <!-- Table Body -->
    <tbody class="divide-y-8 divide-[#FAFAFA]">
      <tr v-for="(rowData, mainIndex) in tableInfo" :key="mainIndex" class="rounded-3xl">
        <td
          v-for="(data, index) in Object.values(rowData)"
          class="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-500"
        >
          <div class="flex flex-row gap-4">
            <p
              v-if="data === 'completed'"
              class="rounded-md py-[1px] px-2 text-[.65em] bg-green-100 text-green-900"
            >
              {{ data }}
            </p>
            <p
              v-else-if="data === 'pending'"
              class="rounded-md py-[1px] px-2 text-[.65em] bg-orange-100 text-orange-900"
            >
              {{ data }}
            </p>
            <p
              v-else-if="data === 'declined'"
              class="rounded-md py-[1px] px-2 text-[.65em] bg-red-100 text-red-900"
            >
              {{ data }}
            </p>
            <div v-else class="flex flex-row gap-2 items-center">
              <img
                v-if="Object.keys(rowData)[index] === 'stock'"
                src="#"
                :alt="icons[mainIndex]"
                class="w-6 h-6 inline-block bg-gray-400 rounded"
              />
              <p class="h-fit">{{ data }}</p>
            </div>
          </div>
        </td>
        <td v-if="canEdit || canViewInfo">
          <div class="flex space-x-2 justify-center">
            <button v-if="canEdit" class="p-1 rounded-md hover:bg-gray-100">
              <IconNotePad class="w-6 h-6" />
            </button>
            <button v-if="canViewInfo" class="p-1 rounded-md hover:bg-gray-100">
              <IconVThreeDot />
            </button>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>
