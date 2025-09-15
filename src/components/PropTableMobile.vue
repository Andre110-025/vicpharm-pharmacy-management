<script setup>
import { ref } from 'vue'

const props = defineProps({
  tableInfo: {
    type: Array,
    default: [
      {
        dummyName: 'Dummy Data 1',
        type: 'Dummy Type 1',
        dumData1: 'Poros',
        dumData2: 'Dore',
      },
      {
        dummyName: 'Dummy Data 2',
        type: 'Dummy Type 2',
        dumData1: 'Lorem',
        dumData2: 'Ipsum',
      },
      {
        dummyName: 'Dummy Data 3',
        type: 'Dummy Type 3',
        dumData1: 'Excelsior',
        dumData2: 'Lorem',
      },
      {
        dummyName: 'Dummy Data 3',
        type: 'Dummy Type 3',
        dumData1: 'Excelsior',
        dumData2: 'Lorem',
      },
    ],
  },
})

function camelCaseToSentenceCase(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .replace(/\s/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

</script>

<template>
  <!-- Table goes here -->
  <div class="flex flex-col gap-2">
    <div
      v-for="(rowData, mainIndex) in tableInfo"
      :key="mainIndex"
      class="w-full flex justify-between bg-gray-100 border-2 border-gray-200 rounded-md p-4 mobTableRow flex-wrap gap-4"
    >
      <div v-for="(keyID, index) in Object.keys(rowData)" class="flex flex-col gap-1">
        <p class="text-gray-500 text-xs">{{ camelCaseToSentenceCase(keyID) }}</p>
        <p class="text-base text-gray-800">{{ rowData[keyID] }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
div.mobTableRow > div {
  @apply odd:items-start even:items-end min-w-[45%];
}
</style>
