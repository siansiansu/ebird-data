// Simple IndexedDB wrapper for eBird data storage
class EBirdIDB {
  constructor() {
    this.dbName = 'EBirdStorage';
    this.version = 1;
    this.storeName = 'dataCache';
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('[IDB] Database error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[IDB] Database opened successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName);
          console.log('[IDB] Object store created');
        }
      };
    });
  }

  async put(key, data) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      // Convert data to JSON string for storage
      const jsonData = JSON.stringify(data);
      const request = store.put(jsonData, key);

      request.onerror = () => {
        console.error('[IDB] Put error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log(`[IDB] Data stored successfully for key: ${key}`);
        resolve(request.result);
      };
    });
  }

  async get(key) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => {
        console.error('[IDB] Get error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        if (request.result) {
          try {
            // Parse JSON string back to object
            const data = JSON.parse(request.result);
            console.log(`[IDB] Data retrieved successfully for key: ${key}`);
            resolve(data);
          } catch (error) {
            console.error('[IDB] JSON parse error:', error);
            reject(error);
          }
        } else {
          console.log(`[IDB] No data found for key: ${key}`);
          resolve(null);
        }
      };
    });
  }

  async delete(key) {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => {
        console.error('[IDB] Delete error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log(`[IDB] Data deleted successfully for key: ${key}`);
        resolve(request.result);
      };
    });
  }

  async clear() {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => {
        console.error('[IDB] Clear error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        console.log('[IDB] All data cleared successfully');
        resolve(request.result);
      };
    });
  }

  async getStorageSize() {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onerror = () => {
        console.error('[IDB] GetAll error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        const allData = request.result;
        let totalSize = 0;
        
        allData.forEach(item => {
          totalSize += new Blob([item]).size;
        });

        const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
        console.log(`[IDB] Total storage size: ${sizeInMB} MB`);
        resolve({ bytes: totalSize, mb: parseFloat(sizeInMB) });
      };
    });
  }
}

// Create global instance
window.EBirdIDB = EBirdIDB;