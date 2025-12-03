// Update quantity di database
function updateCartQuantity(cartId, newQty) {
    fetch('backend/api/update_cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: cartId, quantity: newQty })
    })
    .then(response => response.json())
    .then(data => {
        if(!data.success) {
            alert('Gagal update quantity');
        }
    });
}

// Delete item dari database
function deleteCartItem(cartId) {
    fetch('backend/api/delete_cart.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: cartId })
    })
    .then(response => response.json())
    .then(data => {
        if(!data.success) {
            alert('Gagal menghapus item');
        }
    });
}
      // Format currency
      function formatRupiah(number) {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
          .format(number)
          .replace("IDR", "Rp");
      }

      // Variable global untuk menyimpan data shipping
let shippingData = null;
let selectedCourier = null;
let selectedPayment = null;

// Fetch shipping data
// Fetch shipping data
async function fetchShippingData() {
    try {
        const response = await fetch('backend/api/calculate_shipping.php', {
            credentials: 'include'
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response bukan JSON. Server mungkin error.');
        }
        
        const data = await response.json();
        
        if (data.success) {
            shippingData = data;
            populateCourierOptions(data.couriers);
            
            // Update distance info
            const distanceInfo = document.getElementById('distance-info');
            if (distanceInfo) {
                distanceInfo.textContent = `(${data.distance} km dari ${data.store_name})`;
            }
            
            console.log('Shipping data loaded:', data);
        } else {
            console.error('Failed to fetch shipping data:', data.message);
            showShippingError(data.message);
        }
    } catch (error) {
        console.error('Error fetching shipping data:', error);
        showShippingError('Tidak dapat memuat data pengiriman. ' + error.message);
    }
}

// Tampilkan error shipping
function showShippingError(message) {
    const courierSelect = document.getElementById('courier-method');
    const distanceInfo = document.getElementById('distance-info');
    
    if (courierSelect) {
        courierSelect.innerHTML = '<option value="">Tidak tersedia</option>';
        courierSelect.disabled = true;
    }
    
    if (distanceInfo) {
        distanceInfo.textContent = `(${message})`;
        distanceInfo.classList.add('text-red-500');
    }
    
    document.getElementById('totalOngkir').textContent = 'Rp 0';
}

// Populate courier dropdown
function populateCourierOptions(couriers) {
    const select = document.getElementById('courier-method');
    if (!select) return;
    
    select.innerHTML = '<option value="">Pilih Jasa Pengiriman</option>';
    select.disabled = false;
    
    if (!couriers || Object.keys(couriers).length === 0) {
        select.innerHTML = '<option value="">Tidak ada kurir tersedia</option>';
        select.disabled = true;
        return;
    }
    
    for (let key in couriers) {
        const courier = couriers[key];
        const option = document.createElement('option');
        option.value = key;
        
        if (courier.available) {
            option.textContent = `${courier.name} - ${formatRupiah(courier.price)} (${courier.estimate})`;
            option.dataset.price = courier.price;
            option.dataset.estimate = courier.estimate;
        } else {
            option.textContent = `${courier.name} - ${courier.estimate}`;
            option.disabled = true;
            option.style.color = '#999';
        }
        
        select.appendChild(option);
    }
}

// Handle courier selection
document.getElementById('courier-method')?.addEventListener('change', function(e) {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const courierInfo = document.getElementById('courier-info');
    
    if (selectedOption.value) {
        selectedCourier = {
            type: selectedOption.value,
            price: parseInt(selectedOption.dataset.price),
            estimate: selectedOption.dataset.estimate
        };
        
        courierInfo.classList.remove('hidden');
        courierInfo.innerHTML = `<i class="text-green-600">✓</i> Estimasi: ${selectedOption.dataset.estimate}`;
        
        calculateTotals();
        checkCheckoutReady();
    } else {
        selectedCourier = null;
        courierInfo.classList.add('hidden');
        calculateTotals();
        checkCheckoutReady();
    }
});

// Handle payment selection
document.getElementById('payment-method')?.addEventListener('change', function(e) {
    selectedPayment = e.target.value;
    checkCheckoutReady();
});

// Ganti fungsi checkCheckoutReady dengan ini:
function checkCheckoutReady() {
    const checkoutBtn = document.getElementById('checkout-btn');
    const hasSelectedItems = document.querySelectorAll('.item-check:checked').length > 0;
    
    if (selectedPayment && selectedCourier && hasSelectedItems) {
        checkoutBtn.disabled = false;
        checkoutBtn.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
        checkoutBtn.classList.add('primary-color', 'hover:primary-dark', 'cursor-pointer', 'text-white', 'font-bold');
        checkoutBtn.textContent = 'Lanjut Bayar';
        checkoutBtn.onclick = createInvoiceAndRedirect;
    } else {
        checkoutBtn.disabled = true;
        checkoutBtn.classList.remove('primary-color', 'hover:primary-dark', 'cursor-pointer');
        checkoutBtn.classList.add('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
        
        if (!hasSelectedItems) {
            checkoutBtn.textContent = 'Pilih Item Terlebih Dahulu';
        } else if (!selectedPayment && !selectedCourier) {
            checkoutBtn.textContent = 'Pilih Metode Pembayaran & Pengiriman';
        } else if (!selectedPayment) {
            checkoutBtn.textContent = 'Pilih Metode Pembayaran';
        } else if (!selectedCourier) {
            checkoutBtn.textContent = 'Pilih Jasa Pengiriman';
        }
        
        checkoutBtn.onclick = null;
    }
}

// Tambahkan fungsi baru ini:
async function createInvoiceAndRedirect() {
    const selectedItems = [];
    document.querySelectorAll('.item-check:checked').forEach(checkbox => {
        const item = checkbox.closest('.cart-item');
        selectedItems.push({
            cart_id: parseInt(item.dataset.id),
            product_id: parseInt(item.dataset.productId),  // ✅ BENAR
            quantity: parseInt(item.querySelector('.qty-input').value)
        });
    });
    
    if (selectedItems.length === 0) {
        alert('Pilih minimal 1 item');
        return;
    }
    
    try {
        const response = await fetch('backend/api/create_invoice.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                cart_items: selectedItems,
                payment_method: selectedPayment,
                courier_data: selectedCourier
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Simpan invoice_id untuk halaman pembayaran
            localStorage.setItem('invoice_id', data.invoice_id);
            localStorage.setItem('invoice_number', data.invoice_number);
            window.location.href = 'pembayaran.html';
        } else {
            alert('Gagal membuat invoice: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat membuat invoice');
    }
}

    function updateItemSubtotal(item) {
        const price = parseInt(item.dataset.price);
        const fee = parseInt(item.dataset.fee);
        const stock = parseInt(item.dataset.stock);
        const qtyInput = item.querySelector(".qty-input");
        
        if (!qtyInput) return; // Jika stok habis, tidak ada input
        
        let qty = parseInt(qtyInput.value);
        
        // Validasi tidak melebihi stok
        if (qty > stock) {
            qty = stock;
            qtyInput.value = stock;
            alert(`Jumlah maksimal ${stock} item (stok terbatas)`);
        }
        
        const itemTotal = (price * qty) + fee;
        item.querySelector(".item-subtotal").textContent = formatRupiah(itemTotal);
    }

// Edit bagian calculateTotals untuk menyimpan payment method yang benar
function calculateTotals() {
    let totalPromo = 0;
    let totalFee = 0;
    const ongkir = selectedCourier ? selectedCourier.price : 0;

    document.querySelectorAll(".cart-item").forEach((item) => {
        const checkbox = item.querySelector(".item-check");
        if (!checkbox || !checkbox.checked) return;

        const price = parseInt(item.dataset.price);
        const fee = parseInt(item.dataset.fee);
        const qty = parseInt(item.querySelector(".qty-input")?.value || 0);

        const itemTotal = (price * qty) + fee;
        const subtotalEl = item.querySelector(".item-subtotal");
        if (subtotalEl) {
            subtotalEl.textContent = formatRupiah(itemTotal);
        }

        totalPromo += price * qty;
        totalFee += fee;
    });

    const grandTotal = totalPromo + totalFee + ongkir;

    document.getElementById("totalPromo").textContent = formatRupiah(totalPromo);
    document.getElementById("totalFee").textContent = formatRupiah(totalFee);
    document.getElementById("totalOngkir").textContent = formatRupiah(ongkir);
    document.getElementById("grandTotal").textContent = formatRupiah(grandTotal);

    // Simpan ke localStorage
    localStorage.setItem("totalBayar", grandTotal);
    localStorage.setItem("totalPromo", totalPromo);
    localStorage.setItem("totalFee", totalFee);
    localStorage.setItem("ongkir", ongkir);
    localStorage.setItem("jumlahBarang", document.querySelectorAll(".item-check:checked").length);
    
    // TAMBAHKAN INI - simpan payment method yang dipilih
    const paymentSelect = document.getElementById('payment-method');
    if (paymentSelect && paymentSelect.value) {
        localStorage.setItem("paymentMethod", paymentSelect.value);
    }
    
    if (selectedCourier) {
        localStorage.setItem("courierMethod", JSON.stringify(selectedCourier));
    }
    
    checkCheckoutReady();
}

document.addEventListener("change", function (e) {
    if (e.target.classList.contains("item-check")) {
        calculateTotals();
        checkCheckoutReady();
    }
});

// Handle quantity changes
document.addEventListener("click", function (e) {
    const item = e.target.closest(".cart-item");
    if (!item) return;

    const cartId = parseInt(item.dataset.id);
    const input = item.querySelector(".qty-input");
    let currentQty = parseInt(input.value);

const stock = parseInt(item.dataset.stock);

if (e.target.closest(".qty-minus")) {
    if (currentQty > 1) {
        input.value = currentQty - 1;
        updateCartQuantity(cartId, currentQty - 1);
        updateItemSubtotal(item);
        calculateTotals();
    }
} else if (e.target.closest(".qty-plus")) {
    if (currentQty >= stock) {
        alert(`Stok maksimal ${stock} item`);
        return;
    }
    input.value = currentQty + 1;
    updateCartQuantity(cartId, currentQty + 1);
    updateItemSubtotal(item);
    calculateTotals();
}else if (e.target.closest(".delete-btn")) {
        if (confirm("Hapus item dari keranjang?")) {
            deleteCartItem(cartId);
            item.remove();
            calculateTotals();
        }
    }
});

document.addEventListener("input", function (e) {
    if (e.target.classList.contains("qty-input")) {
        const item = e.target.closest(".cart-item");
        const stock = parseInt(item.dataset.stock);
        let value = parseInt(e.target.value);
        
        if (value < 1 || isNaN(value)) {
            e.target.value = 1;
        } else if (value > stock) {
            e.target.value = stock;
            alert(`Stok maksimal ${stock} item`);
        }
        
        updateItemSubtotal(item);
        calculateTotals();
    }
});

      // Initial calculation
      calculateTotals();            

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
            const authButtons = document.getElementById('auth-buttons');
            const userInfo = document.getElementById('user-info');
            const dropdown = document.getElementById('dropdown-menu');
            
            if (authButtons) authButtons.classList.remove('hidden');
            if (userInfo) userInfo.classList.add('hidden');
            if (dropdown) dropdown.classList.add('hidden');
            
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

// Jalankan saat halaman load
window.addEventListener('load', function() {
    checkLoginStatus();
    fetchShippingData(); // Fetch shipping data
    calculateTotals();
});
