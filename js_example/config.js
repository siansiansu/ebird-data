const EBirdConfig = {
  DEBUG: false,
  
  URLS: {
    SPECIES: "https://siansiansu.github.io/ebird-data/json/species.json",
    REGION: "https://siansiansu.github.io/ebird-data/json/region.json"
  },
  
  LOCAL_FILES: {
    SPECIES: "species.json",
    REGION: "region.json"
  },
  
  HOST: {
    EBIRD: "ebird.org",
    MEDIA: "media.ebird.org"
  },
  
  PATH: {
    CATALOG: "/catalog",
    HOTSPOTS: "hotspots",
    MAP: "map",
    EXPLORE: "explore",
    SPECIES: "/species/"
  },
  
  LANG: {
    EN: "en",
    ZH: "zh-TW",
    JA: "ja"
  },
  
  TIMEOUT: {
    FETCH: 5000
  }
};

window.EBirdConfig = EBirdConfig;