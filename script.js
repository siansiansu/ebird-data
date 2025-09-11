let speciesData = [];
let isLoading = false;

// Language code mappings
const languageNames = {
    'comName': 'English',
    'comNameDe': 'Deutsch', 
    'comNameEsLA': 'Español (LA)',
    'comNameEsES': 'Español (ES)',
    'comNameFr': 'Français',
    'comNameIt': 'Italiano',
    'comNameJp': '日本語',
    'comNamePtPT': 'Português (PT)',
    'comNamePtBR': 'Português (BR)',
    'comNameRu': 'Русский',
    'comNameZh': '中文(繁)',
    'comNameZhCN': '中文(简)'
};

// Load species data
async function loadSpeciesData() {
    if (isLoading || speciesData.length > 0) return;
    
    isLoading = true;
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';

    try {
        const response = await fetch('./species.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        speciesData = await response.json();
        console.log(`Loaded ${speciesData.length} species`);
    } catch (error) {
        console.error('Error loading species data:', error);
        showError('Failed to load species data. Please try again later.');
    } finally {
        isLoading = false;
        loadingIndicator.style.display = 'none';
    }
}

// Current language filter for display
let selectedLanguage = 'comName';

// Search function - always searches all languages
function searchSpecies(query) {
    if (!query.trim()) {
        showResults([]);
        return;
    }

    const startTime = performance.now();
    const searchTerm = query.toLowerCase().trim();
    
    const results = speciesData.filter(species => {
        // Search in scientific name
        if (species.sciName && species.sciName.toLowerCase().includes(searchTerm)) {
            return true;
        }

        // Search in all language names
        for (const field in languageNames) {
            if (species[field] && species[field].toLowerCase().includes(searchTerm)) {
                return true;
            }
        }

        // Search in alternative names
        if (species.comNameList && species.comNameList.length > 0) {
            return species.comNameList.some(name => 
                name.toLowerCase().includes(searchTerm)
            );
        }

        return false;
    });

    const endTime = performance.now();
    const loadTime = Math.round(endTime - startTime);
    
    showResults(results, loadTime);
}

// Language dropdown functions
function toggleLanguageDropdown() {
    const button = document.getElementById('languageButton');
    const dropdown = document.getElementById('languageDropdown');
    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    button.setAttribute('aria-expanded', !isExpanded);
    dropdown.hidden = isExpanded;
}

function selectLanguage(langCode, langName) {
    selectedLanguage = langCode;
    document.getElementById('selectedLanguage').textContent = langName;
    
    // Update selected option
    document.querySelectorAll('.language-option').forEach(option => {
        option.setAttribute('aria-selected', option.dataset.lang === langCode);
    });

    // Close dropdown
    document.getElementById('languageButton').setAttribute('aria-expanded', 'false');
    document.getElementById('languageDropdown').hidden = true;

    // Note: Search function already searches all languages, no need to re-search
    // The dropdown only controls which language is highlighted in results
}

function closeLanguageDropdown() {
    document.getElementById('languageButton').setAttribute('aria-expanded', 'false');
    document.getElementById('languageDropdown').hidden = true;
}

// Show results
function showResults(results, loadTime = 0) {
    const resultsContainer = document.getElementById('resultsContainer');
    const noResults = document.getElementById('noResults');
    const resultCount = document.getElementById('resultCount');
    const loadTimeSpan = document.getElementById('loadTime');

    // Update stats
    if (results.length === 0 && document.getElementById('searchInput').value.trim()) {
        resultCount.textContent = 'No results found';
        noResults.style.display = 'block';
        resultsContainer.style.display = 'none';
    } else if (results.length === 0) {
        resultCount.textContent = 'Enter a search term to find bird species';
        noResults.style.display = 'none';
        resultsContainer.style.display = 'none';
    } else {
        resultCount.textContent = `Found ${results.length} species`;
        noResults.style.display = 'none';
        resultsContainer.style.display = 'block';
    }

    if (loadTime > 0) {
        loadTimeSpan.textContent = `(${loadTime}ms)`;
    } else {
        loadTimeSpan.textContent = '';
    }

    // Clear previous results
    resultsContainer.innerHTML = '';

    // Show results
    results.forEach(species => {
        const card = createSpeciesCard(species);
        resultsContainer.appendChild(card);
    });
}

// Create species card
function createSpeciesCard(species) {
    const card = document.createElement('div');
    card.className = 'result-card';

    const speciesName = document.createElement('h3');
    speciesName.className = 'species-name';
    speciesName.textContent = species.comName || 'Unknown';

    const scientificName = document.createElement('p');
    scientificName.className = 'scientific-name';
    scientificName.textContent = species.sciName || '';

    const languagesGrid = document.createElement('div');
    languagesGrid.className = 'languages-grid';

    // Add all language names
    Object.entries(languageNames).forEach(([field, langName]) => {
        if (species[field] && species[field] !== species.comName) {
            const languageItem = document.createElement('div');
            languageItem.className = 'language-item';

            const languageCode = document.createElement('span');
            languageCode.className = 'language-code';
            languageCode.textContent = field.replace('comName', '').toLowerCase() || 'en';

            const languageName = document.createElement('span');
            languageName.className = 'language-name';
            languageName.textContent = species[field];

            languageItem.appendChild(languageCode);
            languageItem.appendChild(languageName);
            languagesGrid.appendChild(languageItem);
        }
    });

    card.appendChild(speciesName);
    card.appendChild(scientificName);
    card.appendChild(languagesGrid);

    // Add alternative names if available
    if (species.comNameList && species.comNameList.length > 0) {
        const alternativeNames = document.createElement('div');
        alternativeNames.className = 'alternative-names';

        const label = document.createElement('div');
        label.className = 'alternative-names-label';
        label.textContent = 'Alternative names:';

        const namesList = document.createElement('div');
        namesList.className = 'alternative-names-list';

        species.comNameList.forEach(name => {
            const nameSpan = document.createElement('span');
            nameSpan.className = 'alternative-name';
            nameSpan.textContent = name;
            namesList.appendChild(nameSpan);
        });

        alternativeNames.appendChild(label);
        alternativeNames.appendChild(namesList);
        card.appendChild(alternativeNames);
    }

    return card;
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const clearButton = document.getElementById('clearButton');
    const languageButton = document.getElementById('languageButton');
    const languageDropdown = document.getElementById('languageDropdown');

    // Load data when page loads
    loadSpeciesData();

    // Language dropdown events
    languageButton.addEventListener('click', toggleLanguageDropdown);

    // Language option clicks
    languageDropdown.addEventListener('click', (e) => {
        if (e.target.classList.contains('language-option')) {
            const langCode = e.target.dataset.lang;
            const langName = e.target.textContent;
            selectLanguage(langCode, langName);
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.language-selector')) {
            closeLanguageDropdown();
        }
    });

    // Keyboard navigation for dropdown
    languageButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault();
            toggleLanguageDropdown();
            if (!languageDropdown.hidden) {
                languageDropdown.querySelector('.language-option').focus();
            }
        }
    });

    languageDropdown.addEventListener('keydown', (e) => {
        const options = Array.from(languageDropdown.querySelectorAll('.language-option'));
        const currentIndex = options.indexOf(document.activeElement);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % options.length;
            options[nextIndex].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
            options[prevIndex].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.target.click();
        } else if (e.key === 'Escape') {
            closeLanguageDropdown();
            languageButton.focus();
        }
    });

    // Search on input
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (speciesData.length > 0) {
                searchSpecies(e.target.value);
            }
        }, 300);
    });

    // Search on button click
    searchButton.addEventListener('click', () => {
        if (speciesData.length > 0) {
            searchSpecies(searchInput.value);
        } else {
            loadSpeciesData().then(() => {
                searchSpecies(searchInput.value);
            });
        }
    });

    // Clear search
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        selectedLanguage = 'comName';
        document.getElementById('selectedLanguage').textContent = 'English';
        document.querySelectorAll('.language-option').forEach(option => {
            option.setAttribute('aria-selected', option.dataset.lang === 'comName');
        });
        showResults([]);
    });

    // Search on Enter
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (speciesData.length > 0) {
                searchSpecies(searchInput.value);
            } else {
                loadSpeciesData().then(() => {
                    searchSpecies(searchInput.value);
                });
            }
        }
    });
});