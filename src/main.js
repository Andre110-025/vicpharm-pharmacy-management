// import './assets/main.css'
// import 'vue-final-modal/style.css'
// import 'vue3-toastify/dist/index.css'
// import { registerSW } from 'virtual:pwa-register'

// import { createApp } from 'vue'
// import { createPinia } from 'pinia'
// import { createVfm } from 'vue-final-modal'
// import Vue3Toasity from 'vue3-toastify'

// import App from './App.vue'
// import router from './router'
// import './app.service'

// registerSW({
//   onNeedRefresh() {},
//   onOfflineReady() {
//     // console.log('App ready to work offline')
//   }
// })

// const updateSW = registerSW({
//   onNeedRefresh() {},
//   onOfflineReady() {},
//   onRegistered(registration) {
//     console.log('🎯 Service Worker registered:', registration)
//     console.log('📡 Scope:', registration?.scope)
//   },
//   onRegisterError(error) {
//     console.error('❌ Service Worker registration error:', error)
//   },
// })

// // Check if already installed
// if (window.matchMedia('(display-mode: standalone)').matches) {
//   console.log('🏠 App is already installed as PWA')
// }

// const app = createApp(App)
// app.use(createVfm())
// app.use(createPinia())
// app.use(Vue3Toasity, {
//   autoClose: 1000,
//   clearOnUrlChange: false,
// })
// app.use(router)

// app.mount('#hephzihub')

// if (import.meta.env.DEV) {
//   window.updatePWA = updateSW
// }

// import { registerSW } from 'virtual:pwa-register'

// registerSW({ immediate: true })
// import './assets/main.css'
// import 'vue-final-modal/style.css'
// import 'vue3-toastify/dist/index.css'

// import { createApp } from 'vue'
// import { createPinia } from 'pinia'
// import { createVfm } from 'vue-final-modal'
// import Vue3Toasity from 'vue3-toastify'

// import App from './App.vue'
// import router from './router'
// import './app.service'

// // incase of emergency delete this shiit
// import axios from '@/app.service';
// import { db } from '@/db';

// const processSyncQueue = async () => {
//   if (!navigator.onLine) return;

//   const tasks = await db.syncQueue.toArray();
//   for (const task of tasks) {
//     try {
//       await axios({
//         method: task.method,
//         url: task.endpoint,
//         data: task.payload
//       });
//       await db.syncQueue.delete(task.id);
//     } catch (e) {
//       console.error("Sync failed for item", task.id);
//     }
//   }
// };

// // Sync whenever connection is restored
// window.addEventListener('online', processSyncQueue);
// // Also try to sync every minute just in case
// setInterval(processSyncQueue, 60000);

// const app = createApp(App)
// app.use(createVfm())
// app.use(createPinia())
// app.use(Vue3Toasity, {
//   autoClose: 1000,
//   clearOnUrlChange: false,
// })
// app.use(router)

// app.mount('#hephzihub')

// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     // This MUST be in your /public folder
//     navigator.serviceWorker
//       .register('/sw.js')
//       .then((reg) => console.log('✅ PWA Service Worker Registered!', reg.scope))
//       .catch((err) => console.error('❌ PWA Service Worker Failed!', err))
//   })
// }

import { registerSW } from 'virtual:pwa-register'
import './assets/main.css'
import 'vue-final-modal/style.css'
import 'vue3-toastify/dist/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVfm } from 'vue-final-modal'
import Vue3Toasity from 'vue3-toastify'
import { useStoreHive } from '@/stores/inventory'

import App from './App.vue'
import router from './router'
import './app.service' 

import axiosRaw from 'axios' // Standard axios for background sync
import { db } from '@/db'

// Initialize Service Worker
registerSW({ immediate: true })

