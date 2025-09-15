<script setup>
import { ref } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: '#fff',
  },
})
</script>

<template>
  <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9.5 3.75V14.25M4.25 9H14.75"
      :stroke="color"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
