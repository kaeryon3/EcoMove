// Autocomplete setup for departure and destination inputs
function setupAutocomplete(inputId, listId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    let timeoutId;

    input.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        clearTimeout(timeoutId);

        if (query.length < 3) {
            list.classList.remove('active');
            list.innerHTML = '';
            return;
        }

        timeoutId = setTimeout(() => {
            fetchCities(query, input, list);
        }, 400);
    });
}

// Function to fetch cities from Geoapify API
async function fetchCities(query, inputElement, listElement) {
    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&type=city&lang=en&limit=5&apiKey=7f36ceac7201486d92a42c5920be9a1a`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        listElement.innerHTML = '';

        if (data.features && data.features.length > 0) {
            data.features.forEach(feature => {
                const cityName = feature.properties.formatted;
                const li = document.createElement('li');
                li.textContent = cityName;
                
                li.addEventListener('click', () => {
                    inputElement.value = cityName;
                    listElement.classList.remove('active');
                });
                
                listElement.appendChild(li);
            });
            listElement.classList.add('active');
        } else {
            listElement.classList.remove('active');
        }
    } catch (error) {
        console.error('API Error:', error);
    }
}

setupAutocomplete('departure', 'departure-suggestions');
setupAutocomplete('destination', 'destination-suggestions');

document.addEventListener('click', function(e) {
    if (!e.target.closest('.input-group')) {
        document.querySelectorAll('.suggestions-list').forEach(list => {
            list.classList.remove('active');
        });
    }
});

document.getElementById('swapBtn').addEventListener('click', () => {
    const departureInput = document.getElementById('departure');
    const destinationInput = document.getElementById('destination');
    
    const temp = departureInput.value;
    departureInput.value = destinationInput.value;
    destinationInput.value = temp;
});
