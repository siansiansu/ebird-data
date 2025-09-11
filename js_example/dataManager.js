let speciesData = [];
let regionData = [];
let currentLanguage = "default";

const EBirdDataManager = {
  
  async loadData() {
    // First try to load from Chrome Storage (cached data)
    try {
      const cachedData = await this.loadFromCache();
      if (cachedData) {
        console.log('[INFO] Using cached data from Chrome Storage');
        return true;
      }
    } catch (error) {
      console.warn('[WARN] Failed to load from cache, falling back to network:', error);
    }
    
    // Fallback to original network loading
    return this.loadFromNetwork();
  },
  
  async loadFromCache() {
    return new Promise((resolve) => {
      // Send message to background script to get cached data from IndexedDB
      chrome.runtime.sendMessage(
        { action: 'getCachedData' },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('[ERROR] Chrome runtime error:', chrome.runtime.lastError);
            resolve(null);
            return;
          }
          
          if (response && response.success && response.data) {
            const { speciesData: cachedSpecies, regionData: cachedRegions, lastUpdate, dataSource } = response.data;
            
            if (Array.isArray(cachedSpecies) && Array.isArray(cachedRegions) && 
                cachedSpecies.length > 0 && cachedRegions.length > 0) {
              
              speciesData = cachedSpecies;
              regionData = cachedRegions;
              
              const cacheAge = lastUpdate ? Math.round((Date.now() - lastUpdate) / (1000 * 60 * 60)) : 'unknown';
              console.log(`[INFO] Loaded ${speciesData.length} species and ${regionData.length} regions from IndexedDB (${dataSource} data, ${cacheAge}h old)`);
              resolve(true);
            } else {
              console.log('[INFO] No valid cached data found in IndexedDB');
              resolve(null);
            }
          } else {
            console.log('[INFO] No cached data available in IndexedDB');
            resolve(null);
          }
        }
      );
    });
  },
  
  loadFromNetwork() {
    const fetchLocalData = (filename) => {
      const url = EBirdUtils.getResourceUrl(filename);
      return fetch(url).then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      });
    };

    // Always try to fetch from local files as fallback
    console.log('[INFO] Using local data source');
    
    return Promise.all([
      fetchLocalData(EBirdConfig.LOCAL_FILES.SPECIES),
      fetchLocalData(EBirdConfig.LOCAL_FILES.REGION),
    ])
      .then(([speciesJsonData, regionJsonData]) => {
        console.log("[INFO] Species and region data loaded successfully from local files");
        speciesData = Array.isArray(speciesJsonData) ? speciesJsonData : [];
        regionData = Array.isArray(regionJsonData) ? regionJsonData : [];
        console.log(`[INFO] Loaded ${speciesData.length} species and ${regionData.length} regions`);
        return true;
      })
      .catch((error) => {
        EBirdUtils.error("Error loading local data:", error);
        return false;
      });
  },
  
  getSpeciesData() {
    return speciesData;
  },
  
  getRegionData() {
    return regionData;
  },
  
  getCurrentLanguage() {
    return currentLanguage;
  },
  
  setCurrentLanguage(lang) {
    currentLanguage = lang;
  },
  
  isDataLoaded() {
    return speciesData.length > 0 && regionData.length > 0;
  }
};

window.EBirdDataManager = EBirdDataManager;