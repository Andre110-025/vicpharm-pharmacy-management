import { defineStore } from 'pinia'
import { useOfflineSync } from '@/composables/useOfflineSync'

export const useStoreHive = defineStore('main', {
  state: () => ({
    products: [],
    customers: [],
    activity: [],
    sales: [],
    adminRole: [],
    admin: [],
    income: [],
    inventory: [],
    creditTable: [],
    isInitialLoading: false,
  }),

  actions: {
    async initDashboard() {
      this.isInitialLoading = true

      // Define your resource mapping
      const mapping = [
        { key: 'products', path: 'products' },
        { key: 'customers', path: 'customers' },
        { key: 'activity', path: 'activities' },
        { key: 'sales', path: 'sales' },
        { key: 'income', path: 'income' },
        { key: 'inventory', path: 'inventory' },
        { key: 'creditTable', path: 'credits' },
      ]

      // 1. FAST LOAD: Load everything from local DB first
      const localLoads = mapping.map(async (item) => {
        const { loadLocal } = useOfflineSync(item.key, item.path)
        this[item.key] = await loadLocal()
      })
      await Promise.all(localLoads)
      this.isInitialLoading = false // UI is now populated and interactive!

      // 2. BACKGROUND SYNC: Update from Laravel silently
      // mapping.forEach(async (item) => {
      //   const { syncFromServer } = useOfflineSync(item.key, item.path)
      //   this[item.key] = await syncFromServer()
      // })
      mapping.forEach(async (item) => {
    const { syncFromServer } = useOfflineSync(item.key, item.path)
    const freshData = await syncFromServer();
    
    // Only update if we actually got data back
    if (freshData && freshData.length > 0) {
      // PREVENT OVERWRITE: Keep local items that are still 'pending'
      const pendingItems = this[item.key].filter(i => i.syncStatus === 'pending');
      this[item.key] = [...pendingItems, ...freshData];
    }
  })
    },
  },
})
