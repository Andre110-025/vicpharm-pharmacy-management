<script setup>
import { loadingState } from '@/stores/loadingStore'
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: 'Loading...',
  },
  routeName: {
    type: String,
    default: '',
  },
})

const isLoading = computed(() => {
  return loadingState.isLoading(props.routeName)
})
</script>

<template>
  <div
    v-if="isLoading"
    class="fixed inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50"
  >
    <div
      class="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"
    ></div>
    <div class="mt-4 text-lg text-gray-700">{{ text }}</div>
  </div>
</template>
