<script>
import './assets/main.css'
import 'vue-final-modal/style.css'
import 'vue3-toastify/dist/index.css'
import { registerSW } from 'virtual:pwa-register'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVfm } from 'vue-final-modal'
import Vue3Toasity from 'vue3-toastify'

import App from './App.vue'
import router from './router'
import './app.service'

// Enhanced PWA registration with debugging
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('🔄 New content available, please refresh.')
  },
  onOfflineReady() {
    console.log('✅ App ready to work offline')
  },
  onRegistered(registration) {
    console.log('🎯 Service Worker registered:', registration)
    console.log('📡 Scope:', registration?.scope)
  },
  onRegisterError(error) {
    console.error('❌ Service Worker registration error:', error)
  }
})

// Log PWA status
console.log('📱 PWA Status Check:')
console.log('- Secure Context:', window.isSecureContext)
console.log('- Localhost:', window.location.hostname === 'localhost')
console.log('- Service Worker Support:', 'serviceWorker' in navigator)
console.log('- Display Mode:', window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser')

// Check if already installed
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('🏠 App is already installed as PWA')
}

const app = createApp(App)
app.use(createVfm())
app.use(createPinia())
app.use(Vue3Toasity, {
  autoClose: 1000,
  clearOnUrlChange: false,
})
app.use(router)

app.mount('#hephzihub')

// Export for manual update if needed
if (import.meta.env.DEV) {
  window.updatePWA = updateSW
}

</script>

<script setup>
import { ref, onMounted } from 'vue'

const showSplash = ref(false)

onMounted(() => {
  // Check if running as installed PWA (not browser)
  const isPWA = window.matchMedia('(display-mode: standalone)').matches
  
  if (isPWA) {
    showSplash.value = true
    setTimeout(() => {
      showSplash.value = false
    }, 3000)
  }
})
</script>

<template>
  <div v-if="showSplash" class="splash-screen">
    <img src="/your-gif.gif" alt="Loading" />
  </div>
  
  <div v-else>
    <RouterView />
  </div>
</template>
