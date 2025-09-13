// Global Variables
let currentTripData = {};

// Predefined data for better user experience
const DESTINATIONS = {
    domestic: [
        'Goa', 'Manali', 'Udaipur', 'Jaipur', 'Kerala', 'Shimla', 'Darjeeling', 
        'Rishikesh', 'Agra', 'Varanasi', 'Mumbai', 'Delhi', 'Bangalore', 'Mysore'
    ],
    international: [
        'Paris', 'London', 'Tokyo', 'New York', 'Dubai', 'Thailand', 'Singapore', 
        'Bali', 'Rome', 'Barcelona', 'Amsterdam', 'Sydney', 'Hong Kong', 'Seoul'
    ]
};

const BUDGET_BREAKDOWN = {
    domestic: {
        accommodation: 35,
        food: 25,
        transport: 20,
        activities: 15,
        shopping: 5
    },
    international: {
        accommodation: 40,
        food: 20,
        transport: 25,
        activities: 10,
        shopping: 5
    }
};

const TRAVEL_TIPS = {
    'goa': {
        budgetFriendly: [
            'Visit free beaches like Arambol and Vagator',
            'Use local buses instead of taxis',
            'Eat at beach shacks for authentic food',
            'Stay in hostels or guesthouses',
            'Rent a scooter for local transport'
        ],
        avoid: [
            'Expensive beach clubs in South Goa',
            'Tourist trap restaurants near hotels',
            'Overpriced water sports at popular beaches',
            'Shopping at airport or hotel stores'
        ]
    },
    'manali': {
        budgetFriendly: [
            'Trek to free viewpoints like Jogini Falls',
            'Use local buses for Rohtang Pass',
            'Stay in Old Manali for cheaper options',
            'Visit Hadimba Temple (free entry)',
            'Explore local markets for souvenirs'
        ],
        avoid: [
            'Peak season hotel rates (May-June)',
            'Expensive adventure sports packages',
            'Tourist taxi services',
            'Restaurants on Mall Road'
        ]
    },
    'udaipur': {
        budgetFriendly: [
            'Walk around City Palace area',
            'Take boat rides in evening for better rates',
            'Stay in heritage budget hotels',
            'Visit Saheliyon ki Bari garden',
            'Explore local markets'
        ],
        avoid: [
            'Luxury palace hotels without booking',
            'Tourist restaurants near Lake Pichola',
            'Expensive evening cultural shows',
            'High-end handicraft stores'
        ]
    },
    'paris': {
        budgetFriendly: [
            'Visit free museums on first Sunday',
            'Use public transport with weekly passes',
            'Picnic in parks with local food',
            'Walk along Seine river',
            'Visit free attractions like Sacré-Cœur'
        ],
        avoid: [
            'Tourist restaurants near Eiffel Tower',
            'Expensive Seine river dinner cruises',
            'Shopping on Champs-Élysées',
            'Hotel breakfast (expensive)'
        ]
    },
    'london': {
        budgetFriendly: [
            'Visit free museums like British Museum',
            'Use Oyster card for transport',
            'Explore free parks and markets',
            'Watch street performances',
            'Take free walking tours'
        ],
        avoid: [
            'Peak season hotel rates',
            'Tourist pubs near attractions',
            'West End show premium seats',
            'Airport transport (expensive)'
        ]
    },
    'tokyo': {
        budgetFriendly: [
            'Use JR Pass for unlimited train travel',
            'Eat at local ramen shops',
            'Visit free temples and gardens',
            'Shop at 100 yen stores',
            'Stay in capsule hotels or hostels'
        ],
        avoid: [
            'Expensive sushi restaurants in Ginza',
            'Peak season accommodation',
            'Tourist trap restaurants',
            'Expensive department stores'
        ]
    }
};

// DOM Elements
const form = document.getElementById('plannerForm');
const loadingSection = document.getElementById('loading');
const resultsSection = document.getElementById('results');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input');
const toast = document.getElementById('toast');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    form.addEventListener('submit', handleFormSubmit);
    
    // Add loading animation to form elements
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (this.parentElement) this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            if (this.parentElement) this.parentElement.style.transform = 'translateY(0)';
        });
    });
});

