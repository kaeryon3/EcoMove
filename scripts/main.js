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

// Smooth scroll for gallery items
const galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach((item) => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const caption = item.querySelector('figcaption');
        console.log(`Клик по галерее: ${caption?.textContent || 'Фото'}`);
    });
});

// Lazy loading images (улучшение производительности)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.getAttribute('data-src')) {
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
        imageObserver.observe(img);
    });
}

// Scroll animation для элементов с улучшениями
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Добавляем задержку для каскадного эффекта
            setTimeout(() => {
                entry.target.style.animation = `fadeInUp 0.8s ease forwards`;
                entry.target.style.opacity = '1';
            }, index * 100);
            scrollObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Apply animation to cards and sections
document.querySelectorAll(
    '.vehicle-card, .gallery-item, .footer-section, .hero-content'
).forEach((el) => {
    scrollObserver.observe(el);
});

// Добавляем эффект при наведении на кнопки
document.querySelectorAll('.book-btn, .search-btn, .nav-link').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.animation = 'pulse-scale 0.6s ease';
    });
});

// Parallax эффект для hero секции при скролле
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrollAmount = window.scrollY;
        hero.style.backgroundPosition = `0 ${scrollAmount * 0.5}px`;
    }
});

// Debounce функция для оптимизации поиска
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}