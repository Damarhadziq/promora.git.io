
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
// Script ini WAJIB ada di SETIAP halaman biar status login konsisten
function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userName = localStorage.getItem('userName');

  if (isLoggedIn && userName) {
    // Sudah login → sembunyiin Login/Sign Up, tampilkan user info
    const auth = document.getElementById('auth-buttons');
    const user = document.getElementById('user-info');
    if (auth) auth.classList.add('hidden');
    if (user) {
      user.classList.remove('hidden');
    }
  } else {
    // Belum login
    const auth = document.getElementById('auth-buttons');
    const user = document.getElementById('user-info');
    if (auth) auth.classList.remove('hidden');
    if (user) user.classList.add('hidden');
  }
}

function logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  
  // Update UI langsung + tutup dropdown kalau ada
  const auth = document.getElementById('auth-buttons');
  const user = document.getElementById('user-info');
  const dropdown = document.getElementById('dropdown-menu');
  if (auth) auth.classList.remove('hidden');
  if (user) user.classList.add('hidden');
  if (dropdown) dropdown.classList.add('hidden');

  alert('Kamu telah logout 👋');
}

// Dropdown avatar
document.getElementById('avatar-button')?.addEventListener('click', function(e) {
  e.stopPropagation();
  document.getElementById('dropdown-menu')?.classList.toggle('hidden');
});

// Tutup dropdown kalau klik luar
document.addEventListener('click', () => {
  document.getElementById('dropdown-menu')?.classList.add('hidden');
});

// Jalankan tiap halaman dibuka
window.addEventListener('load', checkLoginStatus);