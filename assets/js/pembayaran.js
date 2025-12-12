// Real Countdown Timer (24 jam dari created_at)
let countdownInterval;

function startCountdown(createdAt) {
    // Parse created_at dari database
    const createdTime = new Date(createdAt).getTime();
    const deadline = createdTime + (24 * 60 * 60 * 1000); // +24 jam
    
    clearInterval(countdownInterval);
    
    countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const remaining = deadline - now;
        
        if (remaining <= 0) {
            // Waktu habis - auto reject
            clearInterval(countdownInterval);
            autoRejectInvoice();
            return;
        }
        
        // Hitung jam, menit, detik
        const h = String(Math.floor(remaining / (1000 * 60 * 60))).padStart(2, '0');
        const m = String(Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        const s = String(Math.floor((remaining % (1000 * 60)) / 1000)).padStart(2, '0');
        
        document.getElementById('countdown').textContent = `${h}:${m}:${s}`;
        
        // Warning jika kurang dari 1 jam
        if (remaining < 3600000 && !document.getElementById('countdown').classList.contains('text-red-300')) {
            document.getElementById('countdown').classList.add('text-red-300', 'animate-pulse');
        }
    }, 1000);
}

function autoRejectInvoice() {
    document.getElementById('countdown').textContent = '00:00:00';
    document.getElementById('countdown').classList.add('text-red-300');
    
    // Update status ke rejected via API
    fetch('backend/api/auto_reject_invoice.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            invoice_id: window.currentInvoiceId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Waktu pembayaran habis! Invoice telah dibatalkan.');
            window.location.href = 'profile.html#activity';
        }
    })
    .catch(error => console.error('Auto reject error:', error));
}

