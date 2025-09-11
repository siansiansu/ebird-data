let speciesData = [];
let isLoading = false;
let selectedSpecies = null;
let currentSuggestionIndex = -1;

// Language code mappings with full native names
const languageNames = {
    'comName': 'English',
    'comNameDe': 'Deutsch',
    'comNameEsLA': 'Español (Latinoamérica)',
    'comNameEsES': 'Español (España)',
    'comNameFr': 'Français',
    'comNameIt': 'Italiano',
    'comNameJp': '日本語',
    'comNamePtPT': 'Português (Portugal)',
    'comNamePtBR': 'Português (Brasil)',
    'comNameRu': 'Русский',
    'comNameZh': '繁體中文',
    'comNameZhCN': '简体中文'
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

// Search and show suggestions
function showSuggestions(query) {
    if (!query.trim() || speciesData.length === 0) {
        hideSuggestions();
        return;
    }

    const startTime = performance.now();
    const searchTerm = query.toLowerCase().trim();

    // Find matching species
    const matches = speciesData.filter(species => {
        // Search in Chinese name
        if (species.comNameZh && species.comNameZh.toLowerCase().includes(searchTerm)) {
            return true;
        }

        // Search in scientific name
        if (species.sciName && species.sciName.toLowerCase().includes(searchTerm)) {
            return true;
        }

        // Search in alternative names
        if (species.comNameList && species.comNameList.length > 0) {
            return species.comNameList.some(name =>
                name.toLowerCase().includes(searchTerm)
            );
        }

        // Search in all other language names
        for (const field in languageNames) {
            if (species[field] && species[field].toLowerCase().includes(searchTerm)) {
                return true;
            }
        }

        return false;
    }).slice(0, 100); // Limit to 8 suggestions

    const endTime = performance.now();
    const loadTime = Math.round(endTime - startTime);

    displaySuggestions(matches, loadTime);
}

// Display suggestions in dropdown
function displaySuggestions(suggestions, loadTime = 0) {
    const dropdown = document.getElementById('suggestionsDropdown');

    if (suggestions.length === 0) {
        hideSuggestions();
        return;
    }

    // Clear dropdown
    dropdown.innerHTML = '';

    // Add suggestions
    suggestions.forEach((species, index) => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.dataset.index = index;
        // Store the actual species data for easy access
        suggestionItem.speciesData = species;

        const commonName = document.createElement('div');
        commonName.className = 'suggestion-common-name';
        commonName.textContent = species.comNameZh || species.comName || 'Unknown';

        const scientificName = document.createElement('div');
        scientificName.className = 'suggestion-scientific-name';
        scientificName.textContent = species.sciName || '';

        suggestionItem.appendChild(commonName);
        suggestionItem.appendChild(scientificName);

        // Add click event
        suggestionItem.addEventListener('click', () => {
            selectedSpecies = species;
            
            // Fill input with species name
            const searchInput = document.getElementById('searchInput');
            searchInput.value = species.comNameZh || species.comName || species.sciName;
            
            // Hide suggestions and show detailed information
            hideSuggestions();
            showSpeciesDetails(species);
        });

        dropdown.appendChild(suggestionItem);
    });

    // Show dropdown
    dropdown.classList.add('show');
    currentSuggestionIndex = -1;
}

// Hide suggestions
function hideSuggestions() {
    const dropdown = document.getElementById('suggestionsDropdown');
    dropdown.classList.remove('show');
    dropdown.innerHTML = '';
    currentSuggestionIndex = -1;
}

// Select a species
function selectSpecies(species) {
    selectedSpecies = species;
    const searchInput = document.getElementById('searchInput');

    // Fill input with Chinese name
    searchInput.value = species.comNameZh || species.comName || species.sciName;

    // Hide suggestions
    hideSuggestions();

}

// Handle keyboard navigation in suggestions
function handleSuggestionKeyboard(event) {
    const dropdown = document.getElementById('suggestionsDropdown');
    const suggestions = dropdown.querySelectorAll('.suggestion-item');

    if (suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        currentSuggestionIndex = Math.min(currentSuggestionIndex + 1, suggestions.length - 1);
        updateActiveSuggestion(suggestions);
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        currentSuggestionIndex = Math.max(currentSuggestionIndex - 1, -1);
        updateActiveSuggestion(suggestions);
    } else if (event.key === 'Enter') {
        event.preventDefault();
        if (currentSuggestionIndex >= 0 && suggestions[currentSuggestionIndex]) {
            // Select the highlighted suggestion and search immediately
            const species = suggestions[currentSuggestionIndex].speciesData;
            selectedSpecies = species;
            
            // Fill input with species name
            const searchInput = document.getElementById('searchInput');
            searchInput.value = species.comNameZh || species.comName || species.sciName;
            
            // Hide suggestions and show detailed information
            hideSuggestions();
            showSpeciesDetails(species);
        } else {
            handleSearch();
        }
    } else if (event.key === 'Escape') {
        hideSuggestions();
    }
}

