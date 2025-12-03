document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
      });
    }
  });
});

// Add animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -100px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Inisialisasi array kosong
let products = [];
let filteredProducts = [];

async function loadProducts() {
  try {
    const res = await fetch('backend/api/products/list_all.php');
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();

    products = data.map(p => ({
      id: p.id,
      seller: p.store_name || 'Toko Tanpa Nama', // Ganti dari seller_id ke store_name
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: parseInt(p.price) || 0,
      originalPrice: parseInt(p.original_price) || 0,
      discount: parseInt(p.discount) || 0,
      fee: parseInt(p.fee) || 0,
      stock: parseInt(p.stock) || 0,
      description: p.description || '',
      verified: p.verified == 1,
      location: p.location || '',
      image: p.image || './assets/img/default.png'
    }));

    filteredProducts = [...products];
    renderProducts();

  } catch (err) {
    console.error("Gagal load products:", err);
  }
}
// Jalankan saat halaman load
window.addEventListener('load', loadProducts);


// let filteredProducts = [...products];
let currentPage = 1;
const productsPerPage = 9;

// Format currency
function formatRupiah(amount) {
  return "Rp " + amount.toLocaleString("id-ID");
}

// Render products
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid) {
        console.error('Element productsGrid tidak ditemukan!');
        return;
    }
    
    productsGrid.innerHTML = '';
    
    // Gunakan filteredProducts
    if (!filteredProducts || filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p class="col-span-3 text-center text-gray-500 py-8">Belum ada produk</p>';
        return;
    }
    
    // Pagination
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    paginatedProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-xl shadow-custom overflow-hidden hover:shadow-xl transition flex flex-col';
        
        const discount = product.discount || 0;
        const price = parseInt(product.price) || 0;
        const originalPrice = parseInt(product.originalPrice) || 0;
        const fee = parseInt(product.fee) || 0;
        
        card.innerHTML = `
            <a href="detail.php?id=${product.id}" class="block">
                <div class="relative">
                    <img src="${product.image}" 
                         alt="${product.name}"
                         class="w-full h-64 object-cover"
                         onerror="this.src='./assets/img/placeholder.jpg'" />
                    ${discount > 0 ? `<span class="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">Diskon ${discount}%</span>` : ''}
                </div>
            </a>
            <div class="p-5 flex flex-col flex-grow">
                <a href="detail.php?id=${product.id}" class="flex-grow">
                    <span class="text-xs text-gray-500">${product.brand || 'Brand'}</span>
                    <h4 class="text-lg font-bold text-gray-900 mt-1 mb-3 line-clamp-2 min-h-[3.5rem]">${product.name}</h4>
                    <div class="flex items-baseline space-x-2 mb-3">
                        <span class="text-2xl font-bold text-purple-600">Rp ${price.toLocaleString('id-ID')}</span>
                        ${originalPrice > 0 ? `<span class="text-sm text-gray-400 line-through">Rp ${originalPrice.toLocaleString('id-ID')}</span>` : ''}
                    </div>
                    <div class="text-sm text-gray-600 mb-4">
                        <span>Fee Jastip:</span>
                        <span class="font-semibold">Rp ${fee.toLocaleString('id-ID')}</span>
                    </div>
                    <div class="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                        <span class="truncate">${product.seller || 'Toko'}</span>
                        ${product.verified ? `<svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>` : ''}
                    </div>
                </a>
                <button onclick="addToCartFromExplore(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${price})" 
                        class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center space-x-2 mt-auto">
                    <i class="hgi hgi-stroke hgi-shopping-cart-01"></i>
                    <span>Add to Cart</span>
                </button>
            </div>
        `;
        
        productsGrid.appendChild(card);
    });
    
    updatePagination();
}

async function addToCartFromExplore(productId, productName, price) {
    try {
        // Cek session dari server dulu
        const sessionResponse = await fetch('backend/api/check_session.php', {
            credentials: 'include'
        });
        const sessionData = await sessionResponse.json();
        
        if (!sessionData.logged_in) {
            alert('Silakan login terlebih dahulu!');
            window.location.href = 'lamanLogin.html';
            return;
        }
        
        // Jika sudah login, kirim ke database (PERBAIKAN DI SINI)
        const response = await fetch('backend/api/add_to_cart.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                product_id: productId,
                quantity: 1
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`✅ ${productName} berhasil ditambahkan ke keranjang!`);
        } else {
            alert(data.message || 'Gagal menambahkan ke keranjang');
        }
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Terjadi kesalahan. Silakan coba lagi.');
    }
}

// Update pagination buttons
function updatePagination() {
    const maxPage = Math.ceil(filteredProducts.length / productsPerPage);
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.style.opacity = currentPage === 1 ? '0.5' : '1';
        prevBtn.style.cursor = currentPage === 1 ? 'not-allowed' : 'pointer';
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= maxPage;
        nextBtn.style.opacity = currentPage >= maxPage ? '0.5' : '1';
        nextBtn.style.cursor = currentPage >= maxPage ? 'not-allowed' : 'pointer';
    }
    
    document.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
        const page = parseInt(btn.dataset.page);
        if (page === currentPage) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}
