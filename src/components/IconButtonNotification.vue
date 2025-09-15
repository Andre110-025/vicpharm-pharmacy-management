<script setup>
import { ref } from "vue";

const isOn = ref(false);
</script>

<template>
  <svg
    width="100"
    height="50"
    viewBox="0 0 100 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    @click="isOn = !isOn"
    style="cursor: pointer;"
  >
    <rect
      width="100"
      height="50"
      rx="25"
      :fill="isOn ? '#9c417c' : '#ccc'"
      class="transition-colors duration-300 ease-in-out"
    />
    
    <circle
      :cx="isOn ? 75 : 25"
      cy="25"
      r="20"
      fill="white"
      class="transition-all duration-300 ease-in-out"
    />
  </svg>
</template>
