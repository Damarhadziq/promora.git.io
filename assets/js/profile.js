// assets/js/profile.js
const API_BASE_URL = 'backend/api';
let profilePhotoFile = null;
let map, marker;

// Load user profile saat page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserProfile();
});

// Fungsi untuk load data profile
async function loadUserProfile() {
    try {
        const response = await fetch(API_BASE_URL + '/get_profile.php', {
            method: 'GET',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.logged_in && result.user) {
            const user = result.user;
            
            // Update display name dan email di sidebar
            document.getElementById('displayName').textContent = user.full_name;
            document.getElementById('displayEmail').textContent = user.email;
            
            // Update foto profil
            if (user.profile_photo) {
                const profileImages = document.querySelectorAll('#profileImage');
                profileImages.forEach(img => {
                    img.src = 'backend/uploads/profile_photos/' + user.profile_photo;
                });
            }
            
            // Update Personal Information di Overview Tab
            updateOverviewTab(user);
            
            // Update form Edit Profile
            updateEditForm(user);
            
            // Simpan ke localStorage sebagai backup
            localStorage.setItem('userData', JSON.stringify(user));
        } else {
            alert('Anda belum login. Silakan login terlebih dahulu.');
            window.location.href = 'lamanLogin.html';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Gagal memuat profil. Silakan refresh halaman.');
    }
}

// Update Overview Tab
function updateOverviewTab(user) {
    const overviewTab = document.getElementById('overviewTab');
    
    // Update foto profil di sidebar juga
    if (user.profile_photo) {
        const profileImages = document.querySelectorAll('#profileImage');
        profileImages.forEach(img => {
            img.src = './backend/uploads/profile_photos/' + user.profile_photo;
            img.onerror = function() {
                this.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.full_name) + '&size=150&background=7A5AF8&color=fff';
            };
        });
    }

    // Update Personal Information
    const personalInfo = overviewTab.querySelector('.bg-gray-50.rounded-xl');
    if (personalInfo) {
        const infoHTML = `
            <h4 class="font-bold text-gray-800 mb-4">Personal Information</h4>
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">Full Name</p>
                    <p class="font-semibold text-gray-800">${user.full_name}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Email</p>
                    <p class="font-semibold text-gray-800">${user.email}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Phone Number</p>
                    <p class="font-semibold text-gray-800">${user.phone || 'Not set'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Username</p>
                    <p class="font-semibold text-gray-800">@${user.username}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Role</p>
                    <p class="font-semibold text-gray-800">${user.role === 'customer' ? 'Customer' : 'Seller'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Member Since</p>
                    <p class="font-semibold text-gray-800">${user.member_since}</p>
                </div>
            </div>
        `;
        personalInfo.innerHTML = infoHTML;
    }
    
    // Update Address Section
    const addressSection = document.getElementById('userAddress');
if (addressSection) {
    if (user.address && user.address.trim() !== '') {
        // Jika sudah ada alamat tersimpan, tampilkan langsung
        addressSection.textContent = user.address;
    } else if (user.latitude && user.longitude) {
        // Jika belum ada alamat tapi ada koordinat, convert ke alamat
        addressSection.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Memuat alamat...';
        
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${user.latitude}&lon=${user.longitude}&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
                if (data.display_name) {
                    addressSection.textContent = data.display_name;
                } else if (data.address) {
                    // Format alamat dari komponen address
                    const addr = data.address;
                    let fullAddress = '';
                    
                    if (addr.road) fullAddress += addr.road;
                    if (addr.suburb) fullAddress += (fullAddress ? ', ' : '') + addr.suburb;
                    if (addr.city || addr.city_district) fullAddress += (fullAddress ? ', ' : '') + (addr.city || addr.city_district);
                    if (addr.state) fullAddress += (fullAddress ? ', ' : '') + addr.state;
                    if (addr.postcode) fullAddress += ' ' + addr.postcode;
                    if (addr.country) fullAddress += (fullAddress ? ', ' : '') + addr.country;
                    
                    addressSection.textContent = fullAddress || 'Alamat tidak dapat diformat';
                } else {
                    addressSection.textContent = 'Alamat tidak ditemukan';
                }
            })
            .catch(err => {
                console.error('Geocoding error:', err);
                addressSection.textContent = 'Gagal memuat alamat';
            });
    } else {
        addressSection.textContent = 'Belum ada alamat tersimpan';
    }
}
}