// Form Submission Handler
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const tripData = {
        budget: parseInt(formData.get('budget')),
        days: parseInt(formData.get('days')),
        destination: formData.get('destination').trim(),
        travelType: formData.get('travelType')
    };

    currentTripData = tripData;
    
    showLoading();
    
    try {
        await generateTravelPlan(tripData);
        showResults();
    } catch (error) {
        console.error('Error generating travel plan:', error);
        showToast('❌ Error generating travel plan. Please try again!');
        hideLoading();
    }
}

// Show Loading State
function showLoading() {
    const travelFormEl = document.getElementById('travel-form');
    if (travelFormEl) travelFormEl.style.display = 'none';
    if (loadingSection) {
        loadingSection.classList.remove('loading-hidden');
        loadingSection.style.display = 'block';
    }
    if (resultsSection) resultsSection.classList.add('results-hidden');
}

// Hide Loading State
function hideLoading() {
    if (loadingSection) loadingSection.classList.add('loading-hidden');
    setTimeout(() => {
        if (loadingSection) loadingSection.style.display = 'none';
    }, 300);
}

// Show Results
function showResults() {
    hideLoading();
    if (resultsSection) {
        resultsSection.classList.remove('results-hidden');
        resultsSection.style.display = 'block';
        // Smooth scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Generate Travel Plan
async function generateTravelPlan(tripData) {
    const { budget, days, destination, travelType } = tripData;
    
    // Update destination header
    updateDestinationHeader(destination, travelType);
    
    // Load destination image
    await loadDestinationImage(destination);
    
    // Generate budget breakdown
    generateBudgetBreakdown(budget, days, travelType);
    
    // Load weather data
    await loadWeatherData(destination);
    
    // Load tourist attractions
    await loadTouristAttractions(destination);
    
    // Generate travel tips
    generateTravelTips(destination.toLowerCase(), travelType);
}

// Update Destination Header
function updateDestinationHeader(destination, travelType) {
    const destNameEl = document.getElementById('destination-name');
    const destTypeEl = document.getElementById('destination-type');
    if (destNameEl) destNameEl.textContent = destination;
    if (destTypeEl) destTypeEl.textContent = `${travelType.charAt(0).toUpperCase() + travelType.slice(1)} Destination`;
}

// Load Destination Image
const API_KEY = "49779190-56ac3b8e27bb9397dd241c851";

// Function to load destination image
async function loadDestinationImage(destination) {
    const img = document.getElementById("destination-photo"); 
    const url = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(destination)}&image_type=photo&orientation=horizontal&per_page=3`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch Pixabay API");

        const data = await response.json();

        if (data.hits && data.hits.length > 0) {
            // Use the first matching image
            img.src = data.hits[0].largeImageURL;
            img.alt = `Beautiful view of ${destination}`;
        } else {
            // Fallback Unsplash random image
            img.src = `https://source.unsplash.com/800x400/?${encodeURIComponent(destination)},travel`;
            img.alt = `Beautiful view of ${destination}`;
        }

    } catch (error) {
        console.error("Error loading Pixabay image:", error);

        // Fallback Unsplash if API fails
        img.src = `https://source.unsplash.com/800x400/?${encodeURIComponent(destination)},travel`;
        img.alt = `Beautiful view of ${destination}`;
    }
}

// Generate Budget Breakdown
function generateBudgetBreakdown(budget, days, travelType) {
    const breakdown = BUDGET_BREAKDOWN[travelType];
    const budgetGrid = document.getElementById('budget-breakdown');
    
    const categories = [
        { key: 'accommodation', icon: '🏨', name: 'Accommodation' },
        { key: 'food', icon: '🍽', name: 'Food & Dining' },
        { key: 'transport', icon: '🚗', name: 'Transportation' },
        { key: 'activities', icon: '🎯', name: 'Activities' },
        { key: 'shopping', icon: '🛍', name: 'Shopping' }
    ];
    
    budgetGrid.innerHTML = categories.map(category => {
        const amount = Math.round((budget * breakdown[category.key]) / 100);
        const dailyAmount = Math.round(amount / days);
        
        return `
            <div class="budget-item">
                <div class="budget-category">${category.icon} ${category.name}</div>
                <div class="budget-amount">₹${amount.toLocaleString()}</div>
                <div class="budget-percentage">${breakdown[category.key]}% • ₹${dailyAmount}/day</div>
            </div>
        `;
    }).join('');
}

