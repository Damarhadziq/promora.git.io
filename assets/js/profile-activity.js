// assets/js/profile-activity.js
// File terpisah untuk handle activity log

const API_BASE_URL = 'backend/api';

// Load activities dari database
async function loadActivities() {
    const container = document.getElementById('activityList');
    
    // Show loading
    container.innerHTML = `
        <div class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
            <p class="text-gray-500">Memuat aktivitas...</p>
        </div>
    `;
    
    try {
        const response = await fetch(API_BASE_URL + '/get_user_activities.php', {
            method: 'GET',
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (result.success && result.activities && result.activities.length > 0) {
            displayActivities(result.activities);
        } else {
            container.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-inbox text-5xl mb-4 text-gray-300"></i>
                    <p class="text-lg font-semibold mb-2">Belum ada aktivitas</p>
                    <p class="text-sm">Mulai belanja dan lihat riwayat pesanan Anda di sini</p>
                    <a href="explore.html" class="inline-block mt-4 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                        <i class="fas fa-shopping-bag mr-2"></i>Mulai Belanja
                    </a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading activities:', error);
        container.innerHTML = `
            <div class="text-center py-12 text-red-500">
                <i class="fas fa-exclamation-circle text-5xl mb-4"></i>
                <p class="text-lg font-semibold mb-2">Gagal memuat aktivitas</p>
                <button onclick="loadActivities()" class="mt-4 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                    <i class="fas fa-redo mr-2"></i>Coba Lagi
                </button>
            </div>
        `;
    }
}

// Display activities
function displayActivities(activities) {
    const container = document.getElementById('activityList');
    
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
            `onclick='showActivityDetail(${JSON.stringify(activity)})'`;
        
        return `
            <div ${clickAction} class="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer group">
                <div class="w-12 h-12 ${status.iconBg} rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <i class="fas ${status.icon} ${status.iconColor}"></i>
                </div>
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-1">
                        <p class="font-semibold text-gray-800">${status.label}</p>
                        <span class="text-xs px-3 py-1 rounded-full ${status.badge} font-medium">${activity.invoice_number}</span>
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
                <div class="flex items-center text-gray-400 group-hover:text-primary transition">
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Format number dengan pemisah ribuan
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Get relative time
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

// Go to payment page (untuk status pending - belum bayar)
function goToPayment(invoiceId) {
    localStorage.setItem('invoice_id', invoiceId);
    window.location.href = 'pembayaran.html';
}

// Show activity detail modal
function showActivityDetail(activity) {
const statusConfig = {
    pending: { 
        label: 'Menunggu Pembayaran', 
        class: 'text-orange-600 bg-orange-50 border-orange-200',
        icon: 'fa-clock'
    },
    waiting: { 
        label: 'Menunggu Verifikasi', 
        class: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: 'fa-hourglass-half'
    },
    verified: {  // ✅ TAMBAHKAN INI
        label: 'Pembayaran Terverifikasi', 
        class: 'text-green-600 bg-green-50 border-green-200',
        icon: 'fa-check-circle'
    },
    rejected: { 
        label: 'Pembayaran Ditolak', 
        class: 'text-red-600 bg-red-50 border-red-200',
        icon: 'fa-times-circle'
    }
};
    
    const status = statusConfig[activity.display_status] || statusConfig.pending;
    
    const itemsHtml = activity.items.map(item => `
        <div class="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-sm transition">
            <img src="${item.product_image}" 
                 alt="${item.product_name}" 
                 class="w-16 h-16 object-cover rounded"
                 onerror="this.src='https://via.placeholder.com/64?text=No+Image'">
            <div class="flex-1">
                <p class="font-semibold text-sm line-clamp-1">${item.product_name}</p>
                <p class="text-xs text-gray-500">${item.product_brand || 'No Brand'}</p>
                <p class="text-xs text-gray-600 mt-1">
                    ${item.quantity}x Rp ${formatNumber(item.price)}
                    ${item.fee > 0 ? ` + Fee Rp ${formatNumber(item.fee)}` : ''}
                </p>
            </div>
            <div class="text-right">
                <p class="font-bold text-primary text-sm">Rp ${formatNumber(item.subtotal)}</p>
            </div>
        </div>
    `).join('');
    
    const modalHtml = `
        <div id="activityModal" class="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4 overflow-y-auto" onclick="if(event.target === this) closeActivityModal()">
            <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                <!-- Header -->
                <div class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">Detail Pesanan</h3>
                        <p class="text-sm text-gray-500">${activity.invoice_number}</p>
                    </div>
                    <button onclick="closeActivityModal()" class="text-gray-400 hover:text-gray-600 transition">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                
                <div class="p-6 space-y-6">
                    <!-- Status Badge -->
                    <div class="flex items-center justify-between p-4 rounded-xl border ${status.class}">
                        <div>
                            <p class="text-sm font-medium opacity-80">Status Pesanan</p>
                            <p class="text-lg font-bold">${status.label}</p>
                            <p class="text-xs opacity-75 mt-1">Terakhir update: ${getTimeAgo(activity.updated_at)}</p>
                        </div>
                        <i class="fas ${status.icon} text-3xl"></i>
                    </div>
                    
                    <!-- Admin Note (jika ditolak) -->
                    ${activity.admin_note && activity.display_status === 'rejected' ? `
                        <div class="p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p class="text-sm font-semibold text-red-700 mb-1 flex items-center">
                                <i class="fas fa-exclamation-triangle mr-2"></i>
                                Catatan Admin:
                            </p>
                            <p class="text-sm text-red-600">${activity.admin_note}</p>
                        </div>
                    ` : ''}
                    
                    <!-- Items List -->
                    <div>
                        <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                            <i class="fas fa-shopping-bag mr-2 text-primary"></i>
                            Daftar Produk (${activity.total_items} item)
                        </h4>
                        <div class="space-y-2 max-h-60 overflow-y-auto pr-2">
                            ${itemsHtml}
                        </div>
                    </div>
                    
                    <!-- Payment Summary -->
                    <div class="bg-gray-50 rounded-xl p-4 space-y-2">
                        <h4 class="font-bold text-gray-800 mb-3">Ringkasan Pembayaran</h4>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Subtotal Produk</span>
                            <span class="font-semibold">Rp ${formatNumber(activity.total_price)}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Fee Jastip</span>
                            <span class="font-semibold">Rp ${formatNumber(activity.total_fee)}</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Ongkir (${activity.courier_method || 'Reguler'})</span>
                            <span class="font-semibold">Rp ${formatNumber(activity.shipping_cost)}</span>
                        </div>
                        <hr class="my-2 border-dashed">
                        <div class="flex justify-between text-lg font-bold text-primary">
                            <span>Total Pembayaran</span>
                            <span>Rp ${formatNumber(activity.grand_total)}</span>
                        </div>
                    </div>
                    
                    <!-- Payment Method -->
                    <div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-wallet text-primary"></i>
                            <span class="text-sm text-gray-600">Metode Pembayaran</span>
                        </div>
                        <span class="font-semibold text-primary capitalize">${activity.payment_method}</span>
                    </div>
                    
                    <!-- Bukti Pembayaran -->
                    ${activity.payment_proof ? `
                        <div>
                            <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                                <i class="fas fa-receipt mr-2 text-primary"></i>
                                Bukti Pembayaran
                            </h4>
                            <div class="relative group">
                                <img src="uploads/payments/${activity.payment_proof}" 
                                     alt="Bukti Pembayaran" 
                                     class="w-full rounded-lg border-2 border-gray-200 shadow-sm cursor-pointer hover:shadow-lg transition"
                                     onclick="window.open(this.src, '_blank')"
                                     onerror="this.parentElement.innerHTML='<div class=\\'text-center text-gray-500 p-8\\'>Bukti pembayaran tidak dapat dimuat</div>'">
                                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition rounded-lg flex items-center justify-center">
                                    <i class="fas fa-search-plus text-white text-2xl opacity-0 group-hover:opacity-100 transition"></i>
                                </div>
                            </div>
                            <p class="text-xs text-gray-500 mt-2 text-center">
                                <i class="fas fa-info-circle mr-1"></i>
                                Klik gambar untuk melihat ukuran penuh
                            </p>
                        </div>
                    ` : `
                        <div class="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                            <i class="fas fa-image text-3xl text-gray-300 mb-2"></i>
                            <p class="text-sm text-gray-500">Belum ada bukti pembayaran</p>
                        </div>
                    `}
                    
                    <!-- Action Buttons -->
                    <div class="flex gap-3 pt-4">
                        ${activity.display_status === 'pending' ? `
                            <button onclick="goToPayment('${activity.id}')" class="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition shadow-md hover:shadow-lg">
                                <i class="fas fa-upload mr-2"></i> Upload Bukti Pembayaran
                            </button>
                        ` : ''}
                        <button onclick="closeActivityModal()" class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition">
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('activityModal');
    if (existingModal) existingModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
}

// Close activity modal
function closeActivityModal() {
    const modal = document.getElementById('activityModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = ''; // Restore scroll
        }, 200);
    }
}

// Hook into switchTab function
if (typeof switchTab !== 'undefined') {
    const originalSwitchTab = switchTab;
    switchTab = function(tabName) {
        originalSwitchTab(tabName);
        
        if (tabName === 'activity') {
            loadActivities();
        }
    };
}

// ESC key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeActivityModal();
    }
});