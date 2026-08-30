const products = [
    {
        id: 'fullstack',
        title: 'Full Stack Development',
        description: 'Master both front-end and back-end development. Build complete web applications with modern frameworks, databases, and deployment strategies. Includes React, Node.js, and cloud fundamentals.',
        price: 30000,
        originalPrice: 35000,
        category: 'Full Stack',
        image: 'media/store media/Full stack developer.jpeg',
        icon: 'fa-laptop-code',
        duration: '5 Weeks',
        level: 'Beginner',
        inStock: true
    },
    {
        id: 'uiux',
        title: 'UI/UX & Graphics Design',
        description: 'Design stunning user interfaces and seamless experiences. Learn design principles, prototyping with Figma, user research, and visual communication for digital products.',
        price: 30000,
        originalPrice: 35000,
        category: 'UI/UX',
        image: 'media/store media/UI_UX Design Company.jpeg',
        icon: 'fa-pen-nib',
        duration: '5 Weeks',
        level: 'Beginner',
        inStock: true
    },
    {
        id: 'datascience',
        title: 'Python & Machine Learning',
        description: 'Dive into data science with Python. Explore pandas, NumPy, scikit-learn, and TensorFlow. Build predictive models and gain insights from real-world datasets.',
        price: 30000,
        originalPrice: 35000,
        category: 'Data Science',
        image: 'media/store media/Top Data Science .jpeg',
        icon: 'fa-brain',
        duration: '5 Weeks',
        level: 'Intermediate',
        inStock: true
    },
    {
        id: 'robotics',
        title: 'Robotics ',
        description: 'Design, build, and program autonomous robots. Cover Arduino, sensors, actuators, and control systems. Perfect for hardware enthusiasts and future automation engineers.',
        price: 30000,
        originalPrice: 35000,
        category: 'Robotics',
        image: 'media/store media/robot.jpeg',
        icon: 'fa-robot',
        duration: '5 Weeks',
        level: 'Beginner',
        inStock: true
    },
    {
        id: 'microsoft',
        title: 'Microsoft Office Mastery',
        description: 'Become proficient in Word, Excel, PowerPoint, and Outlook. Learn advanced formatting, data analysis with pivot tables, and professional presentation design.',
        price: 30000,
        originalPrice: 35000,
        category: 'Microsoft',
        image: 'media/store media/SOFTWARE LEGIT _ OFFICE 365 PERSONAL _ MICROSOFT 365(1).jpeg',
        icon: 'fa-file-word',
        duration: '5 Weeks',
        level: 'Beginner',
        inStock: true
    }
];

let cart = [];
let activeTrack = 'all';
let currentSlide = 0;
let carouselInterval;
let carouselProgressInterval;
const SLIDE_DURATION = 5000;

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    renderProducts();
    updateCartUI();
    startCarousel();
    initScrollAnimations();
    initRippleEffect();

   
    const carousel = document.getElementById('heroCarousel');
    carousel.addEventListener('mouseenter', stopCarousel);
    carousel.addEventListener('mouseleave', startCarousel);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
            closeMobileMenu();
        }
    });
});

// ============================================
// CART SYSTEM
// ============================================

function loadCart() {
    try {
        const saved = localStorage.getItem('techstars_cart');
        if (saved) cart = JSON.parse(saved);
    } catch (e) {
        cart = [];
    }
}

function saveCart() {
    localStorage.setItem('techstars_cart', JSON.stringify(cart));
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            icon: product.icon,
            category: product.category,
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    renderProducts(); // Re-render to show "in cart" state

    // Animate button
    const btn = document.querySelector(`[data-product-id="${productId}"] .add-to-cart-btn`);
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
        btn.classList.add('added');
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add to Cart';
            btn.classList.remove('added');
        }, 2000);
    }

    showToast('Added to Kit', `${product.title} has been added to your kit.`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    renderProducts();
    showToast('Removed', 'Item removed from your kit.', 'warning');
}

function updateQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart();
    updateCartUI();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getBundleDiscount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = getCartTotal();
    // 15% discount for 3+ items
    if (count >= 3) return Math.round(subtotal * 0.15);
    // 10% discount for 2 items
    if (count >= 2) return Math.round(subtotal * 0.10);
    return 0;
}

