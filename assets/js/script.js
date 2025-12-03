// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Load random promo products
async function loadRandomPromos() {
    try {
        const response = await fetch('./backend/api/random_promos.php');
        
        // CEK apakah response OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // CEK apakah response adalah JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error('Server response:', text);
            throw new Error("Server tidak mengembalikan JSON");
        }
        
        const products = await response.json();
        const promoGrid = document.getElementById('promo-grid');
        
        if (!products || products.length === 0) {
            promoGrid.innerHTML = '<div class="col-span-3 text-center py-8"><p class="text-gray-500">Belum ada promo tersedia</p></div>';
            return;
        }
        
        promoGrid.innerHTML = '';
        
        products.forEach(product => {
            const price = parseInt(product.price) || 0;
            const originalPrice = parseInt(product.original_price) || 0;
            const discount = parseInt(product.discount) || 0;
            
            const card = document.createElement('div');
            card.className = 'product-card bg-white rounded-xl shadow-md overflow-hidden';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.6s ease-out';
            
            card.innerHTML = `
                <a href="detail.php?id=${product.id}">
                    <div class="relative">
                        <img src="${product.image || './assets/img/placeholder.jpg'}" 
                             alt="${product.name}"
                             class="w-full h-64 object-cover"
                             onerror="this.src='./assets/img/placeholder.jpg'" />
                        ${discount > 0 ? `<span class="badge-promo absolute top-4 right-4">Promo ${discount}%</span>` : ''}
                    </div>
                </a>
                <div class="p-5">
                    <p class="text-gray-500 text-sm mb-1">${product.category || 'Produk'}</p>
                    <h3 class="font-bold text-gray-800 mb-2">${product.name}</h3>
                    <p class="text-2xl font-bold text-purple-600 mb-3">Rp ${price.toLocaleString('id-ID')}</p>
                    ${originalPrice > 0 ? `<p class="text-gray-400 text-sm line-through mb-4">Est. dari Rp ${originalPrice.toLocaleString('id-ID')}</p>` : '<p class="mb-4">&nbsp;</p>'}
                    <button onclick="window.location.href='detail.php?id=${product.id}'"
                        class="w-full primary-color text-white py-3 rounded-lg font-semibold hover:opacity-90">
                        Beli Sekarang
                    </button>
                </div>
            `;
            
            promoGrid.appendChild(card);
            
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100);
        });
        
    } catch (error) {
        console.error('Error loading promos:', error);
        const promoGrid = document.getElementById('promo-grid');
        promoGrid.innerHTML = '<div class="col-span-3 text-center py-8"><p class="text-gray-500">Gagal memuat promo. Cek console untuk detail.</p></div>';
    }
}
// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all product cards
document.querySelectorAll('.product-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s ease-out';
    observer.observe(card);
});

// Mobile menu toggle (if needed)
let isMenuOpen = false;
function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    // Add mobile menu logic here if needed
}

// Add active state to nav items
const navLinks = document.querySelectorAll('nav a');
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        navLinks.forEach(l => l.classList.remove('text-purple-600'));
        this.classList.add('text-purple-600');
    });
});

// Testimonial slider functionality
let currentTestimonial = 0;
const dots = document.querySelectorAll('.flex.justify-center button');

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        dots.forEach(d => {
            d.classList.remove('primary-color');
            d.classList.add('bg-gray-300');
        });
        dot.classList.remove('bg-gray-300');
        dot.classList.add('primary-color');
        currentTestimonial = index;
    });
});

// Auto-rotate testimonials every 5 seconds
setInterval(() => {
    currentTestimonial = (currentTestimonial + 1) % dots.length;
    dots.forEach((d, i) => {
        if (i === currentTestimonial) {
            d.classList.remove('bg-gray-300');
            d.classList.add('primary-color');
        } else {
            d.classList.remove('primary-color');
            d.classList.add('bg-gray-300');
        }
    });
}, 5000);

