// Variable to store products
let products = [];
let currentUser = null;

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

// Switch tabs
function switchTab(tabName) {
    // Hide all content
    document.getElementById('content-produk').classList.add('hidden');
    document.getElementById('content-order').classList.add('hidden');
    document.getElementById('content-statistik').classList.add('hidden');
    document.getElementById('content-pengaturan').classList.add('hidden');
    
    // Remove active class from all tabs
    document.getElementById('tab-produk').className = 'text-grey-700 hover:text-purple-700 font-medium';
    document.getElementById('tab-order').className = 'text-grey-700 hover:text-purple-700 font-medium';
    document.getElementById('tab-statistik').className = 'text-grey-700 hover:text-purple-700 font-medium';
    document.getElementById('tab-pengaturan').className = 'text-grey-700 hover:text-purple-700 font-medium';
    
    // Show selected content and activate tab
    document.getElementById('content-' + tabName).classList.remove('hidden');
    document.getElementById('tab-' + tabName).className = 'text-purple-700 font-semibold border-b-2 border-purple-700';
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
                storeNameElement.textContent = store.store_name;
            }
            
            // Update deskripsi toko
            const descElement = document.querySelector('.text-gray-600.mb-4');
            if (descElement) {
                descElement.textContent = store.description;
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
                settingsInputs[0].value = store.store_name; // Nama Toko
            }
            
            // Update phone number
            const phoneInput = document.getElementById('storePhone');
            if (phoneInput) {
                phoneInput.value = store.phone || '';
            }
            
            // Update logo di semua tempat (termasuk navbar)
            if (store.logo) {
                const logoElements = document.querySelectorAll('#storeLogoMain, #storeLogoPreview, #navbarLogo');
                logoElements.forEach(el => {
                    el.src = 'backend/uploads/store_logos/' + store.logo;
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Load profile first, then products and store
    fetchUserProfile().then(() => {
        fetchProducts();
        loadStoreProfile(); // Tambahkan ini
    });
});