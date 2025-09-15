<script setup>
const props = defineProps({
  iconComponent: {
    type: Object,
    required: true,
  },
  text: {
    type: String,
  },
})
</script>

<template>
  <button class="flex flex-row gap-2 secondaryBtn justify-center items-center">
    <iconComponent class="h-4 w-4" :is="props.iconComponent" />
    <p class="h-fit max-md:hidden p-0 m-0">
      {{ text }}
    </p>
  </button>
</template>