// main.js
const processSyncQueue = async () => {
  if (!navigator.onLine) return;

  const tasks = await db.syncQueue.toArray();
  if (tasks.length === 0) return;

  const store = useStoreHive();

  for (const task of tasks) {
    try {
      const userData = JSON.parse(window.localStorage.getItem('vicPharmUnique') || '{}');
      
      // --- FIX URL LOGIC ---
      let finalUrl = task.endpoint;
      if (!finalUrl.startsWith('http')) {
        const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, "");
        const cleanEndpoint = task.endpoint.startsWith('/') ? task.endpoint : `/${task.endpoint}`;
        finalUrl = `${baseUrl}${cleanEndpoint}`;
      }
      
      const response = await axiosRaw({
        method: task.method,
        url: finalUrl,
        data: task.payload,
        headers: {
          'Authorization': `Bearer ${userData?.token}`,
          'Content-Type': 'application/json'
        }
      });

      // --- GENERIC DATABASE UPDATER ---
      // This part looks at the task type and updates Dexie + Pinia
      const serverData = response.data;
      const realId = serverData.id || serverData.Data?.id || serverData.customer?.id || serverData.product?.id;

      // Map task types to Dexie tables and Pinia keys
      const typeMap = {
        'ADD_CUSTOMER': { table: 'customers', storeKey: 'customers', matchField: 'phone' },
        'EDIT_CUSTOMER': { table: 'customers', storeKey: 'customers', matchField: 'id' },
        'ADD_PRODUCT': { table: 'products', storeKey: 'products', matchField: 'sku' },
        'MAKE_SALE': { table: 'sales', storeKey: 'sales', matchField: 'invoice_number' }
      };

      const mapping = typeMap[task.type];

      if (mapping && realId) {
        // 1. Find the local temporary record
        const tempRecord = await db[mapping.table]
          .where(mapping.matchField)
          .equals(task.payload[mapping.matchField])
          .first();

        if (tempRecord) {
          // 2. Remove temp, Add real to Dexie
          await db[mapping.table].delete(tempRecord.id);
          const syncedRecord = { ...task.payload, id: realId, syncStatus: 'synced' };
          await db[mapping.table].put(syncedRecord);
          
          // 3. Update Pinia Store immediately
          const index = store[mapping.storeKey].findIndex(item => item[mapping.matchField] === task.payload[mapping.matchField]);
          if (index !== -1) {
            store[mapping.storeKey][index] = syncedRecord;
          } else {
            store[mapping.storeKey].push(syncedRecord);
          }
        }
      }

      await db.syncQueue.delete(task.id);
      console.log(`✅ Synced ${task.type}: ${task.endpoint}`);

      } catch (e) {
      console.error(`❌ Sync failed for ${task.type}`, e.response?.data)

      // 🔥 Remove it so it doesn't loop forever
      await db.syncQueue.delete(task.id)

      continue
    }
    // } catch (e) {
    //   console.error(`❌ Sync failed for ${task.type} (ID: ${task.id})`, e);
    //   // If it's a 404 or 400, it's a "bad request" - delete it so it doesn't block the queue
    //   if (e.response?.status >= 400 && e.response?.status < 500) {
    //      await db.syncQueue.delete(task.id);
    //   }
    //   continue; // Skip to next item
    // }
  }
};

// const processSyncQueue = async () => {
//   if (!navigator.onLine) return;

//   const tasks = await db.syncQueue.toArray();
//   if (tasks.length === 0) return;

//   for (const task of tasks) {
//     try {
//       // Get the token directly from storage for the raw call
//       const userData = JSON.parse(window.localStorage.getItem('vicPharmUnique') || '{}');
      
//       let finalUrl = task.endpoint;
      
//       // Only add the base URL if the endpoint is a partial path (like 'addCustomer')
//       if (!finalUrl.startsWith('http')) {
//         const baseUrl = import.meta.env.VITE_API_URL.endsWith('/') 
//           ? import.meta.env.VITE_API_URL 
//           : import.meta.env.VITE_API_URL + '/';
//         finalUrl = baseUrl + task.endpoint;
//       }

//       await axiosRaw({
//         method: task.method,
//         url: finalUrl, // Use the cleaned up URL
//         data: task.payload,
//         headers: {
//           'Authorization': `Bearer ${userData?.token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       // await axiosRaw({
//       //   method: task.method,
//       //   url: import.meta.env.VITE_API_URL + task.endpoint,
//       //   data: task.payload,
//       //   headers: {
//       //     'Authorization': `Bearer ${userData?.token}`,
//       //     'Content-Type': 'application/json'
//       //   }
//       // });
//       await db.syncQueue.delete(task.id);
//       console.log(`✅ Synced: ${task.endpoint}`);
//     } catch (e) {
//       console.error("❌ Sync failed for item", task.id, e);
//       break; // Stop and retry later
//     }
//   }
// };

window.addEventListener('online', processSyncQueue);
setInterval(processSyncQueue, 60000);

