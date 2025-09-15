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
    class="w-6 h-6 text-black"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :fill="color"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <circle cx="12" cy="6" r="1.2" />
    <circle cx="12" cy="12" r="1.2" />
    <circle cx="12" cy="18" r="1.2" />
  </svg>
</template>
