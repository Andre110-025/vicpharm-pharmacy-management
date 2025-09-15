<script setup>
import { ref } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: 'green',
  },
})
</script>

<template>
  <svg class="w-10 h-10" viewBox="0 0 24 24" :fill="color" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 6L8 12H11V18H13V12H16L12 6Z" />
  </svg>
</template>
