const EBirdUtils = {
  
  getPageLanguage() {
    // First, check if we're on the eBird media catalog
    if (
      window.location.hostname === EBirdConfig.HOST.MEDIA &&
      window.location.pathname.includes(EBirdConfig.PATH.CATALOG)
    ) {
      const pathParts = window.location.pathname.split("/");
      const langCode = pathParts[1]; // This should be 'zh', 'ja', or undefined for English

      if (langCode === "zh") {
        return EBirdConfig.LANG.ZH;
      } else if (langCode === "ja") {
        return EBirdConfig.LANG.JA;
      } else {
        return EBirdConfig.LANG.EN; // Default to English if no language code in the path
      }
    }

    // If not on eBird media catalog, proceed with the original logic
    const htmlLang = document.documentElement.lang;

    if (htmlLang) {
      if (htmlLang.includes("zh")) {
        return EBirdConfig.LANG.ZH;
      } else if (htmlLang.startsWith("ja")) {
        return EBirdConfig.LANG.JA;
      } else if (htmlLang.startsWith("en")) {
        return EBirdConfig.LANG.EN;
      }
    }

    // If htmlLang is not set or not recognized, fallback to browser language
    const browserLang = navigator.language || navigator.userLanguage;

    if (browserLang.includes("zh")) {
      return EBirdConfig.LANG.ZH;
    } else if (browserLang.startsWith("ja")) {
      return EBirdConfig.LANG.JA;
    } else {
      return EBirdConfig.LANG.EN; // Default to English
    }
  },
  
  isEBird() {
    const { hostname } = window.location;
    return hostname === EBirdConfig.HOST.EBIRD || hostname === EBirdConfig.HOST.MEDIA;
  },
  
  fetchWithTimeout(url, timeout = EBirdConfig.TIMEOUT.FETCH) {
    return Promise.race([
      fetch(url),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), timeout)
      ),
    ]);
  },
  
  getResourceUrl(filename) {
    if (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.getURL
    ) {
      return chrome.runtime.getURL(filename);
    } else if (
      typeof browser !== "undefined" &&
      browser.runtime &&
      browser.runtime.getURL
    ) {
      return browser.runtime.getURL(filename);
    } else {
      return filename;
    }
  },
  
  debug(message, ...args) {
    if (EBirdConfig.DEBUG) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  
  error(message, error) {
    console.error(`[ERROR] ${message}`, error);
  }
};

window.EBirdUtils = EBirdUtils;