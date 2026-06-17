const GEOAPIFY_API_KEY = '7f36ceac7201486d92a42c5920be9a1a'; // Вставьте ключ сюда

// Универсальная функция для настройки автодополнения
function setupAutocomplete(inputId, listId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    let timeoutId;

    input.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        clearTimeout(timeoutId);

        // Если введено меньше 3 символов — скрываем список
        if (query.length < 3) {
            list.classList.remove('active');
            list.innerHTML = '';
            return;
        }

        // Debounce: ждем 400мс после последнего нажатия
        timeoutId = setTimeout(() => {
            fetchCities(query, input, list);
        }, 400);
    });
}

// Функция запроса к API
async function fetchCities(query, inputElement, listElement) {
    // Ищем города, язык ответа можно поменять на 'en', если сайт английский
    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&type=city&lang=en&limit=5&apiKey=${GEOAPIFY_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        listElement.innerHTML = ''; // Очищаем старые результаты

        if (data.features && data.features.length > 0) {
            data.features.forEach(feature => {
                const cityName = feature.properties.formatted;
                const li = document.createElement('li');
                li.textContent = cityName;
                
                // При клике на город
                li.addEventListener('click', () => {
                    inputElement.value = cityName;
                    listElement.classList.remove('active');
                });
                
                listElement.appendChild(li);
            });
            listElement.classList.add('active'); // Показываем список
        } else {
            listElement.classList.remove('active'); // Скрываем, если ничего не найдено
        }
    } catch (error) {
        console.error('API Error:', error);
    }
}

// 1. Инициализируем оба поля
setupAutocomplete('departure', 'departure-suggestions');
setupAutocomplete('destination', 'destination-suggestions');

// 2. Закрываем списки при клике в любое другое место
document.addEventListener('click', function(e) {
    if (!e.target.closest('.input-group')) {
        document.querySelectorAll('.suggestions-list').forEach(list => {
            list.classList.remove('active');
        });
    }
});

// 3. Бонус: оживляем кнопку смены маршрута (Swap button)
document.getElementById('swapBtn').addEventListener('click', () => {
    const departureInput = document.getElementById('departure');
    const destinationInput = document.getElementById('destination');
    
    // Меняем значения местами
    const temp = departureInput.value;
    departureInput.value = destinationInput.value;
    destinationInput.value = temp;
});
