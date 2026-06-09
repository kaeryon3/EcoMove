// Book button handlers
const bookBtns = document.querySelectorAll('.book-btn');
bookBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        const vehicleCard = e.target.closest('.vehicle-card');
        const vehicleTitle =
            vehicleCard.querySelector('.vehicle-info h3').textContent;
        const priceValue =
            vehicleCard.querySelector('.price-value').textContent;

        alert(
            `Выбрана: ${vehicleTitle}\nЦена: ${priceValue}\n\nОформление бронирования будет добавлено позже.`,
        );
    });
});
// Mobile menu toggle with animation
const hamburger = document.querySelector('.hamburger');
const navbarMenu = document.querySelector('.navbar-menu');

if (hamburger) {
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        navbarMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navbarMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            hamburger.classList.remove('active');
            navbarMenu.classList.remove('active');
        }
    });
}