<script setup>
defineProps({
  active: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <rect
      x="2"
      y="6"
      width="20"
      height="12"
      rx="6"
      :fill="active ? '#4ADE80' : '#F87171'"
      :stroke="active ? '#16A34A' : '#DC2626'"
    />
    <circle :cx="active ? '16' : '8'" cy="12" r="4" fill="white" />
  </svg>
</template>
