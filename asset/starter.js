const products = [
    {
        id: 'raspberry-pi',
        name: 'Raspberry Pi 4 Kit',
        price: 65000,
        originalPrice: 72000,
        category: 'Robotics',
        image: 'media/store media/raspberry Pi.jpeg',
        icon: 'fa-microchip',
        badge: 'Popular',
        desc: '4GB RAM, case, heatsinks, and 32GB SD card preloaded with bootcamp OS.'
    },
    {
        id: 'vscode',
        name: 'VS Code Application',
        price: 8500,
        originalPrice: 10000,
        category: 'Web Dev',
        image: 'media/store media/vscode.jpeg',
        icon: 'fa-code',
        badge: null,
        desc: 'Visual Studio Code — the industry standard source code editor for modern web development.'
    },
    {
        id: 'evive',
        name: 'Evive Starter Pack',
        price: 58000,
        originalPrice: 65000,
        category: 'Robotics',
        image: 'media/store media/two.jpeg',
        icon: 'fa-robot',
        badge: null,
        desc: 'All-in-one STEM educational and prototyping kit for learning electronics and programming.'
    },
    {
        id: 'colab',
        name: 'Google Colab Application',
        price: 15000,
        originalPrice: 18000,
        category: 'Python & Machine Learning',
        image: 'media/store media/google colab.jpeg',
        icon: 'fa-brain',
        badge: null,
        desc: 'Cloud-based Jupyter notebook environment for machine learning and data science.'
    },
    {
        id: 'microbit',
        name: 'Micro:bit V2 Board',
        price: 32000,
        originalPrice: 35000,
        category: 'Robotics',
        image: 'media/store media/Freenove.jpeg',
        icon: 'fa-microchip',
        badge: 'New',
        desc: 'Built-in speaker, microphone, and touch sensor for rapid prototyping.'
    },
    {
        id: 'anaconda',
        name: 'Anaconda Software',
        price: 3500,
        originalPrice: 5000,
        category: 'Python & Machine Learning',
        image: 'media/store media/ana.jpeg',
        icon: 'fa-python',
        badge: null,
        desc: 'Open-source distribution of Python and R for data science and machine learning.'
    },
    {
        id: 'js-cards',
        name: 'JavaScript Project Cards',
        price: 6000,
        originalPrice: 7500,
        category: 'Web Dev',
        image: 'media/store media/JavaScript .jpeg',
        icon: 'fa-js',
        badge: null,
        desc: '50 project prompts from DOM games to API integrations.'
    },
    {
        id: 'stickers',
        name: 'Holographic Sticker Pack',
        price: 1500,
        originalPrice: 2000,
        category: 'Merch',
        image: 'media/store media/stickers.jpeg',
        icon: 'fa-palette',
        badge: null,
        desc: '12 durable vinyl stickers to customize laptop lids and kit boxes.'
    },
    {
        id: 'breadboard',
        name: 'Breadboard + Jumper Kit',
        price: 4500,
        originalPrice: 5500,
        category: 'Robotics',
        image: 'media/store media/breadboard.jpeg',
        icon: 'fa-plug',
        badge: null,
        desc: '830-point breadboard with 140 assorted jumper wires.'
    },
    {
        id: 'canva-ps',
        name: 'Canva & Photoshop Packages',
        price: 9500,
        originalPrice: 12000,
        category: 'Graphics Design',
        image: 'media/store media/can&ps.jpeg',
        icon: 'fa-pen-nib',
        badge: null,
        desc: 'Professional design tools for creating stunning visuals and graphics.'
    },
    {
        id: 'microsoft',
        name: 'Microsoft Packages',
        price: 15000,
        originalPrice: 18000,
        category: 'Microsoft Packages',
        image: 'media/store media/icon.jpeg',
        icon: 'fa-file-word',
        badge: 'Bestseller',
        desc: 'Core productivity apps, cloud storage, and security features for personal use.'
    },
    {
        id: 'figma',
        name: 'Figma Application',
        price: 8000,
        originalPrice: 10000,
        category: 'Graphics Design',
        image: 'media/store media/figma.jpeg',
        icon: 'fa-figma',
        badge: 'Bestseller',
        desc: 'Cloud-based design platform for building UI/UX products collaboratively.'
    }
];

// ============================================
// STATE
// ============================================

let cart = [];
let currentCategory = 'all';
let searchQuery = '';

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    renderProducts();
    updateCartUI();
    initScrollAnimations();
    initSearchClear();

    // Keyboard support
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
        const saved = localStorage.getItem('techstars_starter_cart');
        if (saved) cart = JSON.parse(saved);
    } catch (e) {
        cart = [];
    }
}

function saveCart() {
    localStorage.setItem('techstars_starter_cart', JSON.stringify(cart));
}

