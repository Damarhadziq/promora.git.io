// Variable to store products
let products = [];
let currentUser = null;

// Helper function untuk generate avatar URL
function getAvatarUrl(name, size = 150) {
    const initial = name ? name.charAt(0).toUpperCase() : 'S';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&size=${size}&background=7A5AF8&color=fff&bold=true`;
}

// Fetch products from database (only for logged-in seller)
async function fetchProducts() {
    try {
        const response = await fetch('backend/api/products/list.php', {
            credentials: 'include' // Important for session cookies
        });
        
        if (response.status === 401) {
            alert('Sesi Anda telah berakhir. Silakan login kembali.');
            window.location.href = 'login.html';
            return;
        }
        
        const data = await response.json();
        
        if (data.error) {
            console.error('Error:', data.error);
            alert('Gagal memuat produk: ' + data.error);
            return;
        }
        
        products = data;
        console.log(`Loaded ${products.length} products for current seller`);
        renderProducts();
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Gagal memuat produk dari server');
    }
}

// Fetch user profile
async function fetchUserProfile() {
    try {
        const response = await fetch('backend/api/get_profile.php', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.logged_in && data.user) {
            currentUser = data.user;
            
            // Update nama toko/seller
            const nameElement = document.querySelector('.text-2xl.font-bold.text-gray-900');
            if (nameElement) {
                nameElement.textContent = data.user.full_name || data.user.username;
            }
            
            // Update seller name in settings section
            const settingsNameInput = document.querySelector('#content-pengaturan input[type="text"]');
            if (settingsNameInput) {
                settingsNameInput.value = data.user.full_name || data.user.username;
            }
            
            console.log('Logged in as:', data.user.full_name, '(ID:', data.user.id + ')');
        } else {
            // Redirect to login if not logged in
            alert('Anda harus login terlebih dahulu');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Gagal memuat profil. Silakan login kembali.');
        window.location.href = 'login.html';
    }
}

// Render products
function renderProducts() {
    const grid = document.getElementById('products-grid');
    
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="col-span-3 text-center py-12">
                <svg class="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <p class="text-gray-500 text-lg mb-4">Belum ada produk</p>
                <button onclick="window.location.href='uploadProduk.html'" class="btn-primary text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center space-x-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    <span>Tambah Produk Pertama</span>
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = products.map(product => `
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden product-card">
            <div class="relative h-64 overflow-hidden">
                <img src="${product.image || 'https://via.placeholder.com/400x300?text=No+Image'}" 
                     alt="${product.name}" 
                     class="w-full h-full object-cover"
                     onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                ${parseInt(product.stock) === 0 ? 
                    '<div class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Stok Habis</div>' : 
                    ''}
            </div>
            <div class="p-5">
                <p class="text-sm text-gray-500 mb-1">${product.brand || 'No Brand'}</p>
                <h3 class="text-lg font-bold text-gray-900 mb-3 line-clamp-2">${product.name}</h3>
                
                <div class="flex items-baseline space-x-2 mb-1">
                    <span class="text-2xl font-bold text-[#7A5AF8]">Rp ${parseInt(product.price).toLocaleString('id-ID')}</span>
                    ${product.original_price && parseInt(product.original_price) > parseInt(product.price) ? 
                        `<span class="text-sm text-gray-400 line-through">Rp ${parseInt(product.original_price).toLocaleString('id-ID')}</span>` : 
                        ''}
                </div>

                <p class="text-sm text-gray-600 mb-1">Fee: Rp ${parseInt(product.fee || 0).toLocaleString('id-ID')}</p>
                <p class="text-sm ${parseInt(product.stock) === 0 ? 'text-red-600' : 'text-green-600'} font-semibold mb-4">
                    Stok: ${product.stock || '0'} item
                </p>
                
                <div class="flex space-x-2">
                    <button onclick="editProduct(${product.id})" 
                            class="flex-1 px-4 py-2 border border-[#7A5AF8] text-[#7A5AF8] rounded-lg font-medium hover:bg-[#7A5AF8] hover:text-white transition">
                        Edit
                    </button>
                    <button onclick="deleteProduct(${product.id})" 
                            class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition">
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Switch tabs - GANTI FUNGSI INI
function switchTab(tabName) {
    // Hide all content
    document.getElementById('content-produk').classList.add('hidden');
    document.getElementById('content-order').classList.add('hidden');
    document.getElementById('content-statistik').classList.add('hidden');
    document.getElementById('content-pengaturan').classList.add('hidden');
    
    // Remove active class from all tabs
    document.getElementById('tab-produk').className = 'text-grey-700 hover:text-purple-700 font-medium flex items-center space-x-2';
    document.getElementById('tab-order').className = 'text-grey-700 hover:text-purple-700 font-medium';
    document.getElementById('tab-statistik').className = 'text-grey-700 hover:text-purple-700 font-medium';
    document.getElementById('tab-pengaturan').className = 'text-grey-700 hover:text-purple-700 font-medium';
    
    // Show selected content and activate tab
    document.getElementById('content-' + tabName).classList.remove('hidden');
    document.getElementById('tab-' + tabName).className = 'text-purple-700 font-medium border-b-2 border-purple-700 flex items-center space-x-2';
    
    // Load data jika tab order
    if (tabName === 'order') {
        loadOrders();
    }
}

// Edit product
function editProduct(id) {
    // Redirect to edit page with product ID
    window.location.href = `editProduk.html?id=${id}`;
}

// Delete product
async function deleteProduct(id) {
    // Pastikan ID adalah number
    id = parseInt(id);
    
    const product = products.find(p => p.id == id);
    
    if (!product) {
        alert('Produk tidak ditemukan');
        return;
    }
    
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`)) {
        return;
    }
    
    try {
        const response = await fetch('backend/api/products/delete.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ id: id })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Produk berhasil dihapus!');
            fetchProducts(); // Reload products
        } else {
            alert('Gagal menghapus produk: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Gagal menghapus produk dari server');
    }
}

async function loadStoreData() {
    try {
        const response = await fetch('./backend/store/get_store_info.php');
        const data = await response.json();
        
        if (data.success) {
            const store = data.store;
            
            // Update logo
            if (store.logo) {
                document.getElementById('navbarLogo').src = `./backend/uploads/store_logos/${store.logo}`;
                document.getElementById('storeLogoMain').src = `./backend/uploads/store_logos/${store.logo}`;
            }
            
            // Update store name & bio
            document.querySelector('.text-2xl.font-bold.text-gray-900').textContent = store.store_name;
            document.querySelector('.text-gray-600.mb-4').textContent = store.description || 'Bio Masih Kosong....';
            
            // Display package badge
            displayPackageBadge(store.package_tier, store.package_expires_at);
            
            // Update stats
            document.getElementById('homeRating').textContent = '4.8'; // From your stats
            document.getElementById('homeTotalOrders').textContent = data.total_orders || '0';
            document.getElementById('homeTotalProducts').textContent = data.total_products || '0';
        }
    } catch (error) {
        console.error('Error loading store data:', error);
    }
}

function displayPackageBadge(packageTier, expiresAt) {
    const badgeContainer = document.querySelector('.px-3.py-1.bg-blue-100');
    
    if (!packageTier || packageTier === 'basic') {
        badgeContainer.textContent = 'Basic Seller';
        badgeContainer.className = 'px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full';
        return;
    }
    
    const packageConfig = {
        'bronze': {
            class: 'bg-orange-100 text-orange-700',
            text: 'Bronze Seller',
            icon: '🥉'
        },
        'silver': {
            class: 'bg-gray-200 text-gray-700',
            text: 'Silver Seller',
            icon: '🥈'
        },
        'gold': {
            class: 'bg-yellow-100 text-yellow-700',
            text: 'Gold Seller',
            icon: '🥇'
        }
    };
    
    const config = packageConfig[packageTier.toLowerCase()];
    
    if (config) {
        badgeContainer.className = `px-3 py-1 ${config.class} text-xs font-semibold rounded-full flex items-center space-x-1`;
        badgeContainer.innerHTML = `
            <span>${config.icon}</span>
            <span>${config.text}</span>
        `;
        
        // Add expiry info if exists
        if (expiresAt) {
            const expiryDate = new Date(expiresAt);
            const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
            
            if (daysLeft > 0) {
                badgeContainer.title = `Berlaku hingga ${expiryDate.toLocaleDateString('id-ID')} (${daysLeft} hari lagi)`;
            }
        }
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', function() {
    loadStoreData();
});

// ✅ Load store profile - VERSI FINAL
async function loadStoreProfile() {
    try {
        const response = await fetch('backend/api/get_store_profile.php', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            const store = data.store;
            
            // Update profile section - Nama Toko
            const storeNameElement = document.querySelector('.text-2xl.font-bold.text-gray-900');
            if (storeNameElement) {
                storeNameElement.textContent = store.store_name || 'Nama Toko';
            }

            // Update deskripsi toko
            const descElement = document.querySelector('.text-gray-600.mb-4');
            if (descElement) {
                descElement.textContent = store.description || 'Bio masih kosong';
            }
            
            // Update stats
            const statElements = document.querySelectorAll('.font-semibold.text-gray-900');
            if (statElements.length >= 3) {
                statElements[0].textContent = store.rating || '0.0';
                statElements[1].textContent = store.total_orders || '0';
                statElements[2].textContent = store.total_products || '0';
            }
            
            // Update verified badge visibility
            if (store.is_verified == 1) {
                const verifiedBadge = document.querySelector('.bg-blue-100.text-blue-600');
                if (verifiedBadge) {
                    verifiedBadge.style.display = 'inline-block';
                }
            }
            
            // Update pengaturan form
            const settingsInputs = document.querySelectorAll('#content-pengaturan input[type="text"]');
            if (settingsInputs.length >= 1) {
                settingsInputs[0].value = store.store_name || 'Nama Toko'; // Nama Toko
                settingsInputs[0].placeholder = 'Masukkan nama toko';
            }

            // Update phone number
            const phoneInput = document.getElementById('storePhone');
            if (phoneInput) {
                phoneInput.value = store.phone || '';
                phoneInput.placeholder = '+62 812-xxxx-xxxx';
            }
            
            // Update logo di semua tempat (termasuk navbar)
            if (store.logo) {
                const logoElements = document.querySelectorAll('#storeLogoMain, #storeLogoPreview, #navbarLogo');
                logoElements.forEach(el => {
                    el.src = 'backend/uploads/store_logos/' + store.logo;
                });
            } else {
                // Jika belum ada logo, pakai avatar default
                const logoElements = document.querySelectorAll('#storeLogoMain, #storeLogoPreview, #navbarLogo');
                logoElements.forEach(el => {
                    el.src = getAvatarUrl(store.store_name || 'Store');
                });
            }

            // Update coordinates dan maps search
const mapsSearch = document.getElementById('mapsSearch');
const addressTextarea = document.getElementById('storeAddress');

if (store.latitude && store.longitude) {
    document.getElementById('latitude').value = store.latitude;
    document.getElementById('longitude').value = store.longitude;
    
    // Update placeholder dengan koordinat
    if (mapsSearch) {
        mapsSearch.placeholder = `Lat: ${store.latitude}, Lng: ${store.longitude}`;
    }
    
    // Tampilkan alamat yang tersimpan, atau convert dari koordinat
    if (addressTextarea) {
        if (store.address && store.address.trim() !== '') {
            // Pakai alamat dari database
            addressTextarea.value = store.address;
        } else {
            // Convert koordinat ke alamat
            addressTextarea.value = 'Memuat alamat dari koordinat...';
            
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${store.latitude}&lon=${store.longitude}`)
                .then(response => response.json())
                .then(data => {
                    if (data.display_name) {
                        addressTextarea.value = data.display_name;
                        console.log('Alamat dari koordinat:', data.display_name);
                    } else {
                        addressTextarea.value = `Koordinat: ${store.latitude}, ${store.longitude}`;
                    }
                })
                .catch(err => {
                    console.error('Geocoding error:', err);
                    addressTextarea.value = `Koordinat: ${store.latitude}, ${store.longitude}`;
                });
        }
    }
} else {
    // Belum ada koordinat
    if (mapsSearch) {
        mapsSearch.placeholder = "Pilih lokasi di peta untuk mendapatkan alamat";
    }
    if (addressTextarea) {
        addressTextarea.value = '';
        addressTextarea.placeholder = "Alamat akan terisi otomatis setelah memilih lokasi di peta";
    }
}
            const settingsTextarea = document.querySelector('#content-pengaturan textarea');
            if (settingsTextarea) {
                settingsTextarea.value = store.description || '';
                settingsTextarea.placeholder = 'Tulis deskripsi toko Anda...';
            }
            
            // Update statistik section
            const statsCards = document.querySelectorAll('#content-statistik .text-3xl.font-bold.text-gray-900');
            if (statsCards.length >= 3) {
                statsCards[0].textContent = 'Rp ' + parseInt(store.total_sales || 0).toLocaleString('id-ID');
                statsCards[1].textContent = store.total_orders || '0';
                statsCards[2].textContent = (store.rating || '0.0') + '/5.0';
            }
            
        } else {
            console.error('Failed to load store profile:', data.message);
        }
    } catch (error) {
        console.error('Error loading store profile:', error);
    }
}

