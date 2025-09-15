<template>
  <div class="fixed top-0 left-0 right-0 z-[999999]" :style="{ height: `${height}px` }">
    <div
      class="relative h-full transition-opacity duration-400"
      :class="isLoading ? 'transition-width duration-100' : ''"
      :style="{
        width: loading ? `${percentage}%` : '0%',
        opacity: loading ? 1 : 0,
        backgroundColor: color,
      }"
    ></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useLoadingStore } from '@/stores/loadingStore'

// Define props
const props = defineProps({
  color: {
    type: String,
    default: '#00DC82', // Nuxt's default loading bar color
  },
  height: {
    type: Number,
    default: 3,
  },
})

const loadingStore = useLoadingStore()

const loading = ref(false)
const percentage = ref(0)
const isLoading = ref(false)

// Interval for progress animation
let interval = null

const startLoading = () => {
  loading.value = true
  isLoading.value = true
  percentage.value = 0

  // Animate the loading progress
  interval = setInterval(() => {
    if (percentage.value < 80) {
      percentage.value += Math.floor(Math.random() * 5) + 1
    }
  }, 200)
}

const finishLoading = () => {
  percentage.value = 100

  // Clear the animation interval
  if (interval) {
    clearInterval(interval)
    interval = null
  }

  // Wait for the animation to complete
  setTimeout(() => {
    loading.value = false
    isLoading.value = false
  }, 500)
}

// Watch for loading state changes
watch(
  () => loadingStore.isLoading,
  (newValue) => {
    if (newValue) {
      startLoading()
    } else {
      finishLoading()
    }
  },
)

onMounted(() => {
  // Subscribe to loading state changes
  if (loadingStore.isLoading) {
    startLoading()
  } else {
    if (loadingStore.isLoading) {
      loadingStore.finishLoading()
    }
  }
})

onUnmounted(() => {
  if (interval) {
    clearInterval(interval)
  }
})
</script>