function addToCart(name, price, category) {
    const product = products.find(p => p.name === name);
    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            id: product ? product.id : name,
            name,
            price,
            category,
            qty: 1,
            image: product ? product.image : null,
            icon: product ? product.icon : 'fa-box'
        });
    }

    saveCart();
    updateCartUI();

    // Animate button
    const btn = document.querySelector(`[data-product-name="${CSS.escape(name)}"] .btn-add`);
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
        btn.classList.add('added');
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add';
            btn.classList.remove('added');
        }, 2000);
    }

    showToast('Added to Kit', `${name} has been added to your kit.`, 'success');
}

function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    saveCart();
    updateCartUI();
    showToast('Removed', 'Item removed from your kit.', 'warning');
}

function changeQty(name, delta) {
    const item = cart.find(i => i.name === name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        removeFromCart(name);
        return;
    }
    saveCart();
    updateCartUI();
}

function getCartTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getCartCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
}

function getBundleDiscount() {
    const count = getCartCount();
    const subtotal = getCartTotal();
    if (count >= 5) return Math.round(subtotal * 0.20);
    if (count >= 3) return Math.round(subtotal * 0.15);
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
        void cartCountEl.offsetWidth;
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
                        ${item.image ? 
                            `<img src="${item.image}" alt="${escapeHtml(item.name)}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\'fa-solid fa-${item.icon}\'></i>'">` :
                            `<i class="fa-solid fa-${item.icon}"></i>`
                        }
                    </div>
                    <div class="cart-item-details">
                        <h4>${escapeHtml(item.name)}</h4>
                        <div class="cart-item-meta">${item.category}</div>
                        <div class="cart-item-price">₦${item.price.toLocaleString()}</div>
                    </div>
                    <div class="cart-item-actions">
                        <button class="cart-item-remove" onclick="removeFromCart('${escapeHtml(item.name)}')" title="Remove">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                        <div class="quantity-control">
                            <button onclick="changeQty('${escapeHtml(item.name)}', -1)"><i class="fa-solid fa-minus"></i></button>
                            <span>${item.qty}</span>
                            <button onclick="changeQty('${escapeHtml(item.name)}', 1)"><i class="fa-solid fa-plus"></i></button>
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
}

// ============================================
// PRODUCT RENDERING & FILTERING
// ============================================

function renderProducts() {
    const grid = document.getElementById('productGrid');
    const emptyState = document.getElementById('emptyState');
    const resultsCount = document.getElementById('resultsCount');

    const filtered = products.filter(p => {
        const catMatch = currentCategory === 'all' || p.category === currentCategory;
        const sq = searchQuery.toLowerCase().trim();
        const searchMatch = !sq || 
            p.name.toLowerCase().includes(sq) || 
            p.desc.toLowerCase().includes(sq) ||
            p.category.toLowerCase().includes(sq);
        return catMatch && searchMatch;
    });

    if (resultsCount) {
        if (filtered.length === products.length) {
            resultsCount.textContent = `Showing all ${products.length} products`;
        } else {
            resultsCount.textContent = `Showing ${filtered.length} of ${products.length} products`;
        }
    }

    if (filtered.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    } else {
        grid.style.display = 'grid';
        emptyState.style.display = 'none';
    }

    grid.innerHTML = filtered.map((p, index) => `
        <div class="product-card" data-product-name="${escapeHtml(p.name)}" style="animation-delay: ${index * 0.05}s">
            <div class="product-image">
                ${p.image ? 
                    `<img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\'product-image-fallback\'><i class=\'fa-solid fa-${p.icon}\'></i></div>';">` :
                    `<div class="product-image-fallback"><i class="fa-solid fa-${p.icon}"></i></div>`
                }
                ${p.badge ? `<span class="product-badge ${p.badge === 'Bestseller' ? 'bestseller' : ''}">${escapeHtml(p.badge)}</span>` : ''}
            </div>
            <div class="product-content">
                <div class="product-category">${p.category}</div>
                <h3 class="product-title">${escapeHtml(p.name)}</h3>
                <p class="product-desc">${escapeHtml(p.desc)}</p>
                <div class="product-footer">
                    <span class="product-price">₦${p.price.toLocaleString()}</span>
                    <button class="btn-add" onclick="addToCart('${escapeHtml(p.name)}', ${p.price}, '${p.category}')">
                        <i class="fa-solid fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function setCategory(cat, btn) {
    currentCategory = cat;

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    renderProducts();
}

function filterProducts() {
    searchQuery = document.getElementById('searchInput').value;

    const clearBtn = document.getElementById('searchClear');
    if (clearBtn) {
        clearBtn.classList.toggle('visible', searchQuery.length > 0);
    }

    renderProducts();
}

function clearSearch() {
    const input = document.getElementById('searchInput');
    input.value = '';
    searchQuery = '';
    filterProducts();
    input.focus();
}

function resetFilters() {
    currentCategory = 'all';
    searchQuery = '';
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-cat="all"]').classList.add('active');
    renderProducts();
}

function initSearchClear() {
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('searchClear');
    if (input && clearBtn) {
        clearBtn.classList.toggle('visible', input.value.length > 0);
    }
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

    document.querySelectorAll('.step-card, .bundle-cta').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ============================================
// UTILITIES
// ============================================

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}