// Handle logo upload
let logoFile = null;

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validasi file
    if (file.size > 2 * 1024 * 1024) { // 2MB
        alert('Ukuran file terlalu besar! Maksimal 2MB');
        return;
    }
    
    if (!file.type.match('image.*')) {
        alert('File harus berupa gambar!');
        return;
    }
    
    logoFile = file;
    
    // Preview logo
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('storeLogoPreview').src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Leaflet Maps functionality - AUTO CONVERT KE ALAMAT
let map, marker;

function openMapsPicker() {
    const mapContainer = document.getElementById('mapContainer');
    mapContainer.classList.remove('hidden');
    
    if (!map) {
        // Cek apakah ada koordinat tersimpan
        const savedLat = parseFloat(document.getElementById('latitude').value);
        const savedLng = parseFloat(document.getElementById('longitude').value);
        
        // Gunakan koordinat tersimpan atau default Jakarta
        const defaultLat = (savedLat && !isNaN(savedLat)) ? savedLat : -6.2088;
        const defaultLng = (savedLng && !isNaN(savedLng)) ? savedLng : 106.8456;
        
        console.log('Opening map at:', defaultLat, defaultLng);
        
        // Initialize map
        map = L.map('mapContainer').setView([defaultLat, defaultLng], 15);
        
        // Add tile layer (peta)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Add marker di posisi yang benar
        marker = L.marker([defaultLat, defaultLng], {
            draggable: true
        }).addTo(map);
        
        // Fungsi untuk update alamat dari koordinat
        function updateAddressFromCoords(lat, lng) {
            // Update hidden inputs
            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lng;
            
            // Update placeholder mapsSearch
            const mapsSearch = document.getElementById('mapsSearch');
            if (mapsSearch) {
                mapsSearch.placeholder = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
            }
            
            // Update alamat lengkap (reverse geocode)
            const addressTextarea = document.getElementById('storeAddress');
            if (addressTextarea) {
                addressTextarea.value = 'Mengambil alamat...';
                
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.display_name) {
                            addressTextarea.value = data.display_name;
                            console.log('Alamat lengkap:', data.display_name);
                        } else {
                            addressTextarea.value = `Koordinat: ${lat}, ${lng}`;
                        }
                    })
                    .catch(err => {
                        console.error('Geocoding error:', err);
                        addressTextarea.value = `Koordinat: ${lat}, ${lng}`;
                    });
            }
        }
        
        // Update coordinates when marker is dragged
        marker.on('dragend', function(event) {
            const position = marker.getLatLng();
            updateAddressFromCoords(position.lat, position.lng);
        });
        
        // Click on map to move marker
        map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            updateAddressFromCoords(e.latlng.lat, e.latlng.lng);
        });
        
        // Search functionality
        const searchInput = document.getElementById('mapsSearch');
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            if (query.length < 3) return;
            
            searchTimeout = setTimeout(() => {
                // Search location
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.length > 0) {
                            const result = data[0];
                            const lat = parseFloat(result.lat);
                            const lon = parseFloat(result.lon);
                            
                            map.setView([lat, lon], 15);
                            marker.setLatLng([lat, lon]);
                            
                            updateAddressFromCoords(lat, lon);
                        }
                    })
                    .catch(err => console.error('Search error:', err));
            }, 1000);
        });
    } else {
        // Map sudah ada, tapi cek apakah perlu update posisi
        const savedLat = parseFloat(document.getElementById('latitude').value);
        const savedLng = parseFloat(document.getElementById('longitude').value);
        
        if (savedLat && savedLng && !isNaN(savedLat) && !isNaN(savedLng)) {
            map.setView([savedLat, savedLng], 15);
            marker.setLatLng([savedLat, savedLng]);
        }
    }
    
    // Resize map setelah ditampilkan
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}