// Add hover effect to buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
    });
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// Cek login saat halaman dibuka
// Cek login saat halaman dibuka
async function checkLoginStatus() {
    try {
        const response = await fetch('./backend/api/check_session.php', {
            credentials: 'include'
        });
        
        const data = await response.json();
        const cartLink = document.getElementById('cart-link');
        
        if (data.logged_in && data.user) {
            // ✅ CEK ROLE: Jika seller, redirect ke homeSeller.html
            if (data.user.role === 'seller') {
                window.location.href = 'homeSeller.html';
                return;
            }
            
            // User sudah login (dan bukan seller)
            document.getElementById('auth-buttons').classList.add('hidden');
            document.getElementById('user-info').classList.remove('hidden');
            document.getElementById('user-info').classList.add('flex');
            
            // TAMPILKAN KERANJANG
            if (cartLink) {
                cartLink.classList.remove('hidden');
            }
            
            // Set nama user
            const userNameEl = document.getElementById('user-name');
            if (userNameEl) {
                userNameEl.textContent = data.user.username;
            }
            
            // ✅ UPDATE FOTO PROFIL DI NAVBAR
            const userAvatar = document.getElementById('user-avatar');
            if (userAvatar && data.user.profile_photo) {
                userAvatar.src = './backend/uploads/profile_photos/' + data.user.profile_photo;
                userAvatar.onerror = function() {
                    // Fallback ke avatar default jika foto tidak ditemukan
                    this.src = './assets/img/user.png';
                };
            }
            
            // Simpan ke localStorage sebagai backup
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', data.user.username);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userPhoto', data.user.profile_photo || '');
            
        } else {
            // User belum login
            document.getElementById('auth-buttons').classList.remove('hidden');
            document.getElementById('user-info').classList.add('hidden');
            
            // SEMBUNYIKAN KERANJANG
            if (cartLink) {
                cartLink.classList.add('hidden');
            }
            
            // Bersihkan localStorage
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            localStorage.removeItem('userPhoto');
        }
    } catch (error) {
        console.error('Error checking session:', error);
        
        // Fallback ke localStorage jika server error
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userName = localStorage.getItem('userName');
        const userRole = localStorage.getItem('userRole');
        const userPhoto = localStorage.getItem('userPhoto');
        const cartLink = document.getElementById('cart-link');
        
        if (isLoggedIn && userRole === 'seller') {
            window.location.href = 'homeSeller.html';
            return;
        }
        
        if (isLoggedIn && userName) {
            document.getElementById('auth-buttons').classList.add('hidden');
            document.getElementById('user-info').classList.remove('hidden');
            document.getElementById('user-info').classList.add('flex');
            
            if (cartLink) {
                cartLink.classList.remove('hidden');
            }
            
            const userNameEl = document.getElementById('user-name');
            if (userNameEl) {
                userNameEl.textContent = userName;
            }
            
            // ✅ SET FOTO DARI LOCALSTORAGE
            const userAvatar = document.getElementById('user-avatar');
            if (userAvatar && userPhoto) {
                userAvatar.src = './backend/uploads/profile_photos/' + userPhoto;
                userAvatar.onerror = function() {
                    this.src = './assets/img/user.png';
                };
            }
        }
    }
}

// Logout dengan request ke server
async function logout() {
    try {
        const response = await fetch('backend/api/logout.php', {
            method: 'POST',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Bersihkan localStorage
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            localStorage.removeItem('userPhoto'); // ✅ TAMBAHKAN INI
            localStorage.removeItem('cart');
            
            // Update UI
            const cartLink = document.getElementById('cart-link');
            document.getElementById('auth-buttons').classList.remove('hidden');
            document.getElementById('user-info').classList.add('hidden');
            const dropdown = document.getElementById('dropdown-menu');
            if (dropdown) dropdown.classList.add('hidden');
            
            if (cartLink) {
                cartLink.classList.add('hidden');
            }
            
            alert('Kamu telah logout 👋');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userPhoto'); // ✅ TAMBAHKAN INI
        
        alert('Kamu telah logout 👋');
        window.location.href = 'index.html';
    }
}
// Dropdown toggle
document.getElementById('avatar-button')?.addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('dropdown-menu').classList.toggle('hidden');
});

// Tutup dropdown kalau klik di luar
document.addEventListener('click', function() {
    document.getElementById('dropdown-menu')?.classList.add('hidden');
});

// Jalankan saat halaman loaded
window.addEventListener('load', () => {
    checkLoginStatus();
    loadRandomPromos();
});