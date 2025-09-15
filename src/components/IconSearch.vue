<script setup>
import { ref } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: '#888',
  },
})
</script>

<template>
  <svg
    class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    :stroke="color"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3 7.5 7.5 0 0016.65 16.65z"
    />
  </svg>
</template>
