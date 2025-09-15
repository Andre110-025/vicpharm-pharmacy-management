<script setup>
import { ref } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: '#f9f9f9',
  },
})
</script>

<template>
  <svg version="1.1" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" :fill="color">
    <path
      d="m21.779 11.907-6.382-6.2061a0.8154 0.8154 0 0 0-1.1558 0.017955 0.8154 0.8154 0 0 0 0.01801 1.1522l4.3431 4.2212-16.483 1e-6c-0.44986 3.3e-4 -0.81447 0.36494-0.8148 0.8148 3.291e-4 0.44987 0.36493 0.81447 0.8148 0.8148h16.483l-4.3432 4.2212a0.8154 0.8154 0 0 0-0.01801 1.1522 0.8154 0.8154 0 0 0 1.1558 0.01801z"
      stroke-linecap="round"
      stroke-width="1.8378"
    />
  </svg>
</template>
