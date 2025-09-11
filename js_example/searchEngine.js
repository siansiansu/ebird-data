const EBirdSearchEngine = {
  
  getEnhancedHotspotSuggestions(query) {
    const lowerQuery = query.toLowerCase().trim();
    const regionData = EBirdDataManager.getRegionData();
    
    const filteredRegions = regionData.filter((region) => {
      const locName = region.locName.toLowerCase();
      return locName.includes(lowerQuery);
    });

    return filteredRegions.slice(0, 300).map((region) => ({
      name: region.locName,
    }));
  },
  
  getComNameListSuggestions(query) {
    const speciesData = EBirdDataManager.getSpeciesData();
    
    if (!Array.isArray(speciesData) || speciesData.length === 0) {
      console.error("[ERROR] speciesData is not an array or is empty");
      return [];
    }

    const lowerQuery = query.toLowerCase().trim();
    
    const filteredSpecies = speciesData.filter((species) => {
      if (!species || !Array.isArray(species.comNameList)) {
        return false;
      }

      return species.comNameList.some((name) =>
        name.toLowerCase().includes(lowerQuery)
      );
    });

    const suggestions = filteredSpecies.slice(0, 300).map((species) => {
      let displayComName = "";
      const currentLanguage = EBirdDataManager.getCurrentLanguage();
      
      if (currentLanguage.startsWith("zh")) {
        displayComName = species.comNameZh;
      } else if (currentLanguage === "ja") {
        displayComName = species.comNameJp;
      } else {
        displayComName = species.comName;
      }

      return {
        comName: displayComName,
        sciName: species.sciName,
        speciesCode: species.speciesCode,
        matchedName: species.comNameList.find((name) =>
          name.toLowerCase().includes(lowerQuery)
        ),
      };
    });

    return suggestions;
  },
  
  getEnhancedSuggestions(query) {
    const speciesData = EBirdDataManager.getSpeciesData();
    
    if (!Array.isArray(speciesData) || speciesData.length === 0) {
      console.error("[ERROR] speciesData is not an array or is empty");
      return [];
    }

    const lowerQuery = query.toLowerCase().trim();
    
    const filteredSpecies = speciesData.filter((species) => {
      if (!species) {
        console.warn("[WARN] Encountered undefined or null species");
        return false;
      }

      const matchesCommonNameZh =
        species.comNameZh && species.comNameZh.toLowerCase().includes(lowerQuery);
      const matchesCommonNameJp =
        species.comNameJp && species.comNameJp.toLowerCase().includes(lowerQuery);
      const matchesComNameList =
        species.comName &&
        species.comNameList.some((c) => c.toLowerCase().includes(lowerQuery));
      const matches =
        matchesCommonNameZh || matchesCommonNameJp || matchesComNameList;
      return matches;
    });

    const suggestions = filteredSpecies.slice(0, 300).map((species) => {
      let displayComName = "";
      const currentLanguage = EBirdDataManager.getCurrentLanguage();
      
      if (currentLanguage.startsWith("zh")) {
        displayComName = species.comNameZh;
      } else if (currentLanguage === "ja") {
        displayComName = species.comNameJp;
      } else {
        displayComName = species.comName;
      }

      return {
        comName: displayComName,
        sciName: species.sciName,
        speciesCode: species.speciesCode,
      };
    });

    return suggestions;
  },
  
  hasSpeciesMatch(query) {
    const speciesData = EBirdDataManager.getSpeciesData();
    const lowerQuery = query.toLowerCase();
    
    return speciesData.some(
      (species) =>
        species.comNameZh.toLowerCase().trim().includes(lowerQuery) ||
        species.comNameJp.toLowerCase().trim().includes(lowerQuery)
    );
  },
  
  hasCompleteMatch(query) {
    const speciesData = EBirdDataManager.getSpeciesData();
    const lowerQuery = query.toLowerCase();
    
    return speciesData.some(
      (species) =>
        species.sciName.toLowerCase().trim().includes(lowerQuery) ||
        species.comName.toLowerCase().trim().includes(lowerQuery) ||
        species.comNameZh.toLowerCase().trim().includes(lowerQuery) ||
        species.comNameJp.toLowerCase().trim().includes(lowerQuery) ||
        species.speciesCode
          .toLowerCase()
          .trim()
          .includes(lowerQuery) ||
        species.bandingCodes.some((name) =>
          name.toLowerCase().includes(lowerQuery)
        ) ||
        species.comNameCodes.some((name) =>
          name.toLowerCase().includes(lowerQuery)
        ) ||
        species.sciNameCodes.some((name) =>
          name.toLowerCase().includes(lowerQuery)
        )
    );
  }
};

window.EBirdSearchEngine = EBirdSearchEngine;