// Update Edit Form
function updateEditForm(user) {
    document.getElementById('firstName').value = user.first_name || '';
    document.getElementById('lastName').value = user.last_name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    
    // Update koordinat dan alamat
    const mapsSearch = document.getElementById('mapsSearch');
    const addressTextarea = document.getElementById('address');
    const latInput = document.getElementById('latitude');
    const lngInput = document.getElementById('longitude');

    if (user.latitude && user.longitude) {
        // Simpan koordinat di hidden input
        latInput.value = user.latitude;
        lngInput.value = user.longitude;
        
        // ✅ TAMPILKAN KOORDINAT di input mapsSearch (READ-ONLY)
        if (mapsSearch) {
            mapsSearch.value = `${user.latitude}, ${user.longitude}`;
            mapsSearch.disabled = true; // Disable input agar tidak bisa diedit
            mapsSearch.classList.add('bg-gray-100', 'cursor-not-allowed'); // Tambah styling disabled
        }
        
        // Untuk textarea alamat
        if (addressTextarea) {
            if (user.address && user.address.trim() !== '') {
                // Jika sudah ada alamat tersimpan, tampilkan
                addressTextarea.value = user.address;
            } else {
                // Jika belum ada, convert dari koordinat
                addressTextarea.value = 'Memuat alamat...';
                
                fetch(`backend/api/geocode.php?lat=${user.latitude}&lon=${user.longitude}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.display_name) {
                            addressTextarea.value = data.display_name;
                        } else if (data.address) {
                            // Format alamat dari komponen address
                            const addr = data.address;
                            let fullAddress = '';
                            
                            if (addr.road) fullAddress += addr.road;
                            if (addr.suburb) fullAddress += (fullAddress ? ', ' : '') + addr.suburb;
                            if (addr.city || addr.city_district) fullAddress += (fullAddress ? ', ' : '') + (addr.city || addr.city_district);
                            if (addr.state) fullAddress += (fullAddress ? ', ' : '') + addr.state;
                            if (addr.postcode) fullAddress += ' ' + addr.postcode;
                            if (addr.country) fullAddress += (fullAddress ? ', ' : '') + addr.country;
                            
                            addressTextarea.value = fullAddress || 'Alamat tidak dapat diformat';
                        } else {
                            addressTextarea.value = 'Alamat tidak ditemukan';
                        }
                    })
                    .catch(err => {
                        console.error('Geocoding error:', err);
                        addressTextarea.value = 'Gagal memuat alamat';
                    });
            }
        }
    } else {
        // Jika belum ada koordinat
        if (latInput) latInput.value = '';
        if (lngInput) lngInput.value = '';
        if (mapsSearch) {
            mapsSearch.value = '';
            mapsSearch.placeholder = "Pilih lokasi di peta untuk mendapatkan koordinat";
            mapsSearch.disabled = false; // Enable kembali
            mapsSearch.classList.remove('bg-gray-100', 'cursor-not-allowed');
        }
        if (addressTextarea) {
            addressTextarea.value = '';
            addressTextarea.placeholder = "Alamat akan terisi otomatis setelah memilih lokasi di peta";
        }
    }
}

// Load activities saat tab activity dibuka
async function loadActivities() {
    try {
        const response = await fetch(API_BASE_URL + '/get_user_activities.php', {
            method: 'GET',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success && result.activities) {
            displayActivities(result.activities);
        } else {
            document.getElementById('activityList').innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-inbox text-5xl mb-4"></i>
                    <p>Belum ada aktivitas</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading activities:', error);
        showNotification('Gagal memuat aktivitas', 'error');
    }
}

// Display activities
function displayActivities(activities) {
    const container = document.getElementById('activityList');
    
    if (!activities || activities.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-inbox text-5xl mb-4"></i>
                <p>Belum ada aktivitas</p>
            </div>
        `;
        return;
    }
    
    const statusConfig = {
    pending: {
        icon: 'fa-clock',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        badge: 'bg-orange-100 text-orange-700',
        label: 'Menunggu Pembayaran',
        description: 'Klik untuk upload bukti pembayaran'
    },
    waiting: {
        icon: 'fa-hourglass-half',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        badge: 'bg-yellow-100 text-yellow-700',
        label: 'Menunggu Verifikasi',
        description: 'Sedang diverifikasi oleh admin'
    },
    verified: {
        icon: 'fa-check-circle',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        badge: 'bg-green-100 text-green-700',
        label: 'Pembayaran Terverifikasi',
        description: 'Pembayaran sudah diverifikasi admin'
    },
    rejected: {
        icon: 'fa-times-circle',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        badge: 'bg-red-100 text-red-700',
        label: 'Pembayaran Ditolak',
        description: 'Pembayaran ditolak oleh admin'
    }
    };
    
    const html = activities.map(activity => {
        const status = statusConfig[activity.display_status] || statusConfig.pending;
        const timeAgo = getTimeAgo(activity.created_at);
        const clickAction = activity.display_status === 'pending' ? 
            `onclick="goToPayment('${activity.id}')"` : 
            `onclick="showActivityDetail(${JSON.stringify(activity).replace(/"/g, '&quot;')})"`;
        
        return `
            <div ${clickAction} class="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer">
                <div class="w-12 h-12 ${status.iconBg} rounded-full flex items-center justify-center flex-shrink-0">
                    <i class="fas ${status.icon} ${status.iconColor}"></i>
                </div>
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                        <p class="font-semibold text-gray-800">${status.label}</p>
                        <span class="text-xs px-3 py-1 rounded-full ${status.badge}">${activity.invoice_number}</span>
                    </div>
                    <p class="text-sm text-gray-600">${status.description}</p>
                    <div class="flex items-center justify-between mt-2">
                        <p class="text-sm font-bold text-primary">Rp ${formatNumber(activity.grand_total)}</p>
                        <p class="text-xs text-gray-400">${activity.total_items} item • ${timeAgo}</p>
                    </div>
                    ${activity.admin_note && activity.display_status === 'rejected' ? `
                        <div class="mt-2 p-2 bg-red-50 rounded border border-red-200">
                            <p class="text-xs text-red-700"><i class="fas fa-info-circle mr-1"></i> ${activity.admin_note}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Format number
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Get time ago
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Baru saja';
    if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + ' menit lalu';
    if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + ' jam lalu';
    if (diffInSeconds < 604800) return Math.floor(diffInSeconds / 86400) + ' hari lalu';
    if (diffInSeconds < 2592000) return Math.floor(diffInSeconds / 604800) + ' minggu lalu';
    return Math.floor(diffInSeconds / 2592000) + ' bulan lalu';
}

// Go to payment page (untuk status pending)
function goToPayment(invoiceId) {
    localStorage.setItem('invoice_id', invoiceId);
    window.location.href = 'pembayaran.html';
}

// Show activity detail modal
function showActivityDetail(activity) {
    const statusConfig = {
        pending: { label: 'Menunggu Pembayaran', class: 'text-orange-600 bg-orange-50' },
        waiting: { label: 'Menunggu Verifikasi', class: 'text-yellow-600 bg-yellow-50' },
        verified: { label: 'Pembayaran Terverifikasi', class: 'text-green-600 bg-green-50' },  // ✅ GANTI 'success' jadi 'verified'
        rejected: { label: 'Ditolak', class: 'text-red-600 bg-red-50' }
    };
    
    const status = statusConfig[activity.display_status] || statusConfig.pending;
    
    const itemsHtml = activity.items.map(item => `
        <div class="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <img src="${item.product_image}" alt="${item.product_name}" class="w-16 h-16 object-cover rounded">
            <div class="flex-1">
                <p class="font-semibold text-sm">${item.product_name}</p>
                <p class="text-xs text-gray-500">${item.product_brand}</p>
                <p class="text-xs text-gray-600 mt-1">Qty: ${item.quantity} × Rp ${formatNumber(item.price)}</p>
            </div>
            <div class="text-right">
                <p class="font-bold text-primary">Rp ${formatNumber(item.subtotal)}</p>
            </div>
        </div>
    `).join('');
    
    const modalHtml = `
        <div id="activityModal" class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">Detail Pesanan</h3>
                        <p class="text-sm text-gray-500">${activity.invoice_number}</p>
                    </div>
                    <button onclick="closeActivityModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <div class="p-6 space-y-6">
                    <!-- Status -->
                    <div class="flex items-center justify-between p-4 rounded-xl ${status.class}">
                        <div>
                            <p class="text-sm font-medium">Status Pesanan</p>
                            <p class="text-lg font-bold">${status.label}</p>
                        </div>
                        <i class="fas fa-${activity.display_status === 'verified' ? 'check-circle' : activity.display_status === 'rejected' ? 'times-circle' : 'clock'} text-3xl"></i>
                    </div>
                    
                    ${activity.admin_note && activity.display_status === 'rejected' ? `
                        <div class="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p class="text-sm font-semibold text-red-700 mb-1">Catatan Admin:</p>
                            <p class="text-sm text-red-600">${activity.admin_note}</p>
                        </div>
                    ` : ''}
                    
                    <!-- Items -->
                    <div>
                        <h4 class="font-bold text-gray-800 mb-3">Daftar Produk (${activity.total_items} item)</h4>
                        <div class="space-y-2">
                            ${itemsHtml}
                        </div>
                    </div>
                    
                    <!-- Payment Info -->
                    <div class="bg-gray-50 rounded-xl p-4 space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Subtotal Produk</span>
                            <span class="font-semibold">Rp ${formatNumber(activity.total_price)}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Fee Jastip</span>
                            <span class="font-semibold">Rp ${formatNumber(activity.total_fee)}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Ongkir (${activity.courier_method})</span>
                            <span class="font-semibold">Rp ${formatNumber(activity.shipping_cost)}</span>
                        </div>
                        <hr class="my-2">
                        <div class="flex justify-between text-lg font-bold text-primary">
                            <span>Total Pembayaran</span>
                            <span>Rp ${formatNumber(activity.grand_total)}</span>
                        </div>
                    </div>
                    
                    <!-- Metode Pembayaran -->
                    <div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <span class="text-sm text-gray-600">Metode Pembayaran</span>
                        <span class="font-semibold text-primary capitalize">${activity.payment_method}</span>
                    </div>
                    
                    <!-- Bukti Pembayaran -->
                    ${activity.payment_proof ? `
                        <div>
                            <h4 class="font-bold text-gray-800 mb-3">Bukti Pembayaran</h4>
                            <img src="uploads/payments/${activity.payment_proof}" 
                                 alt="Bukti Pembayaran" 
                                 class="w-full rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition"
                                 onclick="window.open(this.src, '_blank')">
                        </div>
                    ` : ''}
                    
                    <!-- Action Button -->
                    ${activity.display_status === 'pending' ? `
                        <button onclick="goToPayment('${activity.id}')" class="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                            <i class="fas fa-upload mr-2"></i> Upload Bukti Pembayaran
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Close activity modal
function closeActivityModal() {
    const modal = document.getElementById('activityModal');
    if (modal) {
        modal.remove();
    }
}

// Load activities on page load jika tab activity aktif
document.addEventListener('DOMContentLoaded', () => {
    const activeTab = document.querySelector('.tab-button.active');
    if (activeTab && activeTab.dataset.tab === 'activity') {
        loadActivities();
    }
});


// Handle foto profil upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validasi file
    if (file.size > 2 * 1024 * 1024) {
        showNotification('Ukuran file terlalu besar! Maksimal 2MB', 'error');
        return;
    }
    
    if (!file.type.match('image.*')) {
        showNotification('File harus berupa gambar!', 'error');
        return;
    }
    
    profilePhotoFile = file;
    
    // Preview foto
    const reader = new FileReader();
    reader.onload = function(e) {
        document.querySelectorAll('#profileImage').forEach(img => {
            img.src = e.target.result;
        });
    };
    reader.readAsDataURL(file);
}

// Fungsi untuk update address dari koordinat
async function updateAddressFromCoords(lat, lng) {
    try {
        // Update hidden inputs
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lng;
        
        // ✅ UPDATE INPUT KOORDINAT (READ-ONLY)
        const mapsSearch = document.getElementById('mapsSearch');
        if (mapsSearch) {
            mapsSearch.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`; // Format 6 desimal
            mapsSearch.disabled = true;
            mapsSearch.classList.add('bg-gray-100', 'cursor-not-allowed');
        }
        
        // Update textarea dengan loading
        const addressTextarea = document.getElementById('address');
        if (addressTextarea) {
            addressTextarea.value = 'Memuat alamat...';
        }
        
        // Fetch alamat dari koordinat (menggunakan backend proxy untuk menghindari CORS)
        const response = await fetch(`backend/api/geocode.php?lat=${lat}&lon=${lng}`);
        const data = await response.json();
        
        let fullAddress = '';
        
        if (data.display_name) {
            fullAddress = data.display_name;
        } else if (data.address) {
            // Format alamat dari komponen
            const addr = data.address;
            if (addr.road) fullAddress += addr.road;
            if (addr.suburb) fullAddress += (fullAddress ? ', ' : '') + addr.suburb;
            if (addr.city || addr.city_district) fullAddress += (fullAddress ? ', ' : '') + (addr.city || addr.city_district);
            if (addr.state) fullAddress += (fullAddress ? ', ' : '') + addr.state;
            if (addr.postcode) fullAddress += ' ' + addr.postcode;
            if (addr.country) fullAddress += (fullAddress ? ', ' : '') + addr.country;
        }
        
        // Update textarea
        if (addressTextarea) {
            addressTextarea.value = fullAddress || 'Alamat tidak dapat ditemukan';
        }
        
        showNotification('Lokasi berhasil dipilih!', 'success');
        
    } catch (error) {
        console.error('Geocoding error:', error);
        const addressTextarea = document.getElementById('address');
        if (addressTextarea) {
            addressTextarea.value = 'Gagal memuat alamat. Coba lagi.';
        }
        showNotification('Gagal memuat alamat dari koordinat', 'error');
    }
}

// PERBAIKI fungsi closeMapsPicker (tambahkan jika belum ada)
function closeMapsPicker() {
    const mapContainer = document.getElementById('mapContainer');
    if (mapContainer) {
        mapContainer.classList.add('hidden');
    }
}

// Leaflet Maps functionality
function openMapsPicker() {
    const mapContainer = document.getElementById('mapContainer');
    mapContainer.classList.remove('hidden');
    
    if (!map) {
        const savedLat = parseFloat(document.getElementById('latitude').value);
        const savedLng = parseFloat(document.getElementById('longitude').value);
        
        const defaultLat = (savedLat && !isNaN(savedLat)) ? savedLat : -6.9932; // Semarang
        const defaultLng = (savedLng && !isNaN(savedLng)) ? savedLng : 110.4203; // Semarang
        
        map = L.map('mapContainer').setView([defaultLat, defaultLng], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);
        
        marker = L.marker([defaultLat, defaultLng], {
            draggable: true
        }).addTo(map);
        
        
        // Event saat marker di-drag
        marker.on('dragend', function(event) {
            const position = marker.getLatLng();
            updateAddressFromCoords(position.lat, position.lng);
        });
        
        // Event saat klik di map
        map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            updateAddressFromCoords(e.latlng.lat, e.latlng.lng);
        });
        
        // Search location
        const searchInput = document.getElementById('mapsSearch');
        let searchTimeout;
        
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            if (query.length < 3) return;
            
            searchTimeout = setTimeout(() => {
                fetch(`backend/api/geocode.php?q=${encodeURIComponent(query)}`)
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
        
        // Auto-load alamat saat pertama buka map
        if (savedLat && savedLng && !isNaN(savedLat) && !isNaN(savedLng)) {
            updateAddressFromCoords(savedLat, savedLng);
        }
        
    } else {
        const savedLat = parseFloat(document.getElementById('latitude').value);
        const savedLng = parseFloat(document.getElementById('longitude').value);
        
        if (savedLat && savedLng && !isNaN(savedLat) && !isNaN(savedLng)) {
            map.setView([savedLat, savedLng], 15);
            marker.setLatLng([savedLat, savedLng]);
        }
    }
    
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
}

// Save Profile Changes
async function saveProfile(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    
    if (!firstName || !email) {
        showNotification('First name and email are required', 'error');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('address', address);
        formData.append('latitude', latitude || '');
        formData.append('longitude', longitude || '');
        
        if (profilePhotoFile) {
            formData.append('profile_photo', profilePhotoFile);
        }
        
        const response = await fetch(API_BASE_URL + '/update_profile.php', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Profile updated successfully!', 'success');
            profilePhotoFile = null;
            await loadUserProfile();
            switchTab('overview');
        } else {
            showNotification(result.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while updating profile', 'error');
    }
}

// Change Password
async function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('All password fields are required', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('New password and confirmation do not match', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
    }
    
    try {
        const response = await fetch(API_BASE_URL + '/change_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Password changed successfully!', 'success');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            showNotification(result.message || 'Failed to change password', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('An error occurred while changing password', 'error');
    }
}

// Switch Tab Function
// Switch Tab Function
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'text-primary', 'border-b-2', 'border-primary');
        btn.classList.add('text-gray-500');
    });
    
    const tabMap = {
        'overview': 'overviewTab',
        'edit': 'editTab',
        'security': 'securityTab',
        'activity': 'activityTab',
        'order': 'orderTab'  // ✅ TAMBAHKAN INI
    };
    
    const selectedTab = document.getElementById(tabMap[tabName]);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
    
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'text-primary', 'border-b-2', 'border-primary');
        activeBtn.classList.remove('text-gray-500');
    }
    
    // ✅ TRIGGER LOAD DATA UNTUK TAB TERTENTU
    if (tabName === 'activity') {
        loadActivities();
    } else if (tabName === 'order') {
        loadUserOrders();
    }
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    notificationText.textContent = message;
    
    const icon = notification.querySelector('i');
    if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle text-red-500 text-xl';
    } else {
        icon.className = 'fas fa-check-circle text-green-500 text-xl';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Cancel Edit
function cancelEdit() {
    loadUserProfile();
    switchTab('overview');
}

// Load user orders
async function loadUserOrders(filterStatus = 'all') {
    const container = document.getElementById('ordersList');
    
    container.innerHTML = `
        <div class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
            <p class="text-gray-500">Memuat pesanan...</p>
        </div>
    `;
    
    try {
        const response = await fetch(API_BASE_URL + '/user/get_orders.php', {
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success && result.orders) {
            let orders = result.orders;
            
            // Filter orders
            if (filterStatus !== 'all') {
                if (filterStatus === 'pending') {
                    orders = orders.filter(o => o.status === 'pending');
                } else if (filterStatus === 'waiting') {
                    orders = orders.filter(o => o.status === 'waiting' || (o.status === 'verified' && o.shipping_status !== 'delivered' && o.shipping_status !== 'completed'));
                } else if (filterStatus === 'shipped') {
                    orders = orders.filter(o => o.shipping_status === 'shipped');
                } else if (filterStatus === 'delivered') {
                    orders = orders.filter(o => o.shipping_status === 'delivered');
                } else if (filterStatus === 'completed') {
                    orders = orders.filter(o => o.shipping_status === 'completed');
                }
            }
            
            displayUserOrders(orders);
        } else {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-inbox text-5xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">Belum ada pesanan</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = `
            <div class="text-center py-12 text-red-500">
                <i class="fas fa-exclamation-circle text-5xl mb-4"></i>
                <p>Gagal memuat pesanan</p>
            </div>
        `;
    }
}

// Display user orders
function displayUserOrders(orders) {
    const container = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-inbox text-5xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">Tidak ada pesanan dengan filter ini</p>
            </div>
        `;
        return;
    }
    
    const statusConfig = {
        pending: { icon: 'clock', color: 'orange', label: 'Belum Bayar' },
        waiting: { icon: 'hourglass-half', color: 'yellow', label: 'Menunggu Verifikasi' },
        processing: { icon: 'box', color: 'purple', label: 'Sedang Diproses' },
        shipped: { icon: 'truck', color: 'blue', label: 'Sedang Dikirim' },
        delivered: { icon: 'home', color: 'green', label: 'Sudah Sampai' },
        completed: { icon: 'check-circle', color: 'green', label: 'Selesai' }
    };
    
    const html = orders.map(order => {
        let currentStatus = order.shipping_status || 'pending';
        if (order.status === 'pending') currentStatus = 'pending';
        if (order.status === 'waiting') currentStatus = 'waiting';
        
        const status = statusConfig[currentStatus] || statusConfig.pending;
        
        return `
            <div class="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:shadow-lg transition">
                <!-- Header -->
                <div class="bg-gray-50 px-6 py-4 flex justify-between items-center border-b">
                    <div>
                        <p class="font-bold text-gray-800">${order.invoice_number}</p>
                        <p class="text-sm text-gray-500">${new Date(order.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric', month: 'long', day: 'numeric'
                        })}</p>
                    </div>
                    <span class="px-4 py-2 bg-${status.color}-100 text-${status.color}-700 rounded-full text-sm font-semibold">
                        <i class="fas fa-${status.icon} mr-1"></i>${status.label}
                    </span>
                </div>
                
                <!-- Items -->
                <div class="p-6">
                    <div class="space-y-3 mb-4">
                        ${order.items.slice(0, 2).map(item => `
                            <div class="flex gap-3">
                                <img src="${item.product_image}" class="w-16 h-16 object-cover rounded-lg" onerror="this.src='https://via.placeholder.com/64'">
                                <div class="flex-1">
                                    <p class="font-semibold text-sm line-clamp-1">${item.product_name}</p>
                                    <p class="text-xs text-gray-500">${item.quantity}x</p>
                                </div>
                                <p class="font-bold text-primary">Rp ${formatNumber(item.subtotal)}</p>
                            </div>
                        `).join('')}
                        ${order.items.length > 2 ? `<p class="text-sm text-gray-500">+${order.items.length - 2} produk lainnya</p>` : ''}
                    </div>
                    
                    <!-- Total -->
                    <div class="border-t pt-4 flex justify-between items-center mb-4">
                        <span class="text-gray-600">Total Pembayaran</span>
                        <span class="text-xl font-bold text-primary">Rp ${formatNumber(order.grand_total)}</span>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex gap-3">
                        ${currentStatus === 'pending' ? `
                            <button onclick="goToPayment('${order.id}')" class="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                                <i class="fas fa-upload mr-2"></i>Bayar Sekarang
                            </button>
                        ` : currentStatus === 'delivered' ? `
                            <button onclick="confirmOrderReceived('${order.id}')" class="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                                <i class="fas fa-check mr-2"></i>Konfirmasi Pesanan Diterima
                            </button>
                        ` : ''}
                        <button onclick="showOrderDetail('${order.id}')" class="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                            Detail
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Filter orders
function filterOrders(status) {
    // Update active button
    document.querySelectorAll('.order-filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${status}"]`).classList.add('active');
    
    // Load orders with filter
    loadUserOrders(status);
}

// Confirm order received
async function confirmOrderReceived(invoiceId) {
    if (!confirm('Apakah Anda yakin sudah menerima pesanan ini?')) {
        return;
    }
    
    try {
        const response = await fetch(API_BASE_URL + '/user/confirm_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ invoice_id: invoiceId })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('✅ Pesanan berhasil dikonfirmasi!', 'success');
            loadUserOrders(); // Reload
        } else {
            showNotification('❌ ' + result.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Terjadi kesalahan', 'error');
    }
}

// Show order detail
async function showOrderDetail(invoiceId) {
    // Reuse logic dari showActivityDetail, tapi fetch detail order dulu
    try {
        const response = await fetch(API_BASE_URL + `/user/get_order_detail.php?id=${invoiceId}`, {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success) {
            showActivityDetail(result.order); // Reuse existing modal
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Logout Function
async function logout() {
    try {
        const response = await fetch(API_BASE_URL + '/logout.php', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            localStorage.clear();
            window.location.href = 'lamanLogin.html';
        }
    } catch (error) {
        console.error('Error:', error);
        localStorage.clear();
        window.location.href = 'lamanLogin.html';
    }
}

// Toggle 2FA (placeholder)
function toggle2FA(checkbox) {
    if (checkbox.checked) {
        showNotification('Two-factor authentication enabled', 'success');
    } else {
        showNotification('Two-factor authentication disabled', 'success');
    }
}

// End Session (placeholder)
function endSession(button) {
    const sessionDiv = button.closest('.flex');
    sessionDiv.style.opacity = '0.5';
    showNotification('Session ended', 'success');
    setTimeout(() => {
        sessionDiv.remove();
    }, 1000);
}

// Load More Activity (placeholder)
function loadMoreActivity() {
    showNotification('Loading more activities...', 'success');
}