// Apply filters
function applyFilters() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  const location = document.getElementById("locationFilter").value;
  const minDiscount = parseInt(document.getElementById("discountRange").value);

  // Get checked categories from sidebar
  const checkedCategories = Array.from(
    document.querySelectorAll(".category-checkbox:checked")
  ).map((cb) => cb.value);

  filteredProducts = products.filter((product) => {
    const matchSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.brand.toLowerCase().includes(searchTerm);
    const matchCategory = !category || product.category === category;
    const matchLocation = !location || product.location === location;
    const matchDiscount = product.discount >= minDiscount;
    const matchSidebarCategory =
      checkedCategories.length === 0 ||
      checkedCategories.includes(product.category);

    return (
      matchSearch &&
      matchCategory &&
      matchLocation &&
      matchDiscount &&
      matchSidebarCategory
    );
  });

  // Apply sorting
  const sortValue = document.getElementById("sortFilter").value;
  if (sortValue === "price-low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortValue === "price-high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortValue === "newest") {
    filteredProducts.sort((a, b) => b.id - a.id);
  } else {
    filteredProducts.sort((a, b) => b.discount - a.discount);
  }

  currentPage = 1;
  renderProducts();
}

// Reset filters
function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("categoryFilter").value = "";
  document.getElementById("locationFilter").value = "";
  document.getElementById("sortFilter").value = "";
  document.getElementById("discountRange").value = "0";
  document.getElementById("discountValue").textContent = "0%";
  document
    .querySelectorAll(".category-checkbox")
    .forEach((cb) => (cb.checked = false));

  filteredProducts = [...products];
  currentPage = 1;
  renderProducts();
}

// Event Listeners
document.getElementById("applyFilters").addEventListener("click", applyFilters);
document.getElementById("resetFilter").addEventListener("click", resetFilters);
document.getElementById("searchInput").addEventListener("keyup", (e) => {
  if (e.key === "Enter") applyFilters();
});

// Discount range slider
document.getElementById("discountRange").addEventListener("input", (e) => {
  document.getElementById("discountValue").textContent = e.target.value + "%";
});

// Category checkboxes
document.querySelectorAll(".category-checkbox").forEach((checkbox) => {
  checkbox.addEventListener("change", applyFilters);
});

// Pagination
document.querySelectorAll(".pagination-btn[data-page]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    currentPage = parseInt(e.target.dataset.page);
    document
      .querySelectorAll(".pagination-btn")
      .forEach((b) => b.classList.remove("active"));
    e.target.classList.add("active");
    renderProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  const maxPage = Math.ceil(filteredProducts.length / productsPerPage);
  if (currentPage < maxPage) {
    currentPage++;
    renderProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            if (authButtons) authButtons.classList.add('hidden');
            if (userInfo) {
                userInfo.classList.remove('hidden');
                userInfo.classList.add('flex');
            }
            if (cartLink) cartLink.classList.remove('hidden');
            if (userNameEl) userNameEl.textContent = data.user.username;
            
            // ✅ UPDATE FOTO PROFIL
            const userAvatar = document.getElementById('user-avatar');
            if (userAvatar) {
                if (data.user.profile_photo && data.user.profile_photo !== '') {
                    userAvatar.src = './backend/uploads/profile_photos/' + data.user.profile_photo;
                    userAvatar.onerror = function() {
                        this.src = './assets/img/user.png';
                    };
                } else {
                    userAvatar.src = './assets/img/user.png';
                }
            }
            
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', data.user.username);
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userPhoto', data.user.profile_photo || '');
            
        } else {
            if (authButtons) authButtons.classList.remove('hidden');
            if (userInfo) userInfo.classList.add('hidden');
            if (cartLink) cartLink.classList.add('hidden');
            
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            localStorage.removeItem('userPhoto');
        }
    } catch (error) {
        console.error('Error checking session:', error);
        
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userName = localStorage.getItem('userName');
        const userPhoto = localStorage.getItem('userPhoto');
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
            
            // ✅ SET FOTO DARI LOCALSTORAGE
            const userAvatar = document.getElementById('user-avatar');
            if (userAvatar && userPhoto && userPhoto !== '') {
                userAvatar.src = './backend/uploads/profile_photos/' + userPhoto;
                userAvatar.onerror = function() {
                    this.src = './assets/img/user.png';
                };
            }
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
            localStorage.removeItem('userPhoto'); // ✅ TAMBAHKAN INI
            
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

// Dropdown toggle
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

// Jalankan checkLoginStatus saat halaman load
window.addEventListener('load', checkLoginStatus);