// Update active suggestion highlight
function updateActiveSuggestion(suggestions) {
    suggestions.forEach((item, index) => {
        if (index === currentSuggestionIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Handle search button click
function handleSearch() {
    if (!selectedSpecies) {
        // If no species selected, try to find exact match
        const query = document.getElementById('searchInput').value.trim();
        if (!query) return;

        const exactMatch = speciesData.find(species =>
            (species.comNameZh && species.comNameZh.toLowerCase() === query.toLowerCase()) ||
            (species.sciName && species.sciName.toLowerCase() === query.toLowerCase()) ||
            (species.comName && species.comName.toLowerCase() === query.toLowerCase())
        );

        if (exactMatch) {
            selectedSpecies = exactMatch;
        } else {
            showError('Please select a species from the suggestion list');
            return;
        }
    }

    // Show detailed species information
    showSpeciesDetails(selectedSpecies);
    hideSuggestions();
}

// Show detailed species information
function showSpeciesDetails(species) {
    const resultsContainer = document.getElementById('resultsContainer');
    const noResults = document.getElementById('noResults');

    // Hide no results message
    noResults.style.display = 'none';

    // Clear previous results
    resultsContainer.innerHTML = '';

    // Create species detail card
    const detailCard = createSpeciesDetailCard(species);
    resultsContainer.appendChild(detailCard);

    // Show results container
    resultsContainer.style.display = 'block';

}

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show temporary feedback
        showCopyFeedback();
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Show copy feedback
function showCopyFeedback() {
    const feedback = document.createElement('div');
    feedback.className = 'copy-feedback';
    feedback.textContent = 'Copied!';
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        document.body.removeChild(feedback);
    }, 1000);
}

// Create detailed species card
function createSpeciesDetailCard(species) {
    const card = document.createElement('div');
    card.className = 'result-card';

    // Scientific name as main title with click-to-copy
    const scientificName = document.createElement('h2');
    scientificName.className = 'scientific-name clickable';
    scientificName.textContent = species.sciName || '';
    scientificName.title = 'Click to copy';
    scientificName.addEventListener('click', () => {
        copyToClipboard(species.sciName || '');
    });

    card.appendChild(scientificName);

    // Species metadata
    if (species.speciesCode || species.category || species.bandingCodes || species.comNameCodes || species.sciNameCodes) {
        const metadata = document.createElement('div');
        metadata.className = 'species-metadata';

        const metadataItems = [
            { label: 'Species Code', value: species.speciesCode },
            { label: 'Category', value: species.category },
            { label: 'Banding Codes', value: species.bandingCodes?.join(', ') },
            { label: 'Common Name Codes', value: species.comNameCodes?.join(', ') },
            { label: 'Scientific Name Codes', value: species.sciNameCodes?.join(', ') }
        ];

        metadataItems.forEach(item => {
            if (item.value) {
                const metadataItem = document.createElement('div');
                metadataItem.className = 'metadata-item';

                const label = document.createElement('span');
                label.className = 'metadata-label';
                label.textContent = item.label;

                const value = document.createElement('span');
                value.className = 'metadata-value clickable';
                value.textContent = item.value;
                value.title = 'Click to copy';
                value.addEventListener('click', () => {
                    copyToClipboard(item.value);
                });

                metadataItem.appendChild(label);
                metadataItem.appendChild(value);
                metadata.appendChild(metadataItem);
            }
        });

        card.appendChild(metadata);
    }

    // All language names - single column layout
    const languagesList = document.createElement('div');
    languagesList.className = 'languages-list';

    Object.entries(languageNames).forEach(([field, langName]) => {
        if (species[field]) {
            const languageItem = document.createElement('div');
            languageItem.className = 'language-item';

            const languageLabel = document.createElement('span');
            languageLabel.className = 'language-label';
            languageLabel.textContent = langName;

            const languageName = document.createElement('span');
            languageName.className = 'language-name clickable';
            languageName.textContent = species[field];
            languageName.title = 'Click to copy';
            languageName.addEventListener('click', () => {
                copyToClipboard(species[field]);
            });

            languageItem.appendChild(languageLabel);
            languageItem.appendChild(languageName);
            languagesList.appendChild(languageItem);
        }
    });

    card.appendChild(languagesList);

    // Alternative names if available
    if (species.comNameList && species.comNameList.length > 0) {
        const alternativeNames = document.createElement('div');
        alternativeNames.className = 'alternative-names';

        const namesList = document.createElement('div');
        namesList.className = 'alternative-names-list';

        species.comNameList.forEach(name => {
            const nameSpan = document.createElement('span');
            nameSpan.className = 'alternative-name clickable';
            nameSpan.textContent = name;
            nameSpan.title = 'Click to copy';
            nameSpan.addEventListener('click', () => {
                copyToClipboard(name);
            });
            namesList.appendChild(nameSpan);
        });

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

// Clear search
function clearSearch() {
    document.getElementById('searchInput').value = '';
    selectedSpecies = null;
    hideSuggestions();
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('noResults').style.display = 'none';
    document.getElementById('resultCount').textContent = '';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    // Load data when page loads
    loadSpeciesData();

    // Search input events
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        selectedSpecies = null; // Reset selected species when typing
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            showSuggestions(e.target.value);
        }, 300);
    });

    // Keyboard navigation and Enter key handling
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        } else {
            handleSuggestionKeyboard(e);
        }
    });

    // Search button
    searchButton.addEventListener('click', handleSearch);


    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-input-container')) {
            hideSuggestions();
        }
    });
});