// Ganti fungsi loadInvoiceData dengan yang lebih lengkap ini:
async function loadInvoiceData() {
    // ✅ CEK APAKAH MULTI-INVOICE ATAU SINGLE
    const invoicesData = JSON.parse(localStorage.getItem('invoices_data') || '[]');
    const payment_method = localStorage.getItem('paymentMethod');
    
    // Jika ada multi-invoice (dari opsi 1)
    if (invoicesData.length > 0) {
        await loadMultiInvoiceData(invoicesData, payment_method);
        return;
    }
    
    // Jika single invoice (backward compatibility)
    const invoice_id = localStorage.getItem('invoice_id');
    
    if (!invoice_id) {
        alert('Invoice tidak ditemukan');
        window.location.href = 'cart.php';
        return;
    }
    
    try {
        const response = await fetch(`backend/api/get_invoice.php?invoice_id=${invoice_id}`, {
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            const inv = data.invoice;
            
            // Simpan grand total ke variabel global
            window.grandTotal = inv.grand_total;
            
            // Update tampilan total
            document.querySelectorAll(".total-bayar").forEach(el => 
                el.textContent = formatRupiah(inv.grand_total)
            );
            document.querySelectorAll(".total-promo").forEach(el => 
                el.textContent = formatRupiah(inv.total_price)
            );
            document.querySelectorAll(".total-fee").forEach(el => 
                el.textContent = formatRupiah(inv.total_fee + inv.shipping_cost)
            );
            document.querySelectorAll(".jumlah-barang").forEach(el => 
                el.textContent = inv.items.length + " barang"
            );
            
            // Tampilkan daftar produk
            displayProducts(inv.items);
            
            // Tampilkan metode pembayaran sesuai pilihan
            displayPaymentMethod(payment_method || inv.payment_method);
            
            // Simpan untuk upload bukti
            window.currentInvoiceId = invoice_id;
            
            // START COUNTDOWN TIMER dengan created_at dari database
            startCountdown(inv.created_at);
            
        } else {
            alert('Gagal memuat data invoice');
            window.location.href = 'cart.php';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan');
    }
}

// ✅ FUNGSI BARU UNTUK MULTI-INVOICE
async function loadMultiInvoiceData(invoicesData, payment_method) {
    try {
        let allProducts = [];
        let totalItems = 0;
        let totalPromo = 0;
        let totalFee = 0;
        let totalGrandTotal = 0;
        let earliestCreatedAt = null;
        
        // Load semua invoice
        for (const invoice of invoicesData) {
            const response = await fetch(`backend/api/get_invoice.php?invoice_id=${invoice.invoice_id}`, {
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.success && data.invoice.items) {
                const inv = data.invoice;
                
                allProducts = allProducts.concat(inv.items);
                totalItems += inv.items.length;
                totalPromo += parseInt(inv.total_price);
                totalFee += parseInt(inv.total_fee) + parseInt(inv.shipping_cost);
                totalGrandTotal += parseInt(inv.grand_total);
                
                // Ambil created_at paling awal untuk countdown
                if (!earliestCreatedAt || new Date(inv.created_at) < new Date(earliestCreatedAt)) {
                    earliestCreatedAt = inv.created_at;
                }
            }
        }
        
        // Set grand total global
        window.grandTotal = totalGrandTotal;
        
        // Update tampilan
        document.querySelectorAll(".total-bayar").forEach(el => 
            el.textContent = formatRupiah(totalGrandTotal)
        );
        document.querySelectorAll(".total-promo").forEach(el => 
            el.textContent = formatRupiah(totalPromo)
        );
        document.querySelectorAll(".total-fee").forEach(el => 
            el.textContent = formatRupiah(totalFee)
        );
        document.querySelectorAll(".jumlah-barang").forEach(el => 
            el.textContent = totalItems + " barang"
        );
        
        // Tampilkan info multi-invoice
        displayMultiInvoiceInfo(invoicesData);
        
        // Tampilkan produk
        displayProducts(allProducts);
        
        // Tampilkan metode pembayaran
        displayPaymentMethod(payment_method);
        
        // Start countdown dari invoice paling awal
        if (earliestCreatedAt) {
            startCountdown(earliestCreatedAt);
        }
        
    } catch (error) {
        console.error('Error loading multi-invoice:', error);
        alert('Gagal memuat data invoice');
    }
}

// ✅ FUNGSI BARU UNTUK TAMPILKAN INFO MULTI-INVOICE
function displayMultiInvoiceInfo(invoicesData) {
    if (invoicesData.length <= 1) return;
    
    const container = document.getElementById('payment-methods-container');
    if (!container) return;
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 mb-6';
    infoDiv.innerHTML = `
        <div class="flex items-start gap-3">
            <i class="fas fa-info-circle text-blue-600 text-2xl mt-1"></i>
            <div class="flex-1">
                <h4 class="font-bold text-blue-900 mb-2 text-lg">Pembayaran untuk ${invoicesData.length} Invoice</h4>
                <p class="text-sm text-blue-700 mb-3">Anda membeli dari <strong>${invoicesData.length} seller berbeda</strong>. Cukup upload <strong>1 bukti transfer</strong> untuk semua invoice.</p>
                <div class="bg-white rounded-lg p-3 space-y-2">
                    ${invoicesData.map(inv => `
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-blue-600 font-medium">${inv.invoice_number}</span>
                            <span class="text-blue-900 font-semibold">${formatRupiah(inv.grand_total)}</span>
                        </div>
                    `).join('')}
                    <hr class="my-2 border-blue-200">
                    <div class="flex justify-between items-center font-bold text-blue-900">
                        <span>TOTAL SEMUA INVOICE</span>
                        <span class="text-lg">${formatRupiah(window.grandTotal)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insert di awal container
    container.insertBefore(infoDiv, container.firstChild);
}

// Fungsi baru untuk menampilkan daftar produk
function displayProducts(items) {
    const container = document.getElementById('product-list');
    if (!container) return;
    
    container.innerHTML = items.map(item => `
        <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div class="flex items-center gap-3">
                <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded">
                <div>
                    <p class="font-semibold text-sm">${item.name}</p>
                    <p class="text-xs text-gray-500">${item.brand}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-sm font-medium">${item.quantity}x</p>
                <p class="text-xs text-primary font-bold">${formatRupiah(item.subtotal)}</p>
            </div>
        </div>
    `).join('');
}

// Fungsi baru untuk menampilkan metode pembayaran
function displayPaymentMethod(method) {
    const container = document.getElementById('payment-methods-container');
    if (!container) return;
    
    let html = '';
    
    if (method === 'transfer') {
        // Transfer Bank - Tampilkan BRI dan BNI dengan nomor rekening
        html = `
            <!-- BRI -->
            <div onclick="pilihMetode('bri')" class="border-2 border-transparent hover:border-primary rounded-2xl p-5 cursor-pointer transition-all bg-gray-50 hover:bg-purple-50">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-5">
                        <div class="bg-white p-3 rounded-xl border">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/BRI_2020.svg/240px-BRI_2020.svg.png" alt="BRI" class="w-12 h-12 object-contain">
                        </div>
                        <div>
                            <p class="font-bold text-lg">Bank BRI</p>
                            <p class="text-sm text-gray-600">a.n. PROMORA JASTIP INDONESIA</p>
                        </div>
                    </div>
                    <i id="check-bri" class="fas fa-check-circle text-primary text-2xl hidden"></i>
                </div>
                <div id="detail-bri" class="mt-5 hidden bg-white border border-purple-200 rounded-xl p-5">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-gray-500 uppercase mb-2">Nomor Rekening BRI</p>
                            <p class="text-2xl font-mono font-bold tracking-wider text-primary">0024 0123 4567 890</p>
                            <p class="text-sm text-gray-600 mt-1">a.n. PROMORA JASTIP INDONESIA</p>
                        </div>
                        <button onclick="copy('002401234567890'); event.stopPropagation();" class="px-5 py-3 bg-primary text-white rounded-full text-sm font-medium hover:bg-purple-700 transition shadow-md">
                            <i class="fas fa-copy mr-2"></i>Salin
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- BNI -->
            <div onclick="pilihMetode('bni')" class="border-2 border-transparent hover:border-primary rounded-2xl p-5 cursor-pointer transition-all bg-gray-50 hover:bg-purple-50">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-5">
                        <div class="bg-white p-3 rounded-xl border">
                            <img src="./assets/img/bni.png" alt="BNI" class="w-12 h-12 object-contain">
                        </div>
                        <div>
                            <p class="font-bold text-lg">Bank BNI</p>
                            <p class="text-sm text-gray-600">a.n. PROMORA JASTIP INDONESIA</p>
                        </div>
                    </div>
                    <i id="check-bni" class="fas fa-check-circle text-primary text-2xl hidden"></i>
                </div>
                <div id="detail-bni" class="mt-5 hidden bg-white border border-purple-200 rounded-xl p-5">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-gray-500 uppercase mb-2">Nomor Rekening BNI</p>
                            <p class="text-2xl font-mono font-bold tracking-wider text-primary">0461 2345 6789 012</p>
                            <p class="text-sm text-gray-600 mt-1">a.n. PROMORA JASTIP INDONESIA</p>
                        </div>
                        <button onclick="copy('046123456789012'); event.stopPropagation();" class="px-5 py-3 bg-primary text-white rounded-full text-sm font-medium hover:bg-purple-700 transition shadow-md">
                            <i class="fas fa-copy mr-2"></i>Salin
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else if (method === 'qris') {
        // QRIS dengan QR Code generator
        html = `
            <div onclick="pilihMetode('qris')" class="border-2 border-primary rounded-2xl p-6 bg-purple-50">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-5">
                        <div class="bg-white p-3 rounded-xl border">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/QRIS_logo.svg/240px-QRIS_logo.svg.png" alt="QRIS" class="w-12 h-12 object-contain">
                        </div>
                        <div>
                            <p class="font-bold text-lg">QRIS</p>
                            <p class="text-sm text-gray-600">Scan QR untuk bayar dengan aplikasi apapun</p>
                        </div>
                    </div>
                    <i id="check-qris" class="fas fa-check-circle text-primary text-2xl"></i>
                </div>
                <div id="detail-qris" class="text-center bg-white rounded-xl p-6 shadow-sm">
                    <p class="text-sm text-gray-600 mb-4">Scan QR Code di bawah ini menggunakan:</p>
                    <div class="flex justify-center gap-3 mb-4">
                        <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">GoPay</span>
                        <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">OVO</span>
                        <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">DANA</span>
                        <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">ShopeePay</span>
                    </div>
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020101021226670016ID.CO.QRIS.WWW0118ID1234567890123456520454995303360540510000.005802ID5925PROMORA%20JASTIP%20INDO6007JAKARTA61051234062070703A0163044BCA" 
                         alt="QRIS" class="mx-auto rounded-2xl shadow-lg border-4 border-purple-200 bg-white p-4">
                    <p class="mt-5 font-bold text-primary text-2xl">${formatRupiah(window.grandTotal || 0)}</p>
                    <p class="text-xs text-gray-500 mt-2">Total yang harus dibayar</p>
                    <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p class="text-xs text-yellow-800">
                            <i class="fas fa-info-circle mr-1"></i>
                            Nominal akan terdeteksi otomatis saat scan QR
                        </p>
                    </div>
                </div>
            </div>
        `;
    } else if (method === 'ewallet') {
        // E-Wallet dengan nomor
        html = `
            <div onclick="pilihMetode('ewallet')" class="border-2 border-primary rounded-2xl p-5 bg-purple-50">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-5">
                        <div class="bg-white p-3 rounded-xl border">
                            <i class="fas fa-wallet text-4xl text-primary"></i>
                        </div>
                        <div>
                            <p class="font-bold text-lg">E-Wallet</p>
                            <p class="text-sm text-gray-600">Transfer ke nomor di bawah ini</p>
                        </div>
                    </div>
                    <i id="check-ewallet" class="fas fa-check-circle text-primary text-2xl"></i>
                </div>
                <div id="detail-ewallet" class="space-y-3">
                    <div class="bg-white border-2 border-purple-200 rounded-xl p-4 hover:shadow-md transition">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/240px-Logo_ovo_purple.svg.png" alt="OVO" class="w-12 h-12 object-contain">
                                <div>
                                    <p class="font-bold text-lg">OVO</p>
                                    <p class="text-gray-600 font-mono tracking-wide">0812-3456-7890</p>
                                    <p class="text-xs text-gray-500">a.n. PROMORA JASTIP</p>
                                </div>
                            </div>
                            <button onclick="copy('081234567890'); event.stopPropagation();" class="px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-purple-700 transition shadow">
                                <i class="fas fa-copy mr-1"></i>Salin
                            </button>
                        </div>
                    </div>
                    <div class="bg-white border-2 border-purple-200 rounded-xl p-4 hover:shadow-md transition">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gopay_logo.svg/240px-Gopay_logo.svg.png" alt="GoPay" class="w-12 h-12 object-contain">
                                <div>
                                    <p class="font-bold text-lg">GoPay</p>
                                    <p class="text-gray-600 font-mono tracking-wide">0812-3456-7890</p>
                                    <p class="text-xs text-gray-500">a.n. PROMORA JASTIP</p>
                                </div>
                            </div>
                            <button onclick="copy('081234567890'); event.stopPropagation();" class="px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-purple-700 transition shadow">
                                <i class="fas fa-copy mr-1"></i>Salin
                            </button>
                        </div>
                    </div>
                    <div class="bg-white border-2 border-purple-200 rounded-xl p-4 hover:shadow-md transition">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Logo_dana_blue.svg/240px-Logo_dana_blue.svg.png" alt="DANA" class="w-12 h-12 object-contain">
                                <div>
                                    <p class="font-bold text-lg">DANA</p>
                                    <p class="text-gray-600 font-mono tracking-wide">0812-3456-7890</p>
                                    <p class="text-xs text-gray-500">a.n. PROMORA JASTIP</p>
                                </div>
                            </div>
                            <button onclick="copy('081234567890'); event.stopPropagation();" class="px-4 py-2 bg-primary text-white rounded-full text-sm hover:bg-purple-700 transition shadow">
                                <i class="fas fa-copy mr-1"></i>Salin
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Update fungsi pilihMetode
function pilihMetode(metode) {
    // Hide semua detail dan check
    document.querySelectorAll('[id^="detail-"]').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('[id^="check-"]').forEach(el => el.classList.add('hidden'));
    
    // Show yang dipilih
    const detail = document.getElementById('detail-' + metode);
    const check = document.getElementById('check-' + metode);
    
    if (detail) detail.classList.remove('hidden');
    if (check) check.classList.remove('hidden');
}

function formatRupiah(angka) {
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Panggil saat load
window.addEventListener("load", loadInvoiceData);

  //Memanggil harga dari cart
    window.addEventListener("load", function () {
      function formatRupiah(angka) {
        return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      }

      const total = parseInt(localStorage.getItem("totalBayar")) || 0;
      const promo = parseInt(localStorage.getItem("totalPromo")) || 0;
      const fee = parseInt(localStorage.getItem("totalFee")) || 0;
      const jumlah = parseInt(localStorage.getItem("jumlahBarang")) || 0;

      document.querySelectorAll(".total-bayar").forEach(el => el.textContent = formatRupiah(total));
      document.querySelectorAll(".total-promo").forEach(el => el.textContent = formatRupiah(promo));
      document.querySelectorAll(".total-fee").forEach(el => el.textContent = formatRupiah(fee));
      document.querySelectorAll(".jumlah-barang").forEach(el => el.textContent = jumlah + " barang");
    });

    function copy(text) {
      navigator.clipboard.writeText(text);
      
      // Notification animasi
      const notif = document.createElement('div');
      notif.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bounce';
      notif.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Nomor berhasil disalin!';
      document.body.appendChild(notif);
      
      setTimeout(() => notif.remove(), 2000);
    }

    // Modal – TIDAK MENGUNCI SCROLL
    function openModal() {
      document.getElementById('modal').classList.remove('hidden');
    }
    function closeModal() {
      document.getElementById('modal').classList.add('hidden');
      document.getElementById('preview').classList.add('hidden');
      document.getElementById('file-input').value = '';
      document.getElementById('btn-kirim').disabled = true;
      document.getElementById('btn-kirim').classList.add('opacity-50', 'cursor-not-allowed');
    }

    // Klik di luar modal = tutup
    document.getElementById('modal').addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });

    // Upload & Preview
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const preview = document.getElementById('preview');
    const previewImg = document.getElementById('preview-img');
    const btnKirim = document.getElementById('btn-kirim');

    dropArea.addEventListener('click', () => fileInput.click());
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => {
      dropArea.addEventListener(e, ev => ev.preventDefault());
    });
    dropArea.addEventListener('drop', e => {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) handleFile({target: {files: [file]}});
    });
    fileInput.addEventListener('change', handleFile);

    function handleFile(e) {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          previewImg.src = reader.result;
          preview.classList.remove('hidden');
          btnKirim.disabled = false;
          btnKirim.classList.remove('opacity-50', 'cursor-not-allowed');
        };
        reader.readAsDataURL(file);
      }
    }

async function kirimBukti() {
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    const btnKirim = document.getElementById('btn-kirim');
    
    if (!file) {
        alert('Pilih file terlebih dahulu');
        return;
    }
    
    btnKirim.disabled = true;
    btnKirim.textContent = 'Mengirim...';
    
    const formData = new FormData();
    formData.append('payment_proof', file);
    
    // ✅ CEK APAKAH MULTI-INVOICE ATAU SINGLE
    const invoiceIds = JSON.parse(localStorage.getItem('invoice_ids') || '[]');
    
    if (invoiceIds.length > 0) {
        // Multi-invoice: kirim array IDs
        formData.append('invoice_ids', JSON.stringify(invoiceIds));
    } else {
        // Single invoice: kirim single ID (backward compatibility)
        formData.append('invoice_id', window.currentInvoiceId);
    }
    
    try {
        const response = await fetch('backend/api/upload_payment_proof.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModal();
            document.getElementById('notif').classList.remove('hidden');
            
            setTimeout(() => {
                document.getElementById('notif').classList.add('hidden');
                
                // Bersihkan localStorage
                localStorage.removeItem('invoice_id');
                localStorage.removeItem('invoice_number');
                localStorage.removeItem('invoice_ids');
                localStorage.removeItem('invoices_data');
                localStorage.removeItem('totalBayar');
                localStorage.removeItem('paymentMethod');
                localStorage.removeItem('courierMethod');
                
                window.location.href = "explore.html";
            }, 3000);
        } else {
            alert('Gagal upload: ' + data.message);
            btnKirim.disabled = false;
            btnKirim.textContent = 'Kirim Bukti';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan');
        btnKirim.disabled = false;
        btnKirim.textContent = 'Kirim Bukti';
    }
}

    // Script ini WAJIB ada di SETIAP halaman biar status login konsisten
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

function logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userPhoto'); // ✅ TAMBAHKAN INI
  
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