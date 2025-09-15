<script setup>
import { ref } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: '#25ae80',
  },
})
</script>

<template>
  <svg
    version="1.1"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    stroke="currentColor"
  >
    <path
      d="m12 1.763-6.2061 6.382a0.8154 0.8154 0 0 0 0.017955 1.1558 0.8154 0.8154 0 0 0 1.1522-0.01801l4.2212-4.3431v16.483c3.31e-4 0.44986 0.36494 0.81447 0.8148 0.8148 0.44986-3.29e-4 0.81447-0.36493 0.8148-0.8148v-16.483l4.2212 4.3432a0.8154 0.8154 0 0 0 1.1522 0.018011 0.8154 0.8154 0 0 0 0.01801-1.1558z"
      stroke-linecap="round"
      stroke-width="2"
    />
  </svg>
</template>
