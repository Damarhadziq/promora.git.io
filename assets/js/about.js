
        // Smooth scroll to top
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, observerOptions);

        // Observe all cards
        document.addEventListener('DOMContentLoaded', () => {
            const cards = document.querySelectorAll('.card-hover, .team-card');
            cards.forEach(card => observer.observe(card));
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('nav');
            if (window.scrollY > 50) {
                nav.classList.add('shadow-lg');
            } else {
                nav.classList.remove('shadow-lg');
            }
        });
// ========== AUTH FUNCTIONS ==========
// Cek login dari server (bukan localStorage)
async function checkLoginStatus() {
    try {
        const response = await fetch('backend/api/check_session.php', {
            credentials: 'include'
        });
        
        const data = await response.json();
        const cartLink = document.getElementById('cart-link');
        const authButtons = document.getElementById('auth-buttons');
        const userInfo = document.getElementById('user-info');
        const userNameEl = document.getElementById('user-name');
        
        if (data.logged_in && data.user) {
            // User sudah login
            if (authButtons) authButtons.classList.add('hidden');
            if (userInfo) {
                userInfo.classList.remove('hidden');
                userInfo.classList.add('flex');
            }
            
            // Tampilkan keranjang
            if (cartLink) {
                cartLink.classList.remove('hidden');
            }
            
            // Set nama user (username saja)
            if (userNameEl) {
                userNameEl.textContent = data.user.username;
            }
            
            // Simpan ke localStorage sebagai backup
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', data.user.username);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userId', data.user.id);
            
        } else {
            // User belum login
            if (authButtons) authButtons.classList.remove('hidden');
            if (userInfo) userInfo.classList.add('hidden');
            
            // Sembunyikan keranjang
            if (cartLink) {
                cartLink.classList.add('hidden');
            }
            
            // Bersihkan localStorage
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
        }
    } catch (error) {
        console.error('Error checking session:', error);
        
        // Fallback ke localStorage jika server error
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userName = localStorage.getItem('userName');
        const cartLink = document.getElementById('cart-link');
        const authButtons = document.getElementById('auth-buttons');
        const userInfo = document.getElementById('user-info');
        const userNameEl = document.getElementById('user-name');
        
        if (isLoggedIn && userName) {
            if (authButtons) authButtons.classList.add('hidden');
            if (userInfo) {
                userInfo.classList.remove('hidden');
                userInfo.classList.add('flex');
            }
            if (cartLink) cartLink.classList.remove('hidden');
            if (userNameEl) userNameEl.textContent = userName;
        } else {
            if (authButtons) authButtons.classList.remove('hidden');
            if (userInfo) userInfo.classList.add('hidden');
            if (cartLink) cartLink.classList.add('hidden');
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
            localStorage.removeItem('cart');
            
            // Update UI
            const cartLink = document.getElementById('cart-link');
            const authButtons = document.getElementById('auth-buttons');
            const userInfo = document.getElementById('user-info');
            const dropdown = document.getElementById('dropdown-menu');
            
            if (authButtons) authButtons.classList.remove('hidden');
            if (userInfo) userInfo.classList.add('hidden');
            if (dropdown) dropdown.classList.add('hidden');
            if (cartLink) cartLink.classList.add('hidden');
            
            alert('Kamu telah logout 👋');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        
        // Fallback logout jika server error
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        
        alert('Kamu telah logout 👋');
        window.location.href = 'index.html';
    }
}

// Dropdown avatar
const avatarButton = document.getElementById('avatar-button');
if (avatarButton) {
    avatarButton.addEventListener('click', function(e) {
        e.stopPropagation();
        const dropdown = document.getElementById('dropdown-menu');
        if (dropdown) {
            dropdown.classList.toggle('hidden');
        }
    });
}

// Tutup dropdown kalau klik di luar
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('dropdown-menu');
    const avatarButton = document.getElementById('avatar-button');
    
    if (dropdown && !dropdown.classList.contains('hidden')) {
        if (!avatarButton?.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    }
});

// Jalankan tiap halaman dibuka
window.addEventListener('load', checkLoginStatus);