// Load Weather Data
async function loadWeatherData(destination) {
    const weatherContainer = document.getElementById('weather-info');
    weatherContainer.innerHTML = `
        <div class="weather-loading">
            <div class="loading-spinner" style="width: 32px; height: 32px;"></div>
            <span>Loading weather...</span>
        </div>
    `;

    const apiKey = "9a4acb8d47cf4c86a5943744250604"; // Replace with your actual WeatherAPI key
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(destination)}&aqi=yes`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather API error');
        const data = await response.json();

        weatherContainer.innerHTML = `
            <div class="weather-main">
                <img src="${data.current.condition.icon}" alt="${data.current.condition.text}" class="weather-icon">
                <div>
                    <h4>${data.location.name}, ${data.location.country}</h4>
                    <p>${data.current.condition.text}</p>
                    <p>🌡 ${data.current.temp_c}°C &nbsp; 💧 Humidity: ${data.current.humidity}%</p>
                    <p>🌬 Wind: ${data.current.wind_kph} km/h</p>
                    <p>🌅 Local Time: ${data.location.localtime}</p>
                </div>
            </div>
        `;
    } catch (error) {
        weatherContainer.innerHTML = `
            <div class="weather-error">
                <span>⚠ Unable to load weather data for ${destination}. Please try again later.</span>
            </div>
        `;
        console.error('Weather API error:', error);
    }
}

// Load Tourist Attractions
async function loadTouristAttractions(destination) {
    const attractionsGrid = document.getElementById('attractions-grid');
    if (!attractionsGrid) return;
    
    // Show loading state
    attractionsGrid.innerHTML = `
        <div class="attraction-card">
            <div style="height: 200px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center;">
                <div class="loading-spinner" style="width: 40px; height: 40px;"></div>
            </div>
            <div class="attraction-info">
                <div style="height: 20px; background: rgba(255,255,255,0.1); margin-bottom: 12px; border-radius: 4px;"></div>
                <div style="height: 60px; background: rgba(255,255,255,0.05); border-radius: 4px;"></div>
            </div>
        </div>
    `.repeat(4);
    
    try {
        // Try to get attractions using Wikipedia API
        const attractions = await fetchWikipediaAttractions(destination);
        
        if (attractions && attractions.length > 0) {
            attractionsGrid.innerHTML = attractions.map(attraction => `
                <div class="attraction-card" onclick="window.open('${attraction.url}', '_blank')">
                    <img src="${attraction.image}" alt="${attraction.title}" class="attraction-image" 
                         onerror="this.src='https://source.unsplash.com/300x200/?${encodeURIComponent(attraction.title)},landmark'">
                    <div class="attraction-info">
                        <h4 class="attraction-title">${attraction.title}</h4>
                        <p class="attraction-description">${attraction.description}</p>
                        <a href="${attraction.url}" class="attraction-link" target="_blank">Learn More →</a>
                    </div>
                </div>
            `).join('');
        } else {
            // Fallback to generic attractions
            generateFallbackAttractions(destination, attractionsGrid);
        }
    } catch (error) {
        console.error('Error loading attractions:', error);
        generateFallbackAttractions(destination, attractionsGrid);
    }
}

// Fetch Wikipedia Attractions
async function fetchWikipediaAttractions(destination) {
    try {
        // Search for attractions in the destination
        const searchResponse = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/search/${encodeURIComponent(destination + ' attractions')}`
        );
        const searchData = await searchResponse.json();
        
        if (!searchData.pages || searchData.pages.length === 0) {
            return null;
        }
        
        const attractions = [];
        const maxAttractions = Math.min(4, searchData.pages.length);
        
        for (let i = 0; i < maxAttractions; i++) {
            try {
                const page = searchData.pages[i];
                const summaryResponse = await fetch(
                    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.title)}`
                );
                const summaryData = await summaryResponse.json();
                
                attractions.push({
                    title: summaryData.title,
                    description: (summaryData.extract ? summaryData.extract.substring(0, 150) : '') + '...',
                    image: summaryData.thumbnail ? summaryData.thumbnail.source : 
                           `https://source.unsplash.com/300x200/?${encodeURIComponent(summaryData.title)},landmark`,
                    url: summaryData.content_urls ? summaryData.content_urls.desktop.page : `https://en.wikipedia.org/wiki/${encodeURIComponent(summaryData.title)}`
                });
            } catch (error) {
                console.error('Error fetching attraction summary:', error);
                continue;
            }
        }
        
        return attractions.length > 0 ? attractions : null;
    } catch (error) {
        console.error('Error searching attractions:', error);
        return null;
    }
}