// Save store settings - VERSI FINAL dengan alamat dari maps
async function saveStoreSettings() {
    const settingsInputs = document.querySelectorAll('#content-pengaturan input[type="text"]');
    const settingsTextarea = document.querySelector('#content-pengaturan textarea');
    
    const storeName = settingsInputs[0].value.trim();
    const description = settingsTextarea.value.trim();
    const address = document.getElementById('storeAddress').value.trim(); // Ambil dari textarea otomatis
    const phone = document.getElementById('storePhone').value.trim();
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    
    if (!storeName) {
        alert('Nama toko tidak boleh kosong!');
        return;
    }
    
    if (!latitude || !longitude) {
        alert('Silakan pilih lokasi toko di peta terlebih dahulu!');
        return;
    }
    
    console.log('Saving store with data:', {
        storeName,
        description,
        address,
        phone,
        latitude,
        longitude,
        hasLogo: logoFile !== null
    });
    
    try {
        const formData = new FormData();
        formData.append('store_name', storeName);
        formData.append('description', description);
        formData.append('address', address); // Alamat dari maps
        formData.append('phone', phone);
        formData.append('latitude', latitude || '');
        formData.append('longitude', longitude || '');
        
        if (logoFile) {
            formData.append('logo', logoFile);
        }
        
        const response = await fetch('backend/api/update_store.php', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Pengaturan toko berhasil disimpan!');
            logoFile = null; // Reset logo file
            loadStoreProfile(); // Reload untuk update tampilan
        } else {
            alert('Gagal menyimpan: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error saving store:', error);
        alert('Terjadi kesalahan saat menyimpan');
    }
}

// Load orders dengan filter shipping_status
async function loadOrders(shippingStatus = 'all') {
    try {
        let url = 'backend/api/seller/get_orders.php';
        
        const response = await fetch(url, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            let orders = data.orders;
            
            // Filter by shipping_status jika bukan 'all'
            if (shippingStatus !== 'all') {
                orders = orders.filter(o => o.shipping_status === shippingStatus);
            }
            
            renderOrders(orders, shippingStatus);
        } else {
            console.error('Failed to load orders:', data.message);
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

// Render orders - GRID 2 COLUMNS
function renderOrders(orders, currentFilter) {
    const container = document.getElementById('orders-container');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg class="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                <p class="text-gray-500">Belum ada order dengan status ini</p>
            </div>
        `;
        return;
    }
    
    // Wrap dalam grid container
    const ordersHTML = orders.map(order => {
        const statusBadge = getShippingStatusBadge(order.shipping_status);
        const statusActions = getShippingStatusActions(order.shipping_status, order.id);
        
        return `
            <div class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition">
                <!-- Header Compact -->
                <div class="bg-gray-50 px-4 py-3 border-b">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <p class="font-bold text-gray-900 text-sm">${order.invoice_number}</p>
                            <p class="text-xs text-gray-500">${new Date(order.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}</p>
                        </div>
                        ${statusBadge}
                    </div>
                    <div class="flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <p class="font-semibold text-sm text-gray-900 truncate">${order.customer_name}</p>
                    </div>
                </div>
                
                <!-- Content Area -->
                <div class="p-4">
                    <!-- Items Compact -->
                    <div class="mb-3">
                        <div class="flex items-center gap-2 mb-2">
                            <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                            <h4 class="font-semibold text-sm text-gray-900">${order.items.length} Produk</h4>
                        </div>
                        <div class="space-y-2 max-h-48 overflow-y-auto">
                            ${order.items.map(item => `
                                <div class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                    <img src="${item.product_image || 'https://via.placeholder.com/48'}" 
                                         alt="${item.product_name}" 
                                         class="w-12 h-12 object-cover rounded flex-shrink-0">
                                    <div class="flex-1 min-w-0">
                                        <p class="font-medium text-sm text-gray-900 truncate">${item.product_name}</p>
                                        <p class="text-xs text-gray-600">${item.quantity}x • Rp ${parseInt(item.price).toLocaleString('id-ID')}</p>
                                    </div>
                                    <p class="font-bold text-sm text-[#7A5AF8] whitespace-nowrap">Rp ${parseInt(item.subtotal).toLocaleString('id-ID')}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Info Grid Compact -->
                    <div class="grid grid-cols-2 gap-2 mb-3 text-xs">
                        <div class="bg-blue-50 p-2 rounded">
                            <p class="text-gray-600 mb-0.5">Kurir</p>
                            <p class="font-semibold text-gray-900 truncate">${order.courier_method}</p>
                        </div>
                        <div class="bg-green-50 p-2 rounded">
                            <p class="text-gray-600 mb-0.5">Pembayaran</p>
                            <p class="font-semibold text-gray-900 capitalize truncate">${order.payment_method}</p>
                        </div>
                    </div>
                    
                    <!-- Total -->
                    <div class="bg-purple-50 p-2 rounded mb-3">
                        <div class="flex justify-between items-center">
                            <p class="text-xs text-gray-600">Total Pembayaran</p>
                            <p class="font-bold text-[#7A5AF8]">Rp ${parseInt(order.grand_total).toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    ${statusActions}
                </div>
            </div>
        `;
    }).join('');
    
    // Bungkus dalam grid 2 kolom
    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            ${ordersHTML}
        </div>
    `;
}

// Get shipping status badge - COMPACT
function getShippingStatusBadge(status) {
    const badges = {
        'pending': '<span class="px-2.5 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full inline-flex items-center gap-1"><span>⏱️</span><span>Pending</span></span>',
        'processing': '<span class="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full inline-flex items-center gap-1"><span>🎁</span><span>Dikemas</span></span>',
        'shipped': '<span class="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full inline-flex items-center gap-1"><span>🚚</span><span>Dikirim</span></span>',
        'delivered': '<span class="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full inline-flex items-center gap-1"><span>📦</span><span>Sampai</span></span>',
        'completed': '<span class="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full inline-flex items-center gap-1"><span>✅</span><span>Selesai</span></span>'
    };
    return badges[status] || '';
}

// Get shipping status actions - COMPACT
function getShippingStatusActions(status, orderId) {
    if (status === 'pending') {
        return `
            <button onclick="updateShippingStatus(${orderId}, 'processing')" 
                    class="w-full btn-primary text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                <span>🎁</span>
                <span>Mulai Proses</span>
            </button>
        `;
    } else if (status === 'processing') {
        return `
            <button onclick="updateShippingStatus(${orderId}, 'shipped')" 
                    class="w-full btn-primary text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                <span>🚚</span>
                <span>Tandai Dikirim</span>
            </button>
        `;
    } else if (status === 'shipped') {
        return `
            <button onclick="updateShippingStatus(${orderId}, 'delivered')" 
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                <span>📦</span>
                <span>Sampai Tujuan</span>
            </button>
        `;
    } else if (status === 'delivered') {
        return `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-center">
                <p class="text-blue-800 font-semibold text-xs">⏳ Menunggu konfirmasi buyer</p>
            </div>
        `;
    } else if (status === 'completed') {
        return `
            <div class="bg-green-50 border border-green-200 rounded-lg p-2.5 text-center">
                <p class="text-green-800 font-bold text-xs">✅ Order Selesai</p>
            </div>
        `;
    }
    return '';
}

// Get shipping status badge
function getShippingStatusBadge(status) {
    const badges = {
        'pending': '<span class="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-full">Menunggu Diproses</span>',
        'processing': '<span class="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">🎁 Sedang Dibungkus</span>',
        'shipped': '<span class="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">🚚 Dalam Pengiriman</span>',
        'delivered': '<span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">📦 Sudah Sampai</span>',
        'completed': '<span class="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">✅ Selesai</span>'
    };
    return badges[status] || '';
}

// Get shipping status actions
function getShippingStatusActions(status, orderId) {
    if (status === 'pending') {
        return `
            <button onclick="updateShippingStatus(${orderId}, 'processing')" 
                    class="w-full btn-primary text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2">
                <span>🎁</span>
                <span>Mulai Proses / Bungkus Pesanan</span>
            </button>
        `;
    } else if (status === 'processing') {
        return `
            <button onclick="updateShippingStatus(${orderId}, 'shipped')" 
                    class="w-full btn-primary text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2">
                <span>🚚</span>
                <span>Tandai Sudah Dikirim</span>
            </button>
        `;
    } else if (status === 'shipped') {
        return `
            <button onclick="updateShippingStatus(${orderId}, 'delivered')" 
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2">
                <span>📦</span>
                <span>Konfirmasi Sudah Sampai</span>
            </button>
        `;
    } else if (status === 'delivered') {
        return `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p class="text-blue-800 font-medium">Menunggu konfirmasi penerimaan dari buyer</p>
                <p class="text-sm text-blue-600 mt-1">Order akan otomatis selesai setelah buyer konfirmasi</p>
            </div>
        `;
    } else if (status === 'completed') {
        return `
            <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p class="text-green-800 font-bold">✅ Order Selesai</p>
                <p class="text-sm text-green-600 mt-1">Terima kasih!</p>
            </div>
        `;
    }
    return '';
}

// Update shipping status
async function updateShippingStatus(invoiceId, newStatus) {
    const confirmMessages = {
        'processing': 'Mulai memproses/membungkus order ini?',
        'shipped': 'Konfirmasi order ini sudah dikirim ke ekspedisi?',
        'delivered': 'Konfirmasi paket sudah sampai ke alamat tujuan?'
    };
    
    if (!confirm(confirmMessages[newStatus])) {
        return;
    }
    
    try {
        const response = await fetch('backend/api/seller/update_order_status.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                invoice_id: invoiceId,
                shipping_status: newStatus
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ ' + data.message);
            loadOrders(); // Reload orders
        } else {
            alert('❌ Gagal update status: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat update status');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load profile first, then products and store
    fetchUserProfile().then(() => {
        fetchProducts();
        loadStoreProfile(); // Tambahkan ini
    });
});