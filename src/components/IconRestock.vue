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
      d="M13.25 3.84424C14.841 5.00339 15.875 6.88104 15.875 9.0002C15.875 12.521 13.0208 15.3752 9.5 15.3752H9.125M5.75 14.1561C4.159 12.997 3.125 11.1193 3.125 9.0002C3.125 5.47938 5.97918 2.6252 9.5 2.6252H9.875M10.25 16.8002L8.75 15.3002L10.25 13.8002M8.75 4.2002L10.25 2.7002L8.75 1.2002"
      :stroke="color"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
