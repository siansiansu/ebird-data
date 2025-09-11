const EBirdUIManager = {
  
  findInput() {
    let originalInput = null;

    if (window.location.pathname.includes("hotspots")) {
      // If you are on the hotspots page, get input from the "find-hostpot" element
      originalInput = document.getElementById("find-hotspot");
    } else {
      // Attend to find "taxonFinder" element
      let taxonFinder = document.getElementById("taxonFinder");
      if (taxonFinder) {
        originalInput = taxonFinder;
      } else {
        let findspp = document.getElementById("findspp");
        if (findspp) {
          originalInput = findspp;
        } else {
          let species = document.getElementById("species");
          if (species) {
            originalInput = species;
          } else {
            let suggestInputs = Array.from(
              document.getElementsByClassName("Suggest-input")
            );
            if (suggestInputs.length > 1) {
              originalInput = suggestInputs[1]; // Get the second element (index 1)
            } else if (suggestInputs.length === 1) {
              originalInput = suggestInputs[0]; // If there's only one, use that
            }
          }
        }
      }
    }

    return originalInput;
  },
  
  getDropdownElement() {
    if (
      window.location.hostname === EBirdConfig.HOST.EBIRD &&
      window.location.pathname.includes("hotspots")
    ) {
      return document.getElementById("Suggest-dropdown-1");
    } else if (
      window.location.hostname === EBirdConfig.HOST.EBIRD &&
      window.location.pathname.includes("map")
    ) {
      return document.getElementById("Suggest-dropdown-1");
    } else if (
      window.location.hostname === EBirdConfig.HOST.EBIRD &&
      window.location.pathname.includes("explore")
    ) {
      return document.getElementById("Suggest-dropdown-species");
    } else if (window.location.hostname === EBirdConfig.HOST.MEDIA) {
      return document.getElementById("Suggest-dropdown-taxonFinder");
    } else if (
      window.location.hostname === EBirdConfig.HOST.EBIRD &&
      window.location.pathname.startsWith(EBirdConfig.PATH.SPECIES)
    ) {
      return document.getElementsByClassName("Suggest-dropdown")[1];
    }
    return null;
  },
  
  closeDropdown() {
    let dropdownElement;
    if (window.location.pathname.includes("hotspots")) {
      dropdownElement = document.getElementById("Suggest-dropdown-1");
    } else if (
      window.location.hostname === EBirdConfig.HOST.EBIRD &&
      window.location.pathname.includes("map")
    ) {
      dropdownElement = document.getElementById("Suggest-dropdown-1");
    } else if (
      window.location.hostname === EBirdConfig.HOST.EBIRD &&
      window.location.pathname.includes("explore")
    ) {
      dropdownElement = document.getElementById("Suggest-dropdown-species");
    } else if (window.location.hostname === EBirdConfig.HOST.MEDIA) {
      dropdownElement = document.getElementById("Suggest-dropdown-taxonFinder");
    } else if (
      window.location.hostname === EBirdConfig.HOST.EBIRD &&
      window.location.pathname.startsWith(EBirdConfig.PATH.SPECIES)
    ) {
      dropdownElement = document.getElementsByClassName("Suggest-dropdown")[1];
    }

    if (!dropdownElement) {
      return;
    }

    if (dropdownElement) {
      dropdownElement.style.display = "none";
      dropdownElement.setAttribute("aria-hidden", "true");
    }
  },
  
  handleOutsideClick(event) {
    let dropdownElement;
    if (
      window.location.hostname === EBirdConfig.HOST.EBIRD &&
      window.location.pathname.includes("hotspots")
    ) {
      dropdownElement = document.getElementById("Suggest-dropdown-1");
    } else if (
      window.location.hostname === EBirdConfig.HOST.EBIRD &&
      window.location.pathname.includes("map")
    ) {
      dropdownElement = document.getElementById("Suggest-dropdown-1");
    } else if (
      window.location.hostname === EBirdConfig.HOST.EBIRD &&
      window.location.pathname.includes("explore")
    ) {
      dropdownElement = document.getElementById("Suggest-dropdown-species");
    } else if (window.location.hostname === EBirdConfig.HOST.MEDIA) {
      dropdownElement = document.getElementById("Suggest-dropdown-taxonFinder");
    } else if (
      window.location.hostname === EBirdConfig.HOST.EBIRD &&
      window.location.pathname.startsWith(EBirdConfig.PATH.SPECIES)
    ) {
      dropdownElement = document.getElementsByClassName("Suggest-dropdown")[1];
    }

    if (!dropdownElement) {
      return;
    }

    const searchInput =
      document.getElementById("find-hotspot") ||
      document.getElementById("findspp") ||
      document.getElementById("species") ||
      document.getElementsByClassName("Suggest-input");

    if (
      dropdownElement &&
      !dropdownElement.contains(event.target) &&
      event.target !== searchInput
    ) {
      this.closeDropdown();
    }
  },
  
  updateAutocompleteDropdown(suggestions, showEnhanced) {
    const dropdownElement = this.getDropdownElement();
    if (!dropdownElement) return;

    dropdownElement.classList.add("Suggest-dropdown");

    let suggestionsContainer = dropdownElement.querySelector(
      ".Suggest-suggestions"
    );
    if (!suggestionsContainer) return;

    let enhancedSuggestionsContainer = suggestionsContainer.querySelector(
      ".enhanced-suggestions-container"
    );
    if (!enhancedSuggestionsContainer) {
      enhancedSuggestionsContainer = document.createElement("div");
      enhancedSuggestionsContainer.className = "enhanced-suggestions-container";
      suggestionsContainer.insertBefore(
        enhancedSuggestionsContainer,
        suggestionsContainer.firstChild
      );
    } else {
      // Clone and replace to remove all existing event listeners
      const newEnhancedSuggestionsContainer =
        enhancedSuggestionsContainer.cloneNode(false);
      enhancedSuggestionsContainer.parentNode.replaceChild(
        newEnhancedSuggestionsContainer,
        enhancedSuggestionsContainer
      );
      enhancedSuggestionsContainer = newEnhancedSuggestionsContainer;
    }

    if (showEnhanced) {
      enhancedSuggestionsContainer.style.display = "block";
      enhancedSuggestionsContainer.innerHTML = "";

      const fragment = document.createDocumentFragment();
      suggestions.forEach((suggestion, index) => {
        const suggestionElement = document.createElement("div");
        if (window.location.pathname.includes("hotspots")) {
          suggestionElement.innerHTML = `
            <div role="option" id="Enhanced-suggestion-${index}" class="Suggest-suggestion enhanced-suggestion" data-region-name="${suggestion.name}">
              <span class="Suggestion-text">
                <em>${suggestion.name}</em>
              </span>
            </div>
          `;
        } else {
          suggestionElement.innerHTML = `
            <div role="option" id="Enhanced-suggestion-${index}" class="Suggest-suggestion enhanced-suggestion" data-species-code="${suggestion.speciesCode}">
              <span class="Suggestion-text">
                <em>${suggestion.comName}</em>
                <span class="SciName">${suggestion.sciName}</span>
              </span>
            </div>
          `;
        }
        fragment.appendChild(suggestionElement);
      });

      enhancedSuggestionsContainer.appendChild(fragment);
      this.setupKeyboardNavigation(enhancedSuggestionsContainer);

      const enhancedSuggestions = enhancedSuggestionsContainer.querySelectorAll(
        ".enhanced-suggestion"
      );
      enhancedSuggestions.forEach((suggestion) => {
        suggestion.addEventListener("click", this.handleSuggestionClick.bind(this));
      });
    } else {
      enhancedSuggestionsContainer.style.display = "none";
    }

    dropdownElement.style.display = "block";
    dropdownElement.style.visibility = "visible";
    dropdownElement.style.opacity = "1";
    dropdownElement.setAttribute("aria-hidden", "false");
  },
  
  handleSuggestionClick(event) {
    event.stopPropagation();
    if (window.location.pathname.includes("hotspots")) {
      const regionName = event.currentTarget.getAttribute("data-region-name");
      if (regionName) {
        const inputElement = document.getElementById("find-hotspot");
        if (inputElement) {
          inputElement.value = regionName;
          const inputEvent = new Event("input", { bubbles: true });
          inputElement.dispatchEvent(inputEvent);
        }
      } else {
        console.error(
          `[Error] Region name not found for: ${event.currentTarget.textContent.trim()}`
        );
      }
    } else {
      const speciesCode = event.currentTarget.getAttribute("data-species-code");
      if (speciesCode) {
        let url;
        const currentLanguage = EBirdDataManager.getCurrentLanguage();
        
        if (window.location.hostname === EBirdConfig.HOST.MEDIA) {
          switch (currentLanguage) {
            case EBirdConfig.LANG.ZH:
              url = `https://media.ebird.org/zh/catalog?taxonCode=${speciesCode}`;
              break;
            case EBirdConfig.LANG.JA:
              url = `https://media.ebird.org/ja/catalog?taxonCode=${speciesCode}`;
              break;
            default:
              url = `https://media.ebird.org/catalog?taxonCode=${speciesCode}`;
              break;
          }
        } else if (
          window.location.hostname === EBirdConfig.HOST.EBIRD &&
          window.location.pathname.startsWith(EBirdConfig.PATH.SPECIES)
        ) {
          url = `https://ebird.org/species/${speciesCode}`;
        } else if (
          window.location.hostname === EBirdConfig.HOST.EBIRD &&
          window.location.pathname.includes("explore")
        ) {
          url = `https://ebird.org/species/${speciesCode}`;
        } else {
          url = `https://ebird.org/map/${speciesCode}`;
        }
        window.location.href = url;
      } else {
        console.error(
          `[Error] Species code not found for: ${event.currentTarget.textContent.trim()}`
        );
      }
    }
    this.closeDropdown();
  },
  
  setupKeyboardNavigation(container) {
    let currentIndex = -1;
    const suggestions = container.querySelectorAll(".enhanced-suggestion");

    function updateActiveItem(newIndex) {
      if (suggestions.length === 0) return;

      currentIndex = newIndex;
      suggestions.forEach((item, index) => {
        if (index === currentIndex) {
          item.classList.add("is-active");
          item.scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else {
          item.classList.remove("is-active");
        }
      });
    }

    function handleMouseEnter() {
      const index = Array.from(suggestions).indexOf(this);
      updateActiveItem(index);
    }

    function handleMouseLeave() {
      this.classList.remove("is-active");
      currentIndex = -1;
    }

    suggestions.forEach((suggestion) => {
      suggestion.addEventListener("mouseenter", handleMouseEnter);
      suggestion.addEventListener("mouseleave", handleMouseLeave);
    });

    function handleKeyDown(e) {
      if (!container.offsetParent) return;
      if (suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          updateActiveItem((currentIndex + 1) % suggestions.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          updateActiveItem(
            (currentIndex - 1 + suggestions.length) % suggestions.length
          );
          break;
        case "Enter":
          e.preventDefault();
          if (currentIndex !== -1) {
            suggestions[currentIndex].click();
          }
          break;
      }
    }
    document.addEventListener("keydown", handleKeyDown);
  }
};

window.EBirdUIManager = EBirdUIManager;