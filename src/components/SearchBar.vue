<script setup>
import IconSearch from './IconSearch.vue'

const model = defineModel()
</script>

<template>
  <div class="relative w-64">
    <IconSearch class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      type="text"
      placeholder="Search...."
      v-model="model"
      class="w-full pl-10 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-1 focus:ring-mainColor"
    />
  </div>
</template>
