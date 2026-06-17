document.addEventListener('DOMContentLoaded', () => {
    const GEOAPIFY_API_KEY = '7f36ceac7201486d92a42c5920be9a1a';

    const TARIFF_COEFFICIENTS = {
        'econom': 0.9,
        'standard': 1.2,
        'business-s': 1.8,
        'business-v': 2,
        'cargo': 1.5
    };

    const MIN_PRICES = {
        'econom': 27,
        'standard': 35,
        'business-s': 45,
        'business-v': 55,
        'cargo': 40
    };

    const tariffMap = {
        'Skoda Octavia': 'econom',
        'Toyota Camry': 'standard',
        'Mercedes-Benz S-Class': 'business-s',
        'Mercedes-Benz V-Class': 'business-v',
        'Mercedes-Benz Vito': 'cargo'
    };

    let routeCoords = { from: null, to: null };
    let calculatedDistanceKm = 0;
    let calculatedTimeMin = 0; 

    const modal = document.getElementById('bookingModal');
    const closeModalBtn = document.getElementById('closeModal');
    const bookButtons = document.querySelectorAll('.book-btn');
    const tariffSelect = document.getElementById('tariffSelect');
    const form = document.getElementById('bookingForm');

    const phoneInput = document.getElementById('userPhone');
    const emailInput = document.getElementById('userEmail');
    const dateTimeInput = document.getElementById('dateTime');
    const dateGroup = document.getElementById('dateGroup');
    const fromGroup = document.getElementById('fromGroup');
    const toGroup = document.getElementById('toGroup');

    const priceBox = document.getElementById('priceBox');
    const distanceText = document.getElementById('distanceText'); 
    const priceText = document.getElementById('priceText');

    const phoneRegex = /^\+?[\d\s-]{9,20}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const originalSubmitText = form.querySelector('.submit-btn').textContent.trim();

    function calculateFinalPrice(tariff, distance) {
        if (!distance || distance <= 0) return 0;
        const calculated = Math.round(distance * (TARIFF_COEFFICIENTS[tariff] || 1));
        const minPrice = MIN_PRICES[tariff] || 0;
        return Math.max(calculated, minPrice);
    }

    // --- Modal ---
    bookButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const existingMsg = form.querySelector('.success-message');
            if (existingMsg) existingMsg.remove();
            Array.from(form.children).forEach(child => child.style.display = '');
            const submitBtn = form.querySelector('.submit-btn');
            submitBtn.removeAttribute('style');
            submitBtn.innerText = originalSubmitText;

            const card = e.target.closest('.price-card');
            if (card) {
                const carName = card.querySelector('h3').textContent.trim();
                if (tariffMap[carName]) {
                    tariffSelect.value = tariffMap[carName];
                }
            }
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; 
            updateOrderPrice();
        });
    });

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // --- Calendar ---
    flatpickr("#dateTime", {
        enableTime: true,
        dateFormat: "d.m.Y H:i",
        minDate: "today",
        time_24hr: true,
        disableMobile: "true",
        onChange: function(selectedDates, dateStr) {
            if (dateStr) {
                dateGroup.classList.remove('has-error');
                dateGroup.classList.add('has-success');
            }
        }
    });

    // --- Validation ---
    function validateField(input, regex) {
        const group = input.closest('.validation-group');
        const isValid = regex.test(input.value.trim());
        group.classList.toggle('has-success', isValid);
        group.classList.toggle('has-error', !isValid);
        return isValid;
    }

    function validateDate() {
        const isValid = dateTimeInput.value.trim() !== "";
        dateGroup.classList.toggle('has-success', isValid);
        dateGroup.classList.toggle('has-error', !isValid);
        return isValid;
    }

    function validateAddress(type, groupElement) {
        const isValid = routeCoords[type] !== null;
        groupElement.classList.toggle('has-success', isValid);
        groupElement.classList.toggle('has-error', !isValid);
        return isValid;
    }

    phoneInput.addEventListener('input', () => {
        if (phoneInput.value.trim() === '') {
            phoneInput.closest('.validation-group').classList.remove('has-error', 'has-success');
            return;
        }
        validateField(phoneInput, phoneRegex);
    });

    emailInput.addEventListener('input', () => {
        if (emailInput.value.trim() === '') {
            emailInput.closest('.validation-group').classList.remove('has-error', 'has-success');
            return;
        }
        validateField(emailInput, emailRegex);
    });

    // --- Autocomplete ---
    function setupAutocomplete(inputId, listId, type) {
        const input = document.getElementById(inputId);
        const list = document.getElementById(listId);
        let timeoutId;

        input.addEventListener('input', function(e) {
            const query = e.target.value.trim();
            clearTimeout(timeoutId);

            routeCoords[type] = null;
            calculatedDistanceKm = 0;
            calculatedTimeMin = 0;
            updateOrderPrice();
            input.closest('.validation-group').classList.remove('has-success', 'has-error');

            if (query.length < 3) {
                list.classList.remove('active');
                list.innerHTML = '';
                return;
            }

            timeoutId = setTimeout(() => {
                fetchCities(query, input, list, type);
            }, 400);
        });

        document.addEventListener('click', function(e) {
            if (e.target !== input && e.target !== list) {
                list.classList.remove('active');
            }
        });
    }

    // --- Geocoding API ---
    function fetchCities(query, input, list, type) {
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&lang=ru&limit=5&apiKey=${GEOAPIFY_API_KEY}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                list.innerHTML = '';
                if (!data.features || data.features.length === 0) {
                    list.classList.remove('active');
                    return;
                }

                data.features.forEach(feature => {
                    const address = feature.properties.formatted;
                    const item = document.createElement('div');
                    item.className = 'autocomplete-item';
                    item.textContent = address;

                    item.addEventListener('click', () => {
                        input.value = address;
                        list.classList.remove('active');
                        
                        routeCoords[type] = {
                            lat: feature.properties.lat,
                            lon: feature.properties.lon
                        };

                        input.closest('.validation-group').classList.remove('has-error');
                        input.closest('.validation-group').classList.add('has-success');

                        if (routeCoords.from && routeCoords.to) {
                            calculateRouteDistance();
                        }
                    });
                    list.appendChild(item);
                });
                list.classList.add('active');
            })
            .catch(err => console.error("Autocomplete error:", err));
    }

    // --- Routing ---
    function calculateRouteDistance() {
        const from = routeCoords.from;
        const to = routeCoords.to;
        const url = `https://api.geoapify.com/v1/routing?waypoints=${from.lat},${from.lon}|${to.lat},${to.lon}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`;

        distanceText.innerText = "Высчитываем примерное время поездки и цену...";
        priceText.innerText = "";
        priceBox.style.display = 'flex';

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (data.features && data.features.length > 0 && data.features[0].properties.distance) {
                    const routeProps = data.features[0].properties;
                    calculatedDistanceKm = routeProps.distance / 1000;
                    calculatedTimeMin = routeProps.time / 60; 
                    updateOrderPrice(); 
                } else {
                    distanceText.innerText = "Ошибка построения маршрута API";
                }
            })
            .catch(err => {
                console.error("Routing API error:", err);
                distanceText.innerText = "Ошибка сети при расчете";
            });
    }

    function formatTravelTime(totalMinsRaw) {
        let totalMinutes = Math.round(totalMinsRaw / 15) * 15;
        if (totalMinutes === 0 && totalMinsRaw > 0) totalMinutes = 15;

        let hours = Math.floor(totalMinutes / 60);
        let mins = totalMinutes % 60;

        function getHoursWord(h) {
            if (h % 10 === 1 && h % 100 !== 11) return 'час';
            if ([2, 3, 4].includes(h % 10) && ![12, 13, 14].includes(h % 100)) return 'часа';
            return 'часов';
        }

        let timeStr = "";
        if (hours > 0) timeStr += `${hours} ${getHoursWord(hours)}`;
        if (mins > 0) timeStr += (timeStr ? " " : "") + `${mins} минут`;
        return timeStr || "15 минут";
    }

    function updateOrderPrice() {
        if (calculatedDistanceKm > 0) {
            const finalPrice = calculateFinalPrice(tariffSelect.value, calculatedDistanceKm);
            const humanTime = formatTravelTime(calculatedTimeMin);
            
            distanceText.innerText = `Приблизительное время: ~${humanTime}`;
            priceText.innerText = `${finalPrice} €`;
            priceBox.style.display = 'flex';
        } else if (!routeCoords.from || !routeCoords.to) {
            priceBox.style.display = 'none';
        }
    }

    setupAutocomplete('addressFrom', 'fromList', 'from');
    setupAutocomplete('addressTo', 'toList', 'to');
    tariffSelect.addEventListener('change', updateOrderPrice);

    // --- Telegram Submit ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const isPhoneValid = validateField(phoneInput, phoneRegex);
        const isEmailValid = validateField(emailInput, emailRegex);
        const isDateValid = validateDate();
        const isFromValid = validateAddress('from', fromGroup);
        const isToValid = validateAddress('to', toGroup);

        if (!isPhoneValid || !isEmailValid || !isDateValid || !isFromValid || !isToValid) return;

        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.innerText = 'Отправка...';
        submitBtn.style.opacity = '0.7';

        const TELEGRAM_TOKEN = '8892445872:AAHCjAD4GBOtFgrOKjbBQ97zP14quKEHVrA';
        const TELEGRAM_CHAT_ID = '6326660437';

        const finalPrice = calculateFinalPrice(tariffSelect.value, calculatedDistanceKm);
        const humanTime = formatTravelTime(calculatedTimeMin);

        const messageText = `
🚖 <b>НОВЫЙ ЗАКАЗ ТАКСИ</b>

📞 <b>Телефон:</b> ${phoneInput.value.trim()}
📧 <b>Email:</b> ${emailInput.value.trim()}
📅 <b>Дата/Время:</b> ${dateTimeInput.value}
🚗 <b>Тариф:</b> ${tariffSelect.options[tariffSelect.selectedIndex].text}

📍 <b>Откуда:</b> ${document.getElementById('addressFrom').value}
🏁 <b>Куда:</b> ${document.getElementById('addressTo').value}

⏱ <b>В пути:</b> ~${humanTime}
💶 <b>Стоимость:</b> ${finalPrice} €
`;

        fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: messageText,
                parse_mode: 'HTML'
            })
        })
        .then(response => {
            if (!response.ok) throw new Error('Telegram API error');
            
            Array.from(form.children).forEach(child => {
                if (child !== submitBtn) child.style.display = 'none';
            });

            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.innerText = 'Вы успешно оформили заказ!';
            successMsg.style.cssText = 'text-align: center; font-size: 1.3rem; color: #10b981; margin-bottom: 25px; font-weight: 600;';
            form.insertBefore(successMsg, submitBtn);

            submitBtn.innerText = '✓';
            submitBtn.style.cssText = 'width: 100%; padding: 1rem; border-radius: 8px; font-weight: 600; background: #10b981; border: none; color: white; font-size: 1.6rem; cursor: default; pointer-events: none; background-image: none; opacity: 1;';

            form.reset();
            routeCoords = { from: null, to: null };
            calculatedDistanceKm = 0;
            calculatedTimeMin = 0;
            if (priceBox) priceBox.style.display = 'none';
            form.querySelectorAll('.validation-group').forEach(el => el.classList.remove('has-success', 'has-error'));

            setTimeout(closeModal, 3500);
        })
        .catch(err => {
            console.error(err);
            alert('Произошла ошибка при отправке заказа.');
            submitBtn.innerText = originalSubmitText;
            submitBtn.style.opacity = '1';
        });
    });
});