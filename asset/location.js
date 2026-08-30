const trackingData = {
    'TRK-2026-08-25-002': {
        status: 'in-transit',
        statusText: 'In Transit',
        estimatedDelivery: 'Sep 3, 2026',
        currentLocation: 'Rumuosi, Port Harcourt',
        weight: '2.5 kg',
        service: 'Standard Delivery',
        origin: 'CITE, Choba, PH',
        destination: 'Laritel, Woji, PH',
        orderDate: 'Aug 21, 2026',
        orderTime: '1:15 PM',
        items: 'Full Stack Kit, Robotics Pack',
        progress: 60,
        timeline: [
            { title: 'Order Placed', desc: 'Your order has been received and is being processed at CITE store.', date: 'Aug 21', time: '1:15 PM', status: 'completed' },
            { title: 'Package Prepared', desc: 'Items packed and labeled. Full Stack Dev kit + Robotics starter pack.', date: 'Aug 23', time: '10:30 AM', status: 'completed' },
            { title: 'Picked Up by Courier', desc: 'Package collected from CITE, Choba. En route to sorting facility.', date: 'Aug 25', time: '3:15 PM', status: 'completed' },
            { title: 'In Transit', desc: 'Package is on the move! Currently passing through Rumuosi, Port Harcourt.', date: 'Aug 28', time: '1:15 PM', status: 'active', live: true },
            { title: 'Out for Delivery', desc: 'Package will be dispatched for final delivery to Laritel, Woji.', date: 'Sep 3', time: '9:00 AM', status: 'upcoming' },
            { title: 'Delivered', desc: 'Package will be handed over at the destination address.', date: 'Sep 3', time: '2:00 PM', status: 'upcoming' }
        ],
        hSteps: [
            { title: 'Order Received', date: 'Aug 21', status: 'completed' },
            { title: 'Picked Up', date: 'Aug 25', status: 'completed' },
            { title: 'In Transit', date: 'Aug 28', status: 'active' },
            { title: 'Out for Delivery', date: 'Sep 3', status: 'pending' },
            { title: 'Delivered', date: '-', status: 'pending' }
        ]
    },
    'TRK-2026-08-20-001': {
        status: 'delivered',
        statusText: 'Delivered',
        estimatedDelivery: 'Aug 24, 2026',
        currentLocation: 'Laritel, Woji, PH',
        weight: '1.8 kg',
        service: 'Express Delivery',
        origin: 'CITE, Choba, PH',
        destination: 'Laritel, Woji, PH',
        orderDate: 'Aug 18, 2026',
        orderTime: '9:30 AM',
        items: 'UI/UX Design Kit',
        progress: 100,
        timeline: [
            { title: 'Order Placed', desc: 'Your order has been received and is being processed.', date: 'Aug 18', time: '9:30 AM', status: 'completed' },
            { title: 'Package Prepared', desc: 'Items packed and labeled.', date: 'Aug 19', time: '11:00 AM', status: 'completed' },
            { title: 'Picked Up by Courier', desc: 'Package collected from CITE, Choba.', date: 'Aug 20', time: '2:00 PM', status: 'completed' },
            { title: 'In Transit', desc: 'Package is on the move.', date: 'Aug 22', time: '10:00 AM', status: 'completed' },
            { title: 'Out for Delivery', desc: 'Package dispatched for final delivery.', date: 'Aug 24', time: '8:00 AM', status: 'completed' },
            { title: 'Delivered', desc: 'Package successfully delivered to Laritel, Woji.', date: 'Aug 24', time: '1:30 PM', status: 'completed' }
        ],
        hSteps: [
            { title: 'Order Received', date: 'Aug 18', status: 'completed' },
            { title: 'Picked Up', date: 'Aug 20', status: 'completed' },
            { title: 'In Transit', date: 'Aug 22', status: 'completed' },
            { title: 'Out for Delivery', date: 'Aug 24', status: 'completed' },
            { title: 'Delivered', date: 'Aug 24', status: 'completed' }
        ]
    }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initTrackingInput();
    initScrollAnimations();
    animateRouteProgress();

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
        if (e.key === 'Enter' && document.activeElement.id === 'trackingInput') {
            searchTracking();
        }
    });
});

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
// TRACKING SEARCH
// ============================================

function initTrackingInput() {
    const input = document.getElementById('trackingInput');
    const clearBtn = document.getElementById('searchClear');

    if (!input || !clearBtn) return;

    input.addEventListener('input', () => {
        clearBtn.classList.toggle('visible', input.value.length > 0);
    });
}

