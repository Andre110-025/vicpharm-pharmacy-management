import { db } from '@/db';
import axios from '@/app.service'; // Use your hijacked axios

export function useOfflineSync(tableName, endpoint) {
  // Get data from local Dexie
  const loadLocal = async () => {
    return await db[tableName].toArray();
  };

  // Get data from Laravel and cache it
  const syncFromServer = async () => {
    if (!navigator.onLine) { 
      console.log('Offline, cannot sync from server.');
      return await loadLocal();
    }
    try {
      const res = await axios.get(endpoint);
      const data = res.data?.data || res.data; // Handle Laravel resource wrappers
      
      // Update Dexie so it's ready for the next offline session
      await db[tableName].clear(); // Optional: clear old data first
      await db[tableName].bulkPut(data);
      
      return data;
    } catch (err) {
      if (navigator.onLine) {
        console.warn(`Sync failed for ${tableName}, using local.`);
      }
      return await loadLocal();
    }
  };

  return { loadLocal, syncFromServer };
}