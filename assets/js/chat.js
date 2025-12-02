// ============================================
// AMBIL DATA PRODUK DARI URL & DATABASE
// ============================================
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// Check login status sebelum load chat
async function checkLoginBeforeChat() {
    try {
        const response = await fetch('backend/api/check_session.php', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (!data.logged_in) {
            alert('Silakan login terlebih dahulu!');
            window.location.href = 'lamanLogin.html';
            return false;
        }
        return true;
    } catch (error) {
        console.error('Error checking login:', error);
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (!isLoggedIn) {
            alert('Silakan login terlebih dahulu!');
            window.location.href = 'lamanLogin.html';
            return false;
        }
        return true;
    }
}

// Redirect jika tidak ada ID
if (!productId) {
    alert('Produk tidak ditemukan!');
    window.location.href = 'explore.html';
}

let productDetails = {};

// Redirect jika tidak ada ID
if (!productId) {
    alert('Produk tidak ditemukan!');
    window.location.href = 'explore.html';
}

// Fungsi untuk convert lat/long ke nama kota (Simple & Support Semua Kota!)
async function getCityFromCoordinates(lat, lon) {
    try {
        // Gunakan API BigDataCloud (gratis, no CORS, support semua lokasi!)
        const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`
        );
        
        const data = await response.json();
        
        // Ambil city/locality dari response
        const city = data.city || 
                     data.locality || 
                     data.principalSubdivision || 
                     data.countryName;
        
        console.log('✅ Location loaded:', city);
        return city + ', Indonesia';
        
    } catch (error) {
        console.error('❌ Error loading location:', error);
        // Fallback ke location dari database
        return 'Indonesia';
    }
}

// Fetch product detail dari database
async function loadProductForChat() {
    try {
        const response = await fetch(`backend/api/products/list_all.php?id=${productId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        let product;
        if (Array.isArray(data)) {
            product = data.find(p => p.id == productId);
        } else {
            product = data;
        }
        
        if (!product || !product.id) {
            alert('Produk tidak ditemukan!');
            window.location.href = 'explore.html';
            return;
        }
        
        // ===== FIX: Update location dari latitude/longitude SEBELUM mapping =====
        let location = 'Location Unknown';
        if (product.latitude && product.longitude) {
            try {
                location = await getCityFromCoordinates(product.latitude, product.longitude);
            } catch (error) {
                console.error('Error loading city:', error);
                location = product.location || 'Location Unknown';
            }
        } else if (product.location) {
            // Kalau tidak ada lat/long, pakai location dari database
            location = product.location;
        }
        
        // ===== FIX: Handle store logo path SEPERTI DI DETAIL.JS =====
        let storeLogo = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(product.store_name || 'Seller') + '&background=9333ea&color=fff&size=100';
        
        if (product.store_logo) {
            // Jika store_logo sudah include path lengkap, pakai langsung
            if (product.store_logo.startsWith('backend/') || product.store_logo.startsWith('http')) {
                storeLogo = product.store_logo;
            } else {
                // Kalau cuma nama file, tambahkan path
                storeLogo = `backend/uploads/store_logos/${product.store_logo}`;
            }
        }
        
// ===== FIX: Handle product image SEPERTI DI DETAIL.JS =====
        let productImage = product.image || 'assets/img/placeholder.jpg';
        
        // Mapping data dari database ke format productDetails
        productDetails = {
            id: product.id,
            name: product.name,
            brand: product.brand || 'Brand',
            category: product.category,
            price: parseInt(product.price),
            formatted_price: `Rp ${parseInt(product.price).toLocaleString('id-ID')}`,
            originalPrice: parseInt(product.original_price || 0),
            formatted_original_price: `Rp ${parseInt(product.original_price || 0).toLocaleString('id-ID')}`,
            discount: product.discount || Math.round(((product.original_price - product.price) / product.original_price) * 100),
            fee: parseInt(product.fee || 0),
            formatted_fee: `Rp ${parseInt(product.fee || 0).toLocaleString('id-ID')}`,
            seller: product.store_name || 'Seller',
            seller_photo: storeLogo, // ✅ Sudah diperbaiki
            product_image: productImage, // ✅ Tambahkan ini
            verified: product.verified == 1,
            location: location, // ✅ Sudah diperbaiki
            stock: parseInt(product.stock || 0),
            rating: 4.8,
            total_reviews: 120,
            total_sold: 30,
            origin: location, // ✅ Pakai location yang sudah di-convert
            delivery: "5-7 hari kerja",
            material: product.description ? product.description.split('\n')[0] : "Material berkualitas",
            dimensions: "Standard size",
            colors: ["Varian 1", "Varian 2", "Varian 3"],
            payment_methods: [
                "Transfer Bank (BCA, Mandiri, BNI)", 
                "E-Wallet (GoPay, OVO, Dana, ShopeePay)", 
                "COD Jakarta area"
            ],
            warranty: "Garansi Keaslian Produk",
            whatsapp: "+62 812-3456-7890",
            instagram: "@" + (product.store_name || 'seller').toLowerCase().replace(/\s+/g, '')
        };
        
        // Update UI dengan data produk
        updateChatUI();
        
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Gagal memuat produk! Error: ' + error.message);
        window.location.href = 'explore.html';
    }
}

// Update UI chat dengan data produk
function updateChatUI() {
    document.getElementById('sellerName').textContent = productDetails.seller;
    document.getElementById('productNameChat').textContent = productDetails.name;
    document.getElementById('productPriceChat').textContent = productDetails.formatted_price;
    
    // ===== UPDATE PRODUCT IMAGE =====
    const productImageChat = document.getElementById('productImageChat');
    if (productImageChat) {
        productImageChat.src = productDetails.product_image;
    }
    
    // ===== UPDATE WELCOME MESSAGE =====
    const welcomeSellerName = document.getElementById('welcomeSellerName');
    const welcomeSellerFirstName = document.getElementById('welcomeSellerFirstName');
    if (welcomeSellerName) welcomeSellerName.textContent = productDetails.seller;
    if (welcomeSellerFirstName) welcomeSellerFirstName.textContent = getSellerFirstName();
    
    // ===== UPDATE PRODUCT CARD SELLER NAME =====
    const productCardSellerName = document.getElementById('productCardSellerName');
    if (productCardSellerName) productCardSellerName.textContent = getSellerFirstName();
    
    // ===== FIX: Update seller photo dengan error handling =====
    const sellerPhoto = document.getElementById('sellerPhoto');
    if (sellerPhoto) {
        sellerPhoto.src = productDetails.seller_photo;
        sellerPhoto.onerror = function() {
            console.log('Seller image load failed:', this.src);
            this.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(productDetails.seller) + '&background=9333ea&color=fff&size=100';
        };
    }

    // ===== FIX: Update semua seller avatar (welcome message, product card, typing) =====
    document.querySelectorAll('.seller-avatar').forEach(img => {
        img.src = productDetails.seller_photo;
        img.onerror = function() {
            console.log('Avatar load failed:', this.src);
            this.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(productDetails.seller) + '&background=9333ea&color=fff&size=100';
        };
    });
    
    // Render pertanyaan setelah data dimuat
    renderQuestions();
}
// ============================================
// PERTANYAAN & JAWABAN
// ============================================
const questions = [
    {
        id: 1, 
        text: "📦 Cek Stok",
        getAnswer: () => {
            if (productDetails.stock === 0) {
                return `Maaf kak, <strong>${productDetails.name}</strong> dari ${productDetails.brand} sudah <span class="text-red-500 font-semibold">SOLD OUT</span> 😢<br><br>Mau dicarikan produk serupa atau pre-order kak?`;
            } else if (productDetails.stock <= 3) {
                return `⚠️ <strong>Stok Terbatas Kak!</strong><br><br><strong>${productDetails.name}</strong> cuma tersisa <span class="text-orange-500 font-bold">${productDetails.stock} pcs</span> lagi nih!<br><br>Banyak yang nanya juga nih kak, mending langsung checkout biar gak kehabisan! 🏃‍♀️`;
            }
            return `✅ Alhamdulillah stok <strong>${productDetails.name}</strong> masih ready <span class="text-green-500 font-bold">${productDetails.stock} pcs</span> kak!<br><br>Langsung checkout aja ya biar gak kehabisan 😊`;
        }
    },
    {
        id: 2, 
        text: "💰 Detail Harga",
        getAnswer: () => `💎 <strong>${productDetails.brand} ${productDetails.name}</strong><br><br>
            <div class="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg my-2 space-y-1">
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-600">Harga Produk:</span>
                    <span class="text-sm font-bold gradient-text">${productDetails.formatted_price}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-600">Fee Jastip:</span>
                    <span class="text-sm font-semibold text-gray-700">${productDetails.formatted_fee}</span>
                </div>
                <div class="pt-1 border-t border-gray-200 flex justify-between items-center">
                    <span class="text-xs font-semibold text-gray-700">Total:</span>
                    <span class="text-lg font-bold gradient-text">Rp ${(productDetails.price + productDetails.fee).toLocaleString('id-ID')}</span>
                </div>
            </div>
            <p class="text-gray-500 text-xs mt-2">Hemat <span class="text-red-500 font-bold">${productDetails.discount}%</span> dari harga normal ${productDetails.formatted_original_price}! 🎉</p>`
    },
    {
        id: 3, 
        text: "🚚 Pengiriman",
        getAnswer: () => `📍 Produk ini dari <strong>${productDetails.origin}</strong> ya kak<br><br>
            <div class="bg-blue-50 p-3 rounded-lg my-2">
                <p class="text-blue-700 font-semibold text-sm flex items-center gap-1">
                    <i class="fas fa-clock text-xs"></i> 
                    Estimasi ${productDetails.delivery}
                </p>
            </div>
            <p class="text-xs text-gray-600">Proses:</p>
            <ol class="text-xs text-gray-600 mt-1 space-y-0.5 ml-3">
                <li>1. Pembelian di lokasi (1-2 hari)</li>
                <li>2. Packaging & dokumentasi (1 hari)</li>
                <li>3. Pengiriman ke Indonesia (3-4 hari)</li>
            </ol>
            <p class="text-[10px] text-gray-400 mt-2">*Bisa lebih cepat kalau sedang ada open PO ya kak</p>`
    },
    {
        id: 4, 
        text: "🎨 Pilihan Warna",
        getAnswer: () => {
            const colors = productDetails.colors.map(c => 
                `<span class="inline-block px-2.5 py-1 bg-gray-100 rounded-full text-xs mr-1 mb-1 font-medium">${c}</span>`
            ).join('');
            return `🎨 Warna yang tersedia untuk <strong>${productDetails.name}</strong>:<br><br>
            <div class="mt-2 mb-2">${colors}</div>
            <p class="text-xs text-gray-500">💡 Semua warna cantik kok! Pilih yang sesuai selera kakak ya 😊</p>`;
        }
    },
{
        id: 5, 
        text: "💳 Cara Bayar",
        getAnswer: () => {
            // ✅ Ekstrak nama kota dari location (ambil sebelum koma)
            const cityName = productDetails.location.split(',')[0].trim();
            
            // ✅ Update payment methods dengan COD dinamis
            const dynamicPaymentMethods = [
                "Transfer Bank (BCA, Mandiri, BNI)", 
                "E-Wallet (GoPay, OVO, Dana, ShopeePay)", 
                `COD ${cityName} area` // ✅ Dinamis sesuai lokasi toko
            ];
            
            const methods = dynamicPaymentMethods.map(p => 
                `<div class="flex items-start gap-2 py-1.5"><i class="fas fa-check-circle text-green-500 text-xs mt-0.5"></i><span class="text-xs leading-tight">${p}</span></div>`
            ).join('');
            return `💳 <strong>Metode Pembayaran:</strong><br><br>
            <div class="bg-gray-50 rounded-lg p-2">${methods}</div>
            <p class="text-[10px] text-gray-400 mt-2">
                <i class="fas fa-shield-alt"></i> Semua transaksi aman & terpercaya ✨
            </p>`;
        }
    },
    {
        id: 6, 
        text: "⭐ Rating & Review",
        getAnswer: () => `👤 <strong>${productDetails.seller}</strong> 
            ${productDetails.verified ? '<i class="fas fa-check-circle text-blue-500 text-xs"></i>' : ''}<br><br>
            <div class="flex items-center gap-2 mb-2">
                <div class="flex text-yellow-400 text-xs">${'<i class="fas fa-star"></i>'.repeat(5)}</div>
                <span class="font-bold text-lg">${productDetails.rating}</span>
                <span class="text-xs text-gray-500">(${productDetails.total_reviews} reviews)</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs mb-2">
                <div class="bg-green-50 p-2 rounded-lg text-center">
                    <p class="text-green-600 font-bold">${productDetails.total_sold}+</p>
                    <p class="text-gray-500 text-[10px]">Order Selesai</p>
                </div>
                <div class="bg-blue-50 p-2 rounded-lg text-center">
                    <p class="text-blue-600 font-bold">100%</p>
                    <p class="text-gray-500 text-[10px]">Trusted</p>
                </div>
            </div>
            <p class="text-xs text-gray-600">
                <i class="fas fa-map-marker-alt text-[10px]"></i> ${productDetails.location} | 
                <span class="text-green-600 font-semibold">Verified Seller</span> ✓
            </p>`
    },
    {
        id: 7, 
        text: "📋 Detail Produk",
        getAnswer: () => `📋 <strong>Spesifikasi ${productDetails.name}</strong><br><br>
            <div class="bg-purple-50 rounded-lg p-3 space-y-1.5 text-xs">
                <div class="flex justify-between">
                    <span class="text-gray-600">Brand:</span>
                    <span class="font-semibold text-gray-800">${productDetails.brand}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Material:</span>
                    <span class="font-semibold text-gray-800">${productDetails.material}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Ukuran:</span>
                    <span class="font-semibold text-gray-800">${productDetails.dimensions}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Kategori:</span>
                    <span class="font-semibold text-gray-800 capitalize">${productDetails.category}</span>
                </div>
            </div>
            <p class="text-[10px] text-gray-400 mt-2">
                <i class="fas fa-shield-alt"></i> ${productDetails.warranty}
            </p>`
    },
    {
        id: 8, 
        text: "📞 Kontak Seller",
        getAnswer: () => `📞 <strong>Hubungi ${productDetails.seller}:</strong><br><br>
            <div class="space-y-2">
                <a href="https://wa.me/${productDetails.whatsapp.replace(/[^0-9]/g, '')}" 
                  target="_blank"
                  class="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition">
                    <i class="fab fa-whatsapp text-green-500 text-xl"></i>
                    <div class="text-left">
                        <p class="text-xs font-semibold text-gray-700">WhatsApp</p>
                        <p class="text-[10px] text-gray-500">${productDetails.whatsapp}</p>
                    </div>
                </a>
                <a href="https://instagram.com/${productDetails.instagram.replace('@', '')}" 
                  target="_blank"
                  class="flex items-center gap-3 p-3 bg-pink-50 rounded-xl hover:bg-pink-100 transition">
                    <i class="fab fa-instagram text-pink-500 text-xl"></i>
                    <div class="text-left">
                        <p class="text-xs font-semibold text-gray-700">Instagram</p>
                        <p class="text-[10px] text-gray-500">${productDetails.instagram}</p>
                    </div>
                </a>
            </div>
            <p class="text-[10px] text-gray-400 mt-3 text-center">Fast response! 💬</p>`
    }
];

// ============================================
// DOM ELEMENTS
// ============================================
const chatMessages = document.getElementById('chatMessages');
const messagesContainer = document.getElementById('messagesContainer');
const questionButtons = document.getElementById('questionButtons');
const typingIndicator = document.getElementById('typingIndicator');

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get current time in HH:MM format
 */
function getCurrentTime() {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Get seller's first name
 */
function getSellerFirstName() {
    return productDetails.seller.split(' ')[0];
}

/**
 * Scroll chat to bottom
 */
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ============================================
// RENDER FUNCTIONS
// ============================================

/**
 * Render question buttons
 */
function renderQuestions() {
    questionButtons.innerHTML = questions.map(q => `
        <button onclick="askQuestion(${q.id})" 
                class="question-btn px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 
                      hover:from-indigo-100 hover:to-purple-100 text-gray-700 rounded-lg 
                      text-xs font-medium border border-indigo-100">
            ${q.text}
        </button>
    `).join('');
}

/**
 * Add user message bubble
 */
function addUserMessage(text) {
    messagesContainer.innerHTML += `
        <div class="message-bubble flex justify-end">
            <div>
                <div class="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl rounded-tr-md px-3 py-2 max-w-[240px] shadow">
                    <p class="text-sm">${text}</p>
                </div>
                <p class="text-[10px] text-gray-400 mt-1 mr-1 text-right">${getCurrentTime()}</p>
            </div>
        </div>
    `;
    scrollToBottom();
}

/**
 * Add seller/bot message bubble
 */
function addBotMessage(html) {
    messagesContainer.innerHTML += `
        <div class="message-bubble flex gap-2">
            <img src="${productDetails.seller_photo}" 
                class="w-8 h-8 rounded-lg shadow flex-shrink-0 object-cover" 
                alt="Seller"
                onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(productDetails.seller)}&background=9333ea&color=fff&size=100'">
            <div>
                <div class="glass-effect rounded-2xl rounded-tl-md p-3 max-w-[260px] shadow-sm border border-gray-100 text-sm">
                    ${html}
                </div>
                <p class="text-[10px] text-gray-400 mt-1 ml-1">${getSellerFirstName()} • ${getCurrentTime()}</p>
            </div>
        </div>
    `;
    scrollToBottom();
}

// ============================================
// TYPING INDICATOR
// ============================================

/**
 * Show typing indicator
 */
function showTyping() {
    typingIndicator.classList.remove('hidden');
    scrollToBottom();
}

/**
 * Hide typing indicator
 */
function hideTyping() {
    typingIndicator.classList.add('hidden');
}

// ============================================
// QUESTION HANDLER
// ============================================

/**
 * Handle question button click
 */
function askQuestion(id) {
    const question = questions.find(q => q.id === id);
    if (!question) return;

    // Add user message
    addUserMessage(question.text);
    
    // Show typing indicator
    showTyping();

    // Simulate typing delay (1-2 seconds)
    const typingDelay = 1200 + Math.random() * 800;

    setTimeout(() => {
        hideTyping();
        addBotMessage(question.getAnswer());
    }, typingDelay);
}

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Load product data terlebih dahulu
    loadProductForChat();
});