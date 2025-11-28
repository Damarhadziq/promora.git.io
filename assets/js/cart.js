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

      // Update subtotal per item (tanpa perlu dicentang)
      function updateItemSubtotal(item) {
          const price = parseInt(item.dataset.price);
          const fee = parseInt(item.dataset.fee);
          const qty = parseInt(item.querySelector(".qty-input").value);
          
          const itemTotal = (price * qty) + fee;
          item.querySelector(".item-subtotal").textContent = formatRupiah(itemTotal);
      }

      // Calculate totals
      function calculateTotals() {
        let totalPromo = 0;
        let totalFee = 0;
        const ongkir = 50000;

        document.querySelectorAll(".cart-item").forEach((item) => {
          const checkbox = item.querySelector(".item-check");
          if (!checkbox || !checkbox.checked) return;

          const price = parseInt(item.dataset.price);
          const fee = parseInt(item.dataset.fee);
          const qty = parseInt(item.querySelector(".qty-input").value);

          const itemTotal = (price * qty) + fee;
          item.querySelector(".item-subtotal").textContent = formatRupiah(itemTotal);

          totalPromo += price * qty;
          totalFee += fee;
        });

        const grandTotal = totalPromo + totalFee + ongkir;

        document.getElementById("totalPromo").textContent = formatRupiah(totalPromo);
        document.getElementById("totalFee").textContent = formatRupiah(totalFee);
        document.getElementById("grandTotal").textContent = formatRupiah(grandTotal);

        // ⬇⬇ SIMPAN LOCALSTORAGE DI SINI! BARU BENAR ⬇⬇
        localStorage.setItem("totalBayar", grandTotal);
        localStorage.setItem("totalPromo", totalPromo);
        localStorage.setItem("totalFee", totalFee);
        localStorage.setItem("jumlahBarang", document.querySelectorAll(".item-check:checked").length);
      }

      document.addEventListener("change", function (e) {
          if (e.target.classList.contains("item-check")) {
              calculateTotals();
          }
      });

// Handle quantity changes
document.addEventListener("click", function (e) {
    const item = e.target.closest(".cart-item");
    if (!item) return;

    const cartId = parseInt(item.dataset.id);
    const input = item.querySelector(".qty-input");
    let currentQty = parseInt(input.value);

    if (e.target.closest(".qty-minus")) {
        if (currentQty > 1) {
            input.value = currentQty - 1;
            updateCartQuantity(cartId, currentQty - 1);
            updateItemSubtotal(item);
            calculateTotals();
        }
    } else if (e.target.closest(".qty-plus")) {
        input.value = currentQty + 1;
        updateCartQuantity(cartId, currentQty + 1);
        updateItemSubtotal(item);
        calculateTotals();
    } else if (e.target.closest(".delete-btn")) {
        if (confirm("Hapus item dari keranjang?")) {
            deleteCartItem(cartId);
            item.remove();
            calculateTotals();
        }
    }
});

document.addEventListener("input", function (e) {
    if (e.target.classList.contains("qty-input")) {
        let value = parseInt(e.target.value);
        if (value < 1 || isNaN(value)) {
            e.target.value = 1;
        }
        const item = e.target.closest(".cart-item");
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
        const authButtons = document.getElementById('auth-buttons');
        const userInfo = document.getElementById('user-info');
        const userNameEl = document.getElementById('user-name');
        
        if (isLoggedIn && userName) {
            if (authButtons) authButtons.classList.add('hidden');
            if (userInfo) {
                userInfo.classList.remove('hidden');
                userInfo.classList.add('flex');
            }
            if (userNameEl) userNameEl.textContent = userName;
        } else {
            if (authButtons) authButtons.classList.remove('hidden');
            if (userInfo) userInfo.classList.add('hidden');
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

// Jalankan checkLoginStatus saat halaman load
window.addEventListener('load', checkLoginStatus);


