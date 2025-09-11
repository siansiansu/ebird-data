const EBirdController = {
  
  ready: false,
  
  init() {
    if (this.ready) {
      EBirdUtils.debug('Already initialized, skipping');
      return;
    }

    EBirdUtils.debug('Initializing eBird Enhancement');

    if (!EBirdUtils.isEBird()) {
      EBirdUtils.debug('Not on eBird site, skipping initialization');
      return;
    }

    // Set initial language
    EBirdDataManager.setCurrentLanguage(EBirdUtils.getPageLanguage());
    
    // Load data first, then enhance UI
    EBirdDataManager.loadData().then((success) => {
      if (success) {
        this.setupEvents();
        this.enhanceAutocomplete();
        this.setupLanguageSwitch();
        this.ready = true;
        EBirdUtils.debug('eBird Enhancement initialized successfully');
      } else {
        EBirdUtils.error('eBird Enhancement initialization failed');
      }
    }).catch(error => {
      EBirdUtils.error('eBird Enhancement initialization failed:', error);
    });
  },
  
  setupEvents() {
    document.addEventListener('click', EBirdUIManager.handleOutsideClick.bind(EBirdUIManager));
  },
  
  setupLanguageSwitch() {
    const languageButtons = document.querySelectorAll(".Header-link[data-lang]");
    languageButtons.forEach((button) => {
      button.addEventListener("click", function () {
        EBirdDataManager.setCurrentLanguage(this.getAttribute("data-lang"));
      });
    });
  },
  
  enhanceAutocomplete() {
    const originalInput = EBirdUIManager.findInput();

    if (originalInput) {
      originalInput.removeEventListener("input", this.handleInput.bind(this));
      originalInput.addEventListener("input", this.handleInput.bind(this));

      EBirdUtils.debug('Enhanced autocomplete for input element', {
        id: originalInput.id,
        class: originalInput.className,
        tag: originalInput.tagName,
        url: window.location.href,
        canFocus: originalInput.focus !== undefined,
        type: originalInput.type
      });
    } else {
      EBirdUtils.debug('Input element not found for current page');
    }
  },
  
  handleInput(event) {
    let query = event.target.value.trim();
    if (query.length === 0) {
      EBirdUIManager.closeDropdown();
      return;
    }
    query = query.replaceAll("台", "臺");

    const dropdownElement = EBirdUIManager.getDropdownElement();
    if (!dropdownElement) return;

    const suggestionsContainer = dropdownElement.querySelector(
      ".Suggest-suggestions"
    );
    if (!suggestionsContainer) return;

    const isCJK =
      /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(
        query
      );
    const cjkCharCount = (
      query.match(
        /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/g
      ) || []
    ).length;

    let shouldShowEnhanced = false;
    let suggestions = [];
    if (
      (window.location.hostname === EBirdConfig.HOST.EBIRD &&
        window.location.pathname.includes("hotspots") &&
        query.length < 3) ||
      (isCJK && cjkCharCount < 3)
    ) {
      shouldShowEnhanced = true;
    }
    
    let isMatched = false;
    // 如果輸入的是中文，且大於 3 個字
    // 檢查是不是 matched, 如果 matched，使用 eBird 原本的搜尋
    if (isCJK && cjkCharCount >= 3) {
      isMatched = EBirdSearchEngine.hasSpeciesMatch(query);
    }

    if (shouldShowEnhanced && isMatched == false) {
      if (
        window.location.hostname === EBirdConfig.HOST.EBIRD &&
        window.location.pathname.includes("hotspots")
      ) {
        suggestions = EBirdSearchEngine.getEnhancedHotspotSuggestions(query);
      } else {
        suggestions = EBirdSearchEngine.getEnhancedSuggestions(query);
      }

      EBirdUIManager.updateAutocompleteDropdown(suggestions, true);
      // 如果套件不該出現建議搜尋，且中文俗名沒有符合的搜尋
      // 搜尋 comNameList
    } else if (shouldShowEnhanced == false && isMatched == false) {
      suggestions = EBirdSearchEngine.getComNameListSuggestions(query);
      EBirdUIManager.updateAutocompleteDropdown(suggestions, true);
    } else {
      // 如果所有的搜尋都沒有 match, 會到這個 block
      if (!EBirdSearchEngine.hasCompleteMatch(query)) {
        suggestions = EBirdSearchEngine.getComNameListSuggestions(query);
        EBirdUIManager.updateAutocompleteDropdown(suggestions, true);
      } else {
        EBirdUIManager.updateAutocompleteDropdown([], false);
      }
    }
  },
  
  destroy() {
    if (!this.ready) return;

    const input = EBirdUIManager.findInput();
    if (input) {
      input.removeEventListener("input", this.handleInput);
    }

    document.removeEventListener('click', EBirdUIManager.handleOutsideClick);

    this.ready = false;
    EBirdUtils.debug('eBird Enhancement destroyed');
  }
};

// Initialize when DOM is ready
(function() {
  'use strict';

  // Prevent multiple script injection
  if (window.EBirdExtensionLoaded) {
    EBirdUtils.debug('Extension already loaded, skipping initialization');
    return;
  }
  window.EBirdExtensionLoaded = true;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      EBirdController.init();
    });
  } else {
    EBirdController.init();
  }

  window.EBirdController = EBirdController;
})();