// Generate Fallback Attractions
function generateFallbackAttractions(destination, container) {
    const fallbackAttractions = [
        {
            title: `Historic Center of ${destination}`,
            description: "Explore the beautiful historic center with its charming streets, local architecture, and cultural landmarks.",
            image: `https://source.unsplash.com/300x200/?${encodeURIComponent(destination)},historic,center`
        },
        {
            title: `${destination} Cultural District`,
            description: "Discover local culture, museums, art galleries, and traditional markets in this vibrant district.",
            image: `https://source.unsplash.com/300x200/?${encodeURIComponent(destination)},culture,museum`
        },
        {
            title: `${destination} Natural Beauty`,
            description: "Experience the stunning natural landscapes, parks, gardens, and scenic viewpoints around the city.",
            image: `https://source.unsplash.com/300x200/?${encodeURIComponent(destination)},nature,landscape`
        },
        {
            title: "Local Markets & Cuisine",
            description: `Taste authentic local food, visit bustling markets, and experience the culinary delights of ${destination}.`,
            image: `https://source.unsplash.com/300x200/?${encodeURIComponent(destination)},food,market`
        }
    ];
    
    container.innerHTML = fallbackAttractions.map(attraction => `
        <div class="attraction-card">
            <img src="${attraction.image}" alt="${attraction.title}" class="attraction-image">
            <div class="attraction-info">
                <h4 class="attraction-title">${attraction.title}</h4>
                <p class="attraction-description">${attraction.description}</p>
                <span class="attraction-link">Popular Destination 🌟</span>
            </div>
        </div>
    `).join('');
}

// Generate Travel Tips
function generateTravelTips(destination, travelType) {
    const tips = TRAVEL_TIPS[destination] || generateGenericTips(travelType);
    
    const budgetFriendlyList = document.getElementById('budget-friendly');
    const avoidSpotsList = document.getElementById('avoid-spots');
    
    if (budgetFriendlyList) {
        budgetFriendlyList.innerHTML = tips.budgetFriendly.map(tip => `<li>💡 ${tip}</li>`).join('');
    }
    
    if (avoidSpotsList) {
        avoidSpotsList.innerHTML = tips.avoid.map(tip => `<li>⚠ ${tip}</li>`).join('');
    }
}

// Generate Generic Tips
function generateGenericTips(travelType) {
    if (travelType === 'domestic') {
        return {
            budgetFriendly: [
                'Use public transportation instead of private taxis',
                'Book accommodation in advance for better deals',
                'Eat at local restaurants rather than hotel dining',
                'Look for free walking tours and attractions',
                'Travel during off-peak seasons for lower prices'
            ],
            avoid: [
                'Peak season hotel and flight bookings',
                'Tourist trap restaurants near major attractions',
                'Expensive guided tours (explore on your own)',
                'Airport food and shopping (overpriced)'
            ]
        };
    } else {
        return {
            budgetFriendly: [
                'Book flights well in advance or look for deals',
                'Use public transport and walking instead of taxis',
                'Stay in hostels or budget accommodations',
                'Cook some meals if accommodation has kitchen',
                'Look for free museums and attractions'
            ],
            avoid: [
                'Currency exchange at airports (poor rates)',
                'Tourist restaurants in main squares',
                'Expensive international roaming charges',
                'Peak season travel without advance booking'
            ]
        };
    }
}

