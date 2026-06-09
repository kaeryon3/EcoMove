const departureInput = document.getElementById("departure");
// Инициализируем Awesomplete
const awesomplete = new Awesomplete(departureInput, {
    minChars: 3, // Начинаем искать после 3-го символа
    maxItems: 5  // Ограничиваем количество результатов
});

departureInput.addEventListener("input", function() {
    const query = this.value;
    if (query.length < 3) return;

    // Запрос к Nominatim
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`)
        .then(response => response.json())
        .then(data => {
            // Формируем массив названий для выпадающего списка
            const results = data.map(item => item.display_name);
            awesomplete.list = results;
        })
        .catch(err => console.error("Ошибка API:", err));
});