document.addEventListener('DOMContentLoaded', () => {

    // Regular expressions for validation
    const phoneRegex = /^\+?[\d\s-]{9,20}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Route coordinates tracking
    let routeCoords = { from: null, to: null };
    let calculatedDistanceKm = 0;
    let calculatedTimeMin = 0;

    // DOM element references
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
    const passengersInput = document.getElementById('passengersCount');
    const luggageInput = document.getElementById('luggageCount');
    const priceBox = document.getElementById('priceBox');
    const distanceText = document.getElementById('distanceText');
    const priceText = document.getElementById('priceText');

    const originalSubmitText = form.querySelector('.submit-btn').textContent.trim();

    // Tariff coefficients for price calculation
    const TARIFF_COEFFICIENTS = {
        'econom': 0.9,
        'standard': 1.2,
        'business-s': 1.8,
        'business-v': 2,
        'cargo': 1.5,
        'microbus': 6,
    };

    // Minimum prices for each tariff
    const MIN_PRICES = {
        'econom': 27,
        'standard': 35,
        'business-s': 45,
        'business-v': 55,
        'cargo': 40,
        'microbus': 150,
    };

    // Map vehicle names to tariff codes
    const tariffMap = {
        'Skoda Octavia': 'econom',
        'Toyota Camry': 'standard',
        'Mercedes-Benz E-Class': 'business-s',
        'Mercedes-Benz V-Class': 'business-v',
        'Mercedes-Benz Vito': 'cargo',
        'Mercedes-Benz Sprinter': 'microbus',
    };

    // ======================================
    // UTILITY FUNCTIONS
    // ======================================

    // Calculate final price based on tariff and distance
    function calculateFinalPrice(tariff, distance) {
        if (!distance || distance <= 0) return 0;
        const calculated = Math.round(distance * (TARIFF_COEFFICIENTS[tariff] || 1));
        const minPrice = MIN_PRICES[tariff] || 0;
        return Math.max(calculated, minPrice);
    }

    // ======================================
    // MODAL MANAGEMENT
    // ======================================

    const routeCards = document.querySelectorAll('.mini-card');

    routeCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();

            form.reset();
            const existingMsg = form.querySelector('.success-message');
            if (existingMsg) existingMsg.remove();

            form.querySelectorAll('.validation-group').forEach(el => {
                el.classList.remove('has-success', 'has-error');
            });

            const submitBtn = form.querySelector('.submit-btn');
            submitBtn.removeAttribute('style');
            submitBtn.innerText = originalSubmitText;
            Array.from(form.children).forEach(child => child.style.display = '');

            routeCoords = { from: null, to: null };
            calculatedDistanceKm = 0;
            calculatedTimeMin = 0;
            if (priceBox) priceBox.style.display = 'none';

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // Open modal and populate tariff from clicked card
    bookButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Clear previous success messages
            const existingMsg = form.querySelector('.success-message');
            if (existingMsg) existingMsg.remove();

            // Reset form visibility
            Array.from(form.children).forEach(child => child.style.display = '');
            const submitBtn = form.querySelector('.submit-btn');
            submitBtn.classList.remove('is-success');
            submitBtn.style.opacity = '1';
            submitBtn.style.pointerEvents = 'auto';
            submitBtn.innerText = originalSubmitText;

            // Auto-select tariff based on card
            const card = e.target.closest('.price-card');
            if (card) {
                const carName = card.querySelector('h3').textContent.trim();
                if (tariffMap[carName]) {
                    tariffSelect.value = tariffMap[carName];
                }
            }

            // Show all form elements
            form.querySelectorAll('.form-group, .form-row, .price-calculation-box, .submit-btn')
                .forEach(el => {
                    el.style.display = '';
                });

            // Open modal
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            updateOrderPrice();
        });
    });

    // Close modal
    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // ======================================
    // DATE PICKER
    // ======================================

    flatpickr("#dateTime", {
        enableTime: true,
        dateFormat: "d.m.Y H:i",
        minDate: "today",
        time_24hr: true,
        disableMobile: "true",
        onChange: function (selectedDates, dateStr) {
            if (dateStr) {
                dateGroup.classList.remove('has-error');
                dateGroup.classList.add('has-success');
            }
        }
    });

    // ======================================
    // VALIDATION FUNCTIONS
    // ======================================

    // Validate email and phone inputs
    function validateField(input, regex) {
        const group = input.closest('.validation-group');
        const isValid = regex.test(input.value.trim());
        group.classList.toggle('has-success', isValid);
        group.classList.toggle('has-error', !isValid);
        return isValid;
    }

    // Validate date selection
    function validateDate() {
        const isValid = dateTimeInput.value.trim() !== "";
        dateGroup.classList.toggle('has-success', isValid);
        dateGroup.classList.toggle('has-error', !isValid);
        return isValid;
    }

    // Validate address selection from geocoding
    function validateAddress(type, groupElement) {
        const isValid = routeCoords[type] !== null;
        groupElement.classList.toggle('has-success', isValid);
        groupElement.classList.toggle('has-error', !isValid);
        return isValid;
    }

    // Real-time validation for passengers and luggage inputs
    passengersInput.addEventListener('input', () => {
        const passVal = parseInt(passengersInput.value, 10);
        const isValid = !isNaN(passVal) && passVal >= 1;
        passengersInput.closest('.validation-group').classList.toggle('has-error', !isValid);
        passengersInput.closest('.validation-group').classList.toggle('has-success', isValid);
    });

    luggageInput.addEventListener('input', () => {
        const lugVal = parseInt(luggageInput.value, 10);
        const isValid = !isNaN(lugVal) && lugVal >= 0;
        luggageInput.closest('.validation-group').classList.toggle('has-error', !isValid);
        luggageInput.closest('.validation-group').classList.toggle('has-success', isValid);
    });

    // Real-time phone input validation
    phoneInput.addEventListener('input', () => {
        if (phoneInput.value.trim() === '') {
            phoneInput.closest('.validation-group').classList.remove('has-error', 'has-success');
            return;
        }
        validateField(phoneInput, phoneRegex);
    });

    // Real-time email input validation
    emailInput.addEventListener('input', () => {
        if (emailInput.value.trim() === '') {
            emailInput.closest('.validation-group').classList.remove('has-error', 'has-success');
            return;
        }
        validateField(emailInput, emailRegex);
    });

    // ======================================
    // AUTOCOMPLETE
    // ======================================

    // Setup autocomplete for address fields
    function setupAutocomplete(inputId, listId, type) {
        const input = document.getElementById(inputId);
        const list = document.getElementById(listId);
        let timeoutId;

        input.addEventListener('input', function (e) {
            const query = e.target.value.trim();
            clearTimeout(timeoutId);

            // Reset coordinates when user changes input
            routeCoords[type] = null;
            calculatedDistanceKm = 0;
            calculatedTimeMin = 0;
            updateOrderPrice();
            input.closest('.validation-group').classList.remove('has-success', 'has-error');

            // Hide suggestions if query is too short
            if (query.length < 3) {
                list.classList.remove('active');
                list.innerHTML = '';
                return;
            }

            // Fetch suggestions with debounce
            timeoutId = setTimeout(() => {
                fetchCities(query, input, list, type);
            }, 400);
        });

        // Close suggestions when clicking outside
        document.addEventListener('click', function (e) {
            if (e.target !== input && e.target !== list) {
                list.classList.remove('active');
            }
        });
    }

    // Fetch address suggestions from Geoapify API
    function fetchCities(query, input, list, type) {
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&lang=en&limit=5&apiKey=7f36ceac7201486d92a42c5920be9a1a`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                list.innerHTML = '';
                if (!data.features || data.features.length === 0) {
                    list.classList.remove('active');
                    return;
                }

                // Create autocomplete items
                data.features.forEach(feature => {
                    const address = feature.properties.formatted;
                    const item = document.createElement('div');
                    item.className = 'autocomplete-item';
                    item.textContent = address;

                    // Handle item selection
                    item.addEventListener('click', () => {
                        input.value = address;
                        list.classList.remove('active');

                        // Store coordinates
                        routeCoords[type] = {
                            lat: feature.properties.lat,
                            lon: feature.properties.lon
                        };

                        // Mark as valid
                        input.closest('.validation-group').classList.remove('has-error');
                        input.closest('.validation-group').classList.add('has-success');

                        // Calculate distance when both addresses are selected
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

    // ======================================
    // ROUTE CALCULATION
    // ======================================

    // Calculate distance and time between two points
    function calculateRouteDistance() {
        const from = routeCoords.from;
        const to = routeCoords.to;
        const url = `https://api.geoapify.com/v1/routing?waypoints=${from.lat},${from.lon}|${to.lat},${to.lon}&mode=drive&apiKey=7f36ceac7201486d92a42c5920be9a1a`;

        distanceText.innerText = "";
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
                    distanceText.innerText = "Error calculating route";
                }
            })
            .catch(err => {
                console.error("Routing API error:", err);
                distanceText.innerText = "Network error";
            });
    }

    // Update displayed price based on current selection
    function updateOrderPrice() {
        if (calculatedDistanceKm > 0) {
            const finalPrice = calculateFinalPrice(tariffSelect.value, calculatedDistanceKm);

            priceText.innerText = `${finalPrice} €`;
            priceBox.style.display = 'flex';
        } else if (!routeCoords.from || !routeCoords.to) {
            priceBox.style.display = 'none';
        }
    }

    // Setup autocomplete fields
    setupAutocomplete('addressFrom', 'fromList', 'from');
    setupAutocomplete('addressTo', 'toList', 'to');
    tariffSelect.addEventListener('change', () => {
        const group = tariffSelect.closest('.validation-group');
        if (group) {
            group.classList.remove('has-error');
            group.classList.add('has-success');
        }
        updateOrderPrice();
    });

    // ======================================
    // NUMBER CONTROLS (PLUS/MINUS)
    // ======================================
    document.querySelectorAll('.num-btn').forEach(button => {
        button.addEventListener('click', function () {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);

            let value = parseInt(input.value, 10) || 0;
            const min = parseInt(input.getAttribute('min'), 10) || 0;
            const max = parseInt(input.getAttribute('max'), 10) || 100;

            if (this.classList.contains('minus')) {
                if (value > min) value--;
            } else if (this.classList.contains('plus')) {
                if (value < max) value++;
            }

            input.value = value;

            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
    });

    // ======================================
    // FORM SUBMISSION
    // ======================================

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate all fields
        const isPhoneValid = validateField(phoneInput, phoneRegex);
        const isEmailValid = validateField(emailInput, emailRegex);
        const isDateValid = validateDate();
        const isFromValid = validateAddress('from', fromGroup);
        const isToValid = validateAddress('to', toGroup);

        // Validate passenger count
        const passVal = parseInt(passengersInput.value, 10);
        const isPassValid = !isNaN(passVal) && passVal >= 1;
        passengersInput.closest('.validation-group').classList.toggle('has-error', !isPassValid);
        passengersInput.closest('.validation-group').classList.toggle('has-success', isPassValid);

        // Validate luggage count
        const lugVal = parseInt(luggageInput.value, 10);
        const isLuggageValid = !isNaN(lugVal) && lugVal >= 0;
        luggageInput.closest('.validation-group').classList.toggle('has-error', !isLuggageValid);
        luggageInput.closest('.validation-group').classList.toggle('has-success', isLuggageValid);

        // Validate tariff selection
        const isTariffValid = tariffSelect.value !== "";
        const tariffGroup = tariffSelect.closest('.validation-group');
        if (tariffGroup) {
            tariffGroup.classList.toggle('has-error', !isTariffValid);
            tariffGroup.classList.toggle('has-success', isTariffValid);
        }

        // Stop if any validation failed
        if (!isPhoneValid || !isEmailValid || !isDateValid || !isFromValid || !isToValid || !isPassValid || !isLuggageValid || !isTariffValid) return;

        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        submitBtn.innerText = '...';
        submitBtn.style.opacity = '0.7';

        // Calculate final price
        const finalPrice = calculateFinalPrice(tariffSelect.value, calculatedDistanceKm);

        // Build message text
        const messageText = `
🚖 <b>НОВЫЙ ЗАКАЗ</b>

📞 <b>Телефон:</b> ${phoneInput.value.trim()}
📧 <b>Email:</b> ${emailInput.value.trim()}
📅 <b>Дата/Время:</b> ${dateTimeInput.value}
🚗 <b>Тариф:</b> ${tariffSelect.options[tariffSelect.selectedIndex].text}
👥 <b>Пассажиров:</b> ${passengersInput.value}
🧳 <b>Чемоданов:</b> ${luggageInput.value}

📍 <b>Откуда:</b> ${document.getElementById('addressFrom').value}
🏁 <b>Куда:</b> ${document.getElementById('addressTo').value}

💶 <b>Стоимость:</b> ${finalPrice} €
`;

        // Send booking to Telegram
        fetch(`https://api.telegram.org/bot8892445872:AAHCjAD4GBOtFgrOKjbBQ97zP14quKEHVrA/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: '6326660437',
                text: messageText,
                parse_mode: 'HTML'
            })
        })
            .then(response => {
                if (!response.ok) throw new Error('Telegram API error');

                // Hide form elements
                Array.from(form.children).forEach(child => {
                    if (child !== submitBtn) child.style.display = 'none';
                });

                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'success-message';
                successMsg.style.cssText = 'text-align: center; font-size: 1.3rem; color: #10b981; margin-bottom: 25px; font-weight: 600;';
                form.insertBefore(successMsg, submitBtn);

                // Update button
                submitBtn.innerText = '✓';
                submitBtn.classList.add('is-success');

                // Reset form state
                form.reset();
                routeCoords = { from: null, to: null };
                calculatedDistanceKm = 0;
                calculatedTimeMin = 0;
                if (priceBox) priceBox.style.display = 'none';
                form.querySelectorAll('.validation-group').forEach(el => el.classList.remove('has-success', 'has-error'));

                // Close modal after delay
                setTimeout(closeModal, 3500);
            })
            .catch(err => {
                console.error(err);
                alert('Error sending order. Please try again later.');
                submitBtn.innerText = originalSubmitText;
                submitBtn.style.opacity = '1';
            });
    });
});
