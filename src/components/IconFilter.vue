<script setup>
import { ref } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: '#515050',
  },
})
</script>

<template>
  <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5 9H14M2.75 4.5H16.25M7.25 13.5H11.75"
      :stroke="color"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