const app = createApp(App)
app.use(createVfm())
app.use(createPinia())
app.use(Vue3Toasity, {
  autoClose: 3000,
  clearOnUrlChange: false,
})
app.use(router)

app.mount('#hephzihub')

// import { registerSW } from 'virtual:pwa-register'
// import './assets/main.css'
// import 'vue-final-modal/style.css'
// import 'vue3-toastify/dist/index.css'

// import { createApp } from 'vue'
// import { createPinia } from 'pinia'
// import { createVfm } from 'vue-final-modal'
// import Vue3Toasity from 'vue3-toastify'

// import App from './App.vue'
// import router from './router'
// import './app.service'

// import axiosRaw from 'axios' // Standard axios for background sync
// import { db } from '@/db'

// // Initialize Service Worker
// registerSW({ immediate: true })

// const processSyncQueue = async () => {
//   if (!navigator.onLine) return

//   const tasks = await db.syncQueue.toArray()
//   if (tasks.length === 0) return

//   const store = useStoreHive()

//   for (const task of tasks) {
//     try {
//       const userData = JSON.parse(window.localStorage.getItem('vicPharmUnique') || '{}')

//       // --- FIX URL LOGIC ---
//       let finalUrl = task.endpoint
//       if (!finalUrl.startsWith('http')) {
//         const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '')
//         const cleanEndpoint = task.endpoint.startsWith('/') ? task.endpoint : `/${task.endpoint}`
//         finalUrl = `${baseUrl}${cleanEndpoint}`
//       }

//       const response = await axiosRaw({
//         method: task.method,
//         url: finalUrl,
//         data: task.payload,
//         headers: {
//           Authorization: `Bearer ${userData?.token}`,
//           'Content-Type': 'application/json',
//         },
//       })

//       // --- GENERIC DATABASE UPDATER ---
//       // This part looks at the task type and updates Dexie + Pinia
//       const serverData = response.data
//       const realId =
//         serverData.id || serverData.Data?.id || serverData.customer?.id || serverData.product?.id

//       // Map task types to Dexie tables and Pinia keys
//       const typeMap = {
//         ADD_CUSTOMER: { table: 'customers', storeKey: 'customers', matchField: 'phone' },
//         EDIT_CUSTOMER: { table: 'customers', storeKey: 'customers', matchField: 'id' },
//         ADD_PRODUCT: { table: 'products', storeKey: 'products', matchField: 'sku' },
//         MAKE_SALE: { table: 'sales', storeKey: 'sales', matchField: 'invoice_number' },
//       }

//       const mapping = typeMap[task.type]

//       if (mapping && realId) {
//         // 1. Find the local temporary record
//         const tempRecord = await db[mapping.table]
//           .where(mapping.matchField)
//           .equals(task.payload[mapping.matchField])
//           .first()

//         if (tempRecord) {
//           // 2. Remove temp, Add real to Dexie
//           await db[mapping.table].delete(tempRecord.id)
//           const syncedRecord = { ...task.payload, id: realId, syncStatus: 'synced' }
//           await db[mapping.table].put(syncedRecord)

//           // 3. Update Pinia Store immediately
//           const index = store[mapping.storeKey].findIndex(
//             (item) => item[mapping.matchField] === task.payload[mapping.matchField],
//           )
//           if (index !== -1) {
//             store[mapping.storeKey][index] = syncedRecord
//           } else {
//             store[mapping.storeKey].push(syncedRecord)
//           }
//         }
//       }

//       await db.syncQueue.delete(task.id)
//       console.log(`✅ Synced ${task.type}: ${task.endpoint}`)
//     } catch (e) {
//       console.error(`❌ Sync failed for ${task.type} (ID: ${task.id})`, e)
//       // If it's a 404 or 400, it's a "bad request" - delete it so it doesn't block the queue
//       if (e.response?.status >= 400 && e.response?.status < 500) {
//         await db.syncQueue.delete(task.id)
//       }
//       continue // Skip to next item
//     }
//   }
// }

// window.addEventListener('online', processSyncQueue)
// setInterval(processSyncQueue, 60000)

// const app = createApp(App)
// app.use(createVfm())
// app.use(createPinia())
// app.use(Vue3Toasity, {
//   autoClose: 3000,
//   clearOnUrlChange: false,
// })
// app.use(router)

// app.mount('#hephzihub')
