let speciesData = [];
let isLoading = false;
let selectedSpecies = null;
let currentSuggestionIndex = -1;
let selectedLanguage = 'comNameZh';
let originalInputValue = '';
const languageNames = {
    'comNameZh': '繁體中文',
    'comNameJp': '日本語',
    'comName': 'English',
    'comNameDe': 'Deutsch', // 德語
    'comNameFr': 'Français', // 法語
    'comNameIt': 'Italiano', // 義大利文
    'comNameEsES': 'Español (España)', // 西班牙文（歐洲用語，Castellano）
    'comNameEsLA': 'Español (Latinoamérica)', // 拉美西班牙文（Latin America and Caribbean region，419 代表「拉美地區」的代碼）
    'comNameMn': 'Монгол', // 蒙古語
    'comNamePtPT': 'Português (Portugal)', // 葡萄牙文（葡萄牙用語）
    'comNamePtBR': 'Português (Brasil)', // 葡萄牙文（巴西用語，拼字、用詞有差異）
    'comNameRu': 'Русский' // 俄文（俄羅斯標準）
};
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
    } catch (error) {
        showError('Failed to load species data. Please try again later.');
    } finally {
        isLoading = false;
        loadingIndicator.style.display = 'none';
    }
}
function showSuggestions(query) {
    if (!query.trim() || speciesData.length === 0) {
        hideSuggestions();
        return;
    }
    const startTime = performance.now();
    const searchTerm = query.trim();

    const languageSelector = document.getElementById('languageSelector');
    const selectedLangField = languageSelector ? languageSelector.value : 'comNameZh';

    const matches = speciesData.filter(species => {
        const codeMatch = searchTerm.match(/^code:\s*(.+)/i);

        if (codeMatch) {
            const keyword = codeMatch[1].toLowerCase();
            if (species.bandingCodes && Array.isArray(species.bandingCodes) &&
                species.bandingCodes.some(code => code.toLowerCase().includes(keyword))) {
                return true;
            }
            if (species.comNameCodes && Array.isArray(species.comNameCodes) &&
                species.comNameCodes.some(code => code.toLowerCase().includes(keyword))) {
                return true;
            }
            if (species.sciNameCodes && Array.isArray(species.sciNameCodes) &&
                species.sciNameCodes.some(code => code.toLowerCase().includes(keyword))) {
                return true;
            }
            return false;
        }

        // General search: selected language + English + scientific name + alternative names
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        if (species[selectedLangField] && species[selectedLangField].toLowerCase().includes(lowerCaseSearchTerm)) {
            return true;
        }
        if (selectedLangField !== 'comName' && species.comName && species.comName.toLowerCase().includes(lowerCaseSearchTerm)) {
            return true;
        }
        if (species.sciName && species.sciName.toLowerCase().includes(lowerCaseSearchTerm)) {
            return true;
        }
        if (species.comNameList && species.comNameList.length > 0) {
            return species.comNameList.some(name =>
                name.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        return false;
    }).filter(species => {
        // Filter out species where selected language name equals default English name
        // This means the species doesn't have a proper name in the selected language
        if (selectedLangField !== 'comName' && species[selectedLangField] && species.comName) {
            return species[selectedLangField].toLowerCase() !== species.comName.toLowerCase();
        }
        return true;
    }).slice(0, 100);
    const endTime = performance.now();
    const loadTime = Math.round(endTime - startTime);
    displaySuggestions(matches, loadTime);
}
function displaySuggestions(suggestions, loadTime = 0) {
    const dropdown = document.getElementById('suggestionsDropdown');
    if (suggestions.length === 0) {
        hideSuggestions();
        return;
    }
    dropdown.innerHTML = '';
    suggestions.forEach((species, index) => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.dataset.index = index;
        suggestionItem.speciesData = species;
        const commonName = document.createElement('div');
        commonName.className = 'suggestion-common-name';
        const languageSelector = document.getElementById('languageSelector');
        const selectedLang = languageSelector ? languageSelector.value : 'comNameZh';
        commonName.textContent = species[selectedLang] || species.comNameZh || species.comName || 'Unknown';
        const scientificName = document.createElement('div');
        scientificName.className = 'suggestion-scientific-name';
        scientificName.textContent = species.sciName || '';
        suggestionItem.appendChild(commonName);
        suggestionItem.appendChild(scientificName);
        suggestionItem.addEventListener('click', () => {
            selectedSpecies = species;
            hideSuggestions();
            showSpeciesDetails(species);
        });
        dropdown.appendChild(suggestionItem);
    });
    dropdown.classList.add('show');
    currentSuggestionIndex = -1;
}
function hideSuggestions() {
    const dropdown = document.getElementById('suggestionsDropdown');
    dropdown.classList.remove('show');
    dropdown.innerHTML = '';
    currentSuggestionIndex = -1;
    originalInputValue = '';
}
function selectSpecies(species) {
    selectedSpecies = species;
    const searchInput = document.getElementById('searchInput');
    searchInput.value = species.comNameZh || species.comName || species.sciName;
    hideSuggestions();
}
function handleSuggestionKeyboard(event) {
    const dropdown = document.getElementById('suggestionsDropdown');
    const suggestions = dropdown.querySelectorAll('.suggestion-item');
    if (suggestions.length === 0) return;
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (currentSuggestionIndex === -1) {
            originalInputValue = document.getElementById('searchInput').value;
        }
        currentSuggestionIndex = Math.min(currentSuggestionIndex + 1, suggestions.length - 1);
        updateActiveSuggestion(suggestions);
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        if (currentSuggestionIndex === 0) {
            originalInputValue = document.getElementById('searchInput').value;
        }
        currentSuggestionIndex = Math.max(currentSuggestionIndex - 1, -1);
        updateActiveSuggestion(suggestions);
    } else if (event.key === 'Enter') {
        event.preventDefault();
        if (currentSuggestionIndex >= 0 && suggestions[currentSuggestionIndex]) {
            const species = suggestions[currentSuggestionIndex].speciesData;
            if (species) {
                selectedSpecies = species;
                    hideSuggestions();
                showSpeciesDetails(species);
                return;
            }
        }
        handleSearch();
    } else if (event.key === 'Escape') {
        if (originalInputValue !== '') {
            const searchInput = document.getElementById('searchInput');
            searchInput.value = originalInputValue;
            originalInputValue = '';
        }
        hideSuggestions();
    }
}
function updateActiveSuggestion(suggestions) {
    const searchInput = document.getElementById('searchInput');
    const languageSelector = document.getElementById('languageSelector');
    const selectedLang = languageSelector ? languageSelector.value : 'comNameZh';
    const dropdown = document.getElementById('suggestionsDropdown');
    suggestions.forEach((item, index) => {
        if (index === currentSuggestionIndex) {
            item.classList.add('active');
            const species = item.speciesData;
            if (species) {
                searchInput.value = species[selectedLang] || species.comNameZh || species.comName || species.sciName;
            }
            const itemTop = item.offsetTop;
            const itemHeight = item.offsetHeight;
            const dropdownScrollTop = dropdown.scrollTop;
            const dropdownHeight = dropdown.offsetHeight;
            if (itemTop < dropdownScrollTop) {
                dropdown.scrollTop = Math.max(0, itemTop - 8);
            }
            else if (itemTop + itemHeight > dropdownScrollTop + dropdownHeight) {
                dropdown.scrollTop = itemTop + itemHeight - dropdownHeight + 8;
            }
        } else {
            item.classList.remove('active');
        }
    });
    if (currentSuggestionIndex === -1) {
        searchInput.value = originalInputValue;
    }
}
function handleSearch() {
    if (!selectedSpecies) {
        const query = document.getElementById('searchInput').value.trim();
        if (!query) return;
        const languageSelector = document.getElementById('languageSelector');
        const selectedLangField = languageSelector ? languageSelector.value : 'comNameZh';
        
        const exactMatch = speciesData.find(species => {
            const matches = (species.comNameZh && species.comNameZh.toLowerCase() === query.toLowerCase()) ||
                (species.sciName && species.sciName.toLowerCase() === query.toLowerCase()) ||
                (species.comName && species.comName.toLowerCase() === query.toLowerCase());
            
            if (!matches) return false;
            
            // Apply language filtering: exclude species where selected language equals English name
            if (selectedLangField !== 'comName' && species[selectedLangField] && species.comName) {
                return species[selectedLangField].toLowerCase() !== species.comName.toLowerCase();
            }
            return true;
        });
        
        if (exactMatch) {
            selectedSpecies = exactMatch;
        } else {
            document.getElementById('resultsContainer').style.display = 'none';
            document.getElementById('noResults').style.display = 'block';
            return;
        }
    }
    showSpeciesDetails(selectedSpecies);
    hideSuggestions();
}
function showSpeciesDetails(species) {
    const resultsContainer = document.getElementById('resultsContainer');
    const noResults = document.getElementById('noResults');
    noResults.style.display = 'none';
    resultsContainer.innerHTML = '';
    const detailCard = createSpeciesDetailCard(species);
    resultsContainer.appendChild(detailCard);
    resultsContainer.style.display = 'block';
}
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback();
    }).catch(err => {});
}
function showCopyFeedback() {
    const feedback = document.createElement('div');
    feedback.className = 'copy-feedback';
    feedback.textContent = 'Copied!';
    document.body.appendChild(feedback);
    setTimeout(() => {
        document.body.removeChild(feedback);
    }, 1500);
}
function createSpeciesDetailCard(species) {
    const card = document.createElement('div');
    card.className = 'result-card';
    const titleSection = document.createElement('div');
    titleSection.className = 'title-section';
    const languageSelector = document.getElementById('languageSelector');
    const selectedLang = languageSelector ? languageSelector.value : 'comNameZh';
    const commonNameText = species[selectedLang] || species.comNameZh || species.comName || 'Unknown';
    if (commonNameText && commonNameText !== 'Unknown') {
        const commonNameTitle = document.createElement('h2');
        commonNameTitle.className = 'common-name-title clickable';
        commonNameTitle.textContent = commonNameText;
        commonNameTitle.title = 'Click to copy';
        commonNameTitle.addEventListener('click', () => {
            copyToClipboard(commonNameText);
        });
        titleSection.appendChild(commonNameTitle);
    }
    const scientificName = document.createElement('h3');
    scientificName.className = 'scientific-name-subtitle clickable';
    scientificName.textContent = species.sciName || '';
    scientificName.title = 'Click to copy';
    scientificName.addEventListener('click', () => {
        copyToClipboard(species.sciName || '');
    });
    titleSection.appendChild(scientificName);
    card.appendChild(titleSection);
    if (species.bandingCodes || species.comNameCodes || species.sciNameCodes) {
        const metadata = document.createElement('div');
        metadata.className = 'species-metadata';
        const metadataItems = [
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
    const languagesList = document.createElement('div');
    languagesList.className = 'languages-list';
    Object.entries(languageNames).forEach(([field, langName]) => {
        if (species[field]) {
            // Filter out languages where the name equals the English name
            // This means the species doesn't have a proper name in that language
            if (field !== 'comName' && species.comName && species[field].toLowerCase() === species.comName.toLowerCase()) {
                return; // Skip this language
            }
            
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
    return card;
}
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}
function clearSearch() {
    document.getElementById('searchInput').value = '';
    selectedSpecies = null;
    hideSuggestions();
    document.getElementById('resultsContainer').style.display = 'none';
    document.getElementById('noResults').style.display = 'none';
    document.getElementById('resultCount').textContent = '';
}
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const languageSelector = document.getElementById('languageSelector');
    loadSpeciesData();
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        selectedSpecies = null;
        currentSuggestionIndex = -1;
        originalInputValue = '';
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            showSuggestions(e.target.value);
        }, 300);
    });
    searchInput.addEventListener('keydown', (e) => {
        handleSuggestionKeyboard(e);
    });
    searchButton.addEventListener('click', handleSearch);
    languageSelector.addEventListener('change', (e) => {
        selectedLanguage = e.target.value;
        const dropdown = document.getElementById('suggestionsDropdown');
        if (dropdown.classList.contains('show')) {
            const query = searchInput.value;
            if (query.trim()) {
                showSuggestions(query);
            }
        }
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-input-container')) {
            hideSuggestions();
        }
    });
});