function clearTrackingInput() {
    const input = document.getElementById('trackingInput');
    const clearBtn = document.getElementById('searchClear');
    input.value = '';
    clearBtn.classList.remove('visible');
    input.focus();
}

function setTracking(number) {
    const input = document.getElementById('trackingInput');
    const clearBtn = document.getElementById('searchClear');
    input.value = number;
    clearBtn.classList.add('visible');
    searchTracking();
}

function searchTracking() {
    const input = document.getElementById('trackingInput');
    const number = input.value.trim().toUpperCase();

    if (!number) {
        showToast('Enter Tracking Number', 'Please type a tracking number to search.', 'warning');
        input.focus();
        return;
    }

    // Simulate loading
    const btn = document.querySelector('.search-btn');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Searching...';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.disabled = false;

        const data = trackingData[number];

        if (data) {
            updateTrackingDisplay(number, data);
            showToast('Tracking Found', `Status: ${data.statusText}`, 'success');
        } else {
            showToast('Not Found', `No package found with tracking number ${number}. Try a recent search.`, 'error');
        }
    }, 800);
}

function updateTrackingDisplay(number, data) {
    // Update summary
    document.getElementById('trackingNumber').textContent = number;
    document.getElementById('estDelivery').textContent = data.estimatedDelivery;
    document.getElementById('currentLocation').textContent = data.currentLocation;

    // Update status badge
    const badge = document.getElementById('statusBadge');
    badge.className = `status-badge ${data.status}`;
    badge.innerHTML = `<span class="status-pulse"></span><span class="status-text">${data.statusText}</span>`;

    // Update route progress
    document.getElementById('routeProgress').style.width = `${data.progress}%`;
    document.getElementById('routeVehicle').style.left = `${data.progress}%`;

    // Update horizontal timeline
    const hTimeline = document.getElementById('horizontalTimeline');
    if (hTimeline) {
        hTimeline.innerHTML = data.hSteps.map((step, i) => {
            const isFinal = i === data.hSteps.length - 1;
            return `
                <div class="h-step ${step.status}" data-step="${i}">
                    <div class="circle">
                        ${step.status === 'completed' ? '<i class="fa-solid fa-check"></i>' : 
                          step.status === 'active' ? '<i class="fa-solid fa-truck"></i>' :
                          isFinal ? '<i class="fa-solid fa-house"></i>' : '<i class="fa-solid fa-box-open"></i>'}
                    </div>
                    <span class="step-title">${step.title}</span>
                    <span class="step-date">${step.date}</span>
                </div>
            `;
        }).join('');
    }

    // Update vertical timeline
    const vTimeline = document.getElementById('verticalTimeline');
    if (vTimeline) {
        vTimeline.innerHTML = data.timeline.map((item, i) => `
            <div class="v-step ${item.status}">
                <div class="v-icon">
                    ${item.status === 'completed' ? '<i class="fa-solid fa-check"></i>' :
                      item.status === 'active' ? '<i class="fa-solid fa-truck-moving"></i>' :
                      i === data.timeline.length - 1 ? '<i class="fa-solid fa-house"></i>' : '<i class="fa-solid fa-box-open"></i>'}
                </div>
                <div class="v-content">
                    <h4>${item.title}</h4>
                    <p>${item.desc}</p>
                    ${item.live ? '<div class="live-update"><span class="live-dot"></span><span>Live update — 2 mins ago</span></div>' : ''}
                </div>
                <div class="v-time">
                    <span${item.status === 'upcoming' ? ' class="estimated"' : ''}>${item.status === 'upcoming' ? 'Est. ' : ''}${item.date}</span>
                    <span class="time-detail">${item.time}</span>
                </div>
            </div>
        `).join('');
    }

    // Scroll to summary
    document.querySelector('.tracking-summary-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// ROUTE ANIMATION
// ============================================

function animateRouteProgress() {
    const progress = document.getElementById('routeProgress');
    const vehicle = document.getElementById('routeVehicle');

    if (!progress || !vehicle) return;

    // Start from 0 and animate to current position
    progress.style.width = '0%';
    vehicle.style.left = '0%';

    setTimeout(() => {
        progress.style.width = '60%';
        vehicle.style.left = '60%';
    }, 500);
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

    document.querySelectorAll('.dashboard-card, .thank-you-banner').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}