// Surprise Me Functionality
function surpriseMe(event) {
    const allDestinations = [...DESTINATIONS.domestic, ...DESTINATIONS.international];
    const randomDestination = allDestinations[Math.floor(Math.random() * allDestinations.length)];
    const isInternational = DESTINATIONS.international.includes(randomDestination);
    
    // Fill form with random data
    const destEl = document.getElementById('destination');
    const travelTypeEl = document.getElementById('travelType');
    const budgetEl = document.getElementById('budget');
    const daysEl = document.getElementById('days');
    if (destEl) destEl.value = randomDestination;
    if (travelTypeEl) travelTypeEl.value = isInternational ? 'international' : 'domestic';
    if (budgetEl) budgetEl.value = Math.floor(Math.random() * 50000) + 10000;
    if (daysEl) daysEl.value = Math.floor(Math.random() * 10) + 3;
    
    // Add fun animation
    const surpriseBtn = (event && event.target) ? event.target.closest('.btn') : document.querySelector('.btn');
    if (surpriseBtn) {
        surpriseBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            surpriseBtn.style.transform = '';
        }, 500);
    }
    
    showToast(`🎲 Surprise! How about ${randomDestination}?`);
}

// Dark Mode Toggle
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const modeIcon = document.getElementById('mode-icon');
    const isDark = document.body.classList.contains('dark');
    
    if (modeIcon) modeIcon.textContent = isDark ? '☀' : '🌙';
    
    // Save preference
    localStorage.setItem('darkMode', isDark.toString());
    
    showToast(isDark ? '🌙 Dark mode enabled' : '☀ Light mode enabled');
}

// Load Dark Mode Preference
document.addEventListener('DOMContentLoaded', function() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        document.body.classList.add('dark');
        const modeIcon = document.getElementById('mode-icon');
        if (modeIcon) modeIcon.textContent = '☀';
    }
});

// Chatbot Functions
function toggleChatbot() {
    if (chatbotWindow) chatbotWindow.classList.toggle('chatbot-hidden');
    
    if (chatbotWindow && !chatbotWindow.classList.contains('chatbot-hidden')) {
        if (chatbotInput) chatbotInput.focus();
    }
}

