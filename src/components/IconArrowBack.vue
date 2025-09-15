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
  <svg version="1.1" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" :stroke="props.color" class="min-w-4 max-w-4">
    <path
      d="m20.478 5.0785-8.9556 10.922 8.9556 10.922"
      fill="#0000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="3.5"
    />
  </svg>
</template>
