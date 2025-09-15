import './assets/main.css'
import 'vue-final-modal/style.css'
import 'vue3-toastify/dist/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVfm } from 'vue-final-modal'
import Vue3Toasity from 'vue3-toastify'

import App from './App.vue'
import router from './router'
import './app.service'

const app = createApp(App)
app.use(createVfm())
app.use(createPinia())
app.use(Vue3Toasity, {
  autoClose: 1000,
  clearOnUrlChange: false,
})
app.use(router)

app.mount('#hephzihub')