function handleChatInput(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

async function sendChatMessage() {
    const message = chatbotInput ? chatbotInput.value.trim() : '';
    if (!message) return;
    
    // Add user message
    const typingId = addChatMessage(message, 'user');
    if (chatbotInput) chatbotInput.value = '';
    
    // Add typing indicator
    const typingIndicatorId = addChatMessage('🤖 Typing...', 'bot');
    
    try {
        const response = await getChatbotResponse(message);
        
        // Remove typing indicator and add real response
        const typingEl = document.getElementById(typingIndicatorId);
        if (typingEl) typingEl.remove();
        addChatMessage(response, 'bot');
    } catch (error) {
        const typingEl = document.getElementById(typingIndicatorId);
        if (typingEl) typingEl.remove();
        addChatMessage('Sorry, I encountered an error. Please try asking something else!', 'bot');
    }
}

function addChatMessage(message, sender) {
    const messageDiv = document.createElement('div');
    const messageId = 'msg-' + Date.now();
    messageDiv.id = messageId;
    messageDiv.className = `chat-message ${sender}-message`;
    messageDiv.innerHTML = `<p>${message}</p>`;
    
    if (chatbotMessages) {
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    return messageId;
}

async function getChatbotResponse(query) {
    try {
        // Add destination context if available
        const contextualQuery = currentTripData.destination 
            ? `${query} ${currentTripData.destination}` 
            : query;
        
        const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(contextualQuery)}&format=json&no_html=1&skip_disambig=1`);
        const data = await response.json();
        
        if (data.AbstractText) {
            return data.AbstractText;
        } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            return data.RelatedTopics[0].Text;
        } else {
            return getFallbackResponse(query);
        }
    } catch (error) {
        return getFallbackResponse(query);
    }
}

function getFallbackResponse(query) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('weather')) {
        return "Check the weather section above for current conditions! 🌤";
    } else if (lowerQuery.includes('budget')) {
        return "I've created a smart budget breakdown for your trip above. Remember to allocate funds wisely across accommodation, food, transport, and activities! 💰";
    } else if (lowerQuery.includes('attraction') || lowerQuery.includes('place')) {
        return "Check out the attractions section above for must-visit places! I've curated the best spots based on your destination. 🏛";
    } else if (lowerQuery.includes('food')) {
        return "Don't miss trying local cuisine! Look for authentic local restaurants and street food - they're usually more budget-friendly and delicious! 🍽";
    } else if (lowerQuery.includes('transport')) {
        return "Public transport is usually your best bet for budget travel. Consider getting daily/weekly passes if available! 🚗";
    } else {
        return "That's a great question! While I search for more info, check out your personalized travel plan above - it has tons of useful details! ✨";
    }
}

// Save Itinerary Function
function saveItinerary() {
    if (!currentTripData.destination) {
        showToast('❌ No itinerary to save. Generate a plan first!');
        return;
    }
    
    const itinerary = generateItineraryText();
    const blob = new Blob([itinerary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTripData.destination}-Itinerary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('💾 Itinerary saved successfully!');
}

function generateItineraryText() {
    const { destination, budget, days, travelType } = currentTripData;
    
    return `
🌟 TRAVEL ITINERARY - ${destination ? destination.toUpperCase() : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Destination: ${destination}
🌍 Travel Type: ${travelType ? (travelType.charAt(0).toUpperCase() + travelType.slice(1)) : ''}
💰 Budget: ₹${budget ? budget.toLocaleString() : '0'}
📅 Duration: ${days ? days : 0} days

💸 BUDGET BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏨 Accommodation: ₹${Math.round(budget * (BUDGET_BREAKDOWN[travelType]?.accommodation || 0) / 100).toLocaleString()}
🍽 Food & Dining: ₹${Math.round(budget * (BUDGET_BREAKDOWN[travelType]?.food || 0) / 100).toLocaleString()}
🚗 Transportation: ₹${Math.round(budget * (BUDGET_BREAKDOWN[travelType]?.transport || 0) / 100).toLocaleString()}
🎯 Activities: ₹${Math.round(budget * (BUDGET_BREAKDOWN[travelType]?.activities || 0) / 100).toLocaleString()}
🛍 Shopping: ₹${Math.round(budget * (BUDGET_BREAKDOWN[travelType]?.shopping || 0) / 100).toLocaleString()}

✅ BUDGET-FRIENDLY TIPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getTipsForDestination(destination ? destination.toLowerCase() : '').budgetFriendly.map(tip => `• ${tip}`).join('\n')}

❌ PLACES TO AVOID (OVERPRICED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getTipsForDestination(destination ? destination.toLowerCase() : '').avoid.map(tip => `• ${tip}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by TravelVibes ✈ - Your AI Travel Companion
Happy Travels! 🌟
`;
}

function getTipsForDestination(destination) {
    return TRAVEL_TIPS[destination] || generateGenericTips(currentTripData.travelType);
}

// Plan New Trip
function planNewTrip() {
    // Reset form
    if (form) form.reset();
    currentTripData = {};
    
    // Hide results and show form
    if (resultsSection) resultsSection.classList.add('results-hidden');
    const travelFormEl = document.getElementById('travel-form');
    if (travelFormEl) travelFormEl.style.display = 'block';
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    showToast('🆕 Ready for a new adventure!');
}

// Toast Notification Function
function showToast(message) {
    const toastMessage = document.getElementById('toast-message');
    if (!toastMessage || !toast) return;
    toastMessage.textContent = message;
    
    toast.classList.remove('toast-hidden');
    
    setTimeout(() => {
        toast.classList.add('toast-hidden');
    }, 3000);
}

// Add smooth animations on scroll
window.addEventListener('scroll', function() {
    const cards = document.querySelectorAll('.glass-card');
    
    cards.forEach(card => {
        const cardTop = card.getBoundingClientRect().top;
        const cardVisible = cardTop < window.innerHeight && cardTop > 0;
        
        if (cardVisible) {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }
    });
});

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Add welcome message
    setTimeout(() => {
        showToast('✨ Welcome to TravelVibes! Plan your perfect trip!');
    }, 1000);
    
    // Add subtle animations to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});