function updateCartUI() {
    const count = getCartCount();
    const total = getCartTotal();
    const discount = getBundleDiscount();
    const finalTotal = total - discount;

    // Update badges
    const cartCountEl = document.getElementById('cartCount');
    const mobileBadge = document.getElementById('mobileCartBadge');

    if (cartCountEl) {
        cartCountEl.textContent = count;
        cartCountEl.classList.remove('bounce');
        void cartCountEl.offsetWidth; // Trigger reflow
        if (count > 0) cartCountEl.classList.add('bounce');
    }

    if (mobileBadge) {
        mobileBadge.textContent = count;
        mobileBadge.style.display = count > 0 ? 'flex' : 'none';
    }

    // Update drawer
    const cartItemsEl = document.getElementById('cartItems');
    const cartEmptyEl = document.getElementById('cartEmpty');
    const cartFooterEl = document.getElementById('cartFooter');

    if (count === 0) {
        if (cartEmptyEl) cartEmptyEl.style.display = 'flex';
        if (cartItemsEl) cartItemsEl.style.display = 'none';
        if (cartFooterEl) cartFooterEl.style.display = 'none';
    } else {
        if (cartEmptyEl) cartEmptyEl.style.display = 'none';
        if (cartItemsEl) {
            cartItemsEl.style.display = 'flex';
            cartItemsEl.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        ${item.image ? `<img src="${item.image}" alt="${item.title}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\'fa-solid fa-${item.icon}\'></i>'">` : `<i class="fa-solid fa-${item.icon}"></i>`}
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.title}</h4>
                        <div class="cart-item-meta">${item.category}</div>
                        <div class="cart-item-price">₦${item.price.toLocaleString()}</div>
                    </div>
                    <div class="cart-item-actions">
                        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Remove">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                        <div class="quantity-control">
                            <button onclick="updateQuantity('${item.id}', -1)"><i class="fa-solid fa-minus"></i></button>
                            <span>${item.quantity}</span>
                            <button onclick="updateQuantity('${item.id}', 1)"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        if (cartFooterEl) {
            cartFooterEl.style.display = 'block';
            document.getElementById('cartSubtotal').textContent = `₦${total.toLocaleString()}`;
            document.getElementById('cartDiscount').textContent = discount > 0 ? `-₦${discount.toLocaleString()}` : '₦0';
            document.getElementById('cartTotal').textContent = `₦${finalTotal.toLocaleString()}`;
        }
    }
}

function toggleCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    const isOpen = drawer.classList.contains('active');

    if (isOpen) {
        closeCart();
    } else {
        drawer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCart() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function checkout() {
    if (cart.length === 0) return;
    const total = getCartTotal() - getBundleDiscount();
    showToast('Proceeding to Checkout', `Total: ₦${total.toLocaleString()}. Redirecting...`, 'success');
    // In a real app, this would redirect to checkout
}

// ============================================
// PRODUCT RENDERING & FILTERING
// ============================================

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');
    const resultsCount = document.getElementById('resultsCount');
    const searchValue = document.getElementById('searchInput').value.toLowerCase().trim();

    let filtered = products;

    // Filter by track
    if (activeTrack !== 'all') {
        filtered = filtered.filter(p => p.category === activeTrack);
    }

    // Filter by search
    if (searchValue) {
        filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(searchValue) ||
            p.description.toLowerCase().includes(searchValue) ||
            p.category.toLowerCase().includes(searchValue)
        );
    }

    // Update results count
    if (resultsCount) {
        if (filtered.length === products.length) {
            resultsCount.textContent = `Showing all ${products.length} courses`;
        } else {
            resultsCount.textContent = `Showing ${filtered.length} of ${products.length} courses`;
        }
    }

    // Show/hide empty state
    if (filtered.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    } else {
        grid.style.display = 'grid';
        emptyState.style.display = 'none';
    }

    // Render cards
    grid.innerHTML = filtered.map((product, index) => {
        const inCart = cart.some(item => item.id === product.id);
        const savings = product.originalPrice - product.price;

        return `
            <div class="product-card ${inCart ? 'in-cart' : ''}" data-product-id="${product.id}" style="animation-delay: ${index * 0.05}s">
                <div class="product-image">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.title}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\'product-image-fallback\'><i class=\'fa-solid fa-${product.icon}\'></i></div>';">` :
                        `<div class="product-image-fallback"><i class="fa-solid fa-${product.icon}"></i></div>`
                    }
                    <span class="product-badge">${product.category}</span>
                    <div class="product-quick-actions">
                        <button class="quick-action-btn" title="Quick View" onclick="showToast('${product.title}', '${product.duration} • ${product.level}', 'warning')">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="product-content">
                    <div class="product-category">${product.category} Track</div>
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-desc">${product.description}</p>
                    <div class="product-meta">
                        <span class="meta-tag"><i class="fa-regular fa-clock"></i> ${product.duration}</span>
                        <span class="meta-tag"><i class="fa-solid fa-signal"></i> ${product.level}</span>
                    </div>
                    <div class="product-footer">
                        <div class="product-price">
                            <span class="price-current">₦${product.price.toLocaleString()}</span>
                            <span class="price-original">₦${product.originalPrice.toLocaleString()}</span>
                        </div>
                        <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">
                            <i class="fa-solid fa-cart-plus"></i> ${inCart ? 'Add Again' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterTrack(track, btn) {
    activeTrack = track;

    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    renderProducts();
}

function filterProducts() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('searchClear');

    if (clearBtn) {
        clearBtn.classList.toggle('visible', searchInput.value.length > 0);
    }

    renderProducts();
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    filterProducts();
    searchInput.focus();
}

function resetFilters() {
    activeTrack = 'all';
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-track="all"]').classList.add('active');
    renderProducts();
}

// ============================================
// CAROUSEL
// ============================================

function goToSlide(index) {
    currentSlide = index;
    const slides = document.getElementById('carouselSlides');
    const dots = document.querySelectorAll('.carousel-dot');

    slides.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));

    resetCarouselTimer();
}

function nextSlide() {
    const totalSlides = document.querySelectorAll('.slide').length;
    goToSlide((currentSlide + 1) % totalSlides);
}

function prevSlide() {
    const totalSlides = document.querySelectorAll('.slide').length;
    goToSlide((currentSlide - 1 + totalSlides) % totalSlides);
}

function startCarousel() {
    stopCarousel();
    carouselInterval = setInterval(nextSlide, SLIDE_DURATION);
    startProgressBar();
}

function stopCarousel() {
    clearInterval(carouselInterval);
    clearInterval(carouselProgressInterval);
    const progressBar = document.getElementById('carouselProgress');
    if (progressBar) progressBar.style.width = '0%';
}

function resetCarouselTimer() {
    stopCarousel();
    carouselInterval = setInterval(nextSlide, SLIDE_DURATION);
    startProgressBar();
}

function startProgressBar() {
    const progressBar = document.getElementById('carouselProgress');
    if (!progressBar) return;

    let progress = 0;
    const increment = 100 / (SLIDE_DURATION / 50);

    progressBar.style.width = '0%';

    carouselProgressInterval = setInterval(() => {
        progress += increment;
        if (progress >= 100) progress = 100;
        progressBar.style.width = `${progress}%`;
    }, 50);
}

function scrollToCatalogue() {
    document.getElementById('catalogue').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// MOBILE MENU
// ============================================

function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    const isOpen = sidebar.classList.contains('active');

    if (isOpen) {
        closeMobileMenu();
    } else {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(title, message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        warning: 'fa-circle-exclamation'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon"><i class="fa-solid ${icons[type]}"></i></div>
        <div class="toast-content">
            <h4>${title}</h4>
            <p>${message}</p>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
    `;

    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.feature-card, .section-title-wrap').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ============================================
// RIPPLE EFFECT
// ============================================

function initRippleEffect() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn, .checkout-btn, .btn-primary, .btn-secondary');
        if (!btn) return;

        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';

        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
}
