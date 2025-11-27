
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

          const itemTotal = (price + fee) * qty;
          item.querySelector(".item-subtotal").textContent = formatRupiah(itemTotal);

          totalPromo += price * qty;
          totalFee += fee * qty;
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

        const input = item.querySelector(".qty-input");
        let currentQty = parseInt(input.value);

        if (e.target.closest(".qty-minus")) {
          if (currentQty > 1) {
            input.value = currentQty - 1;
            calculateTotals();
          }
        } else if (e.target.closest(".qty-plus")) {
          input.value = currentQty + 1;
          calculateTotals();
        } else if (e.target.closest(".delete-btn")) {
          if (confirm("Hapus item dari keranjang?")) {
            item.remove();
            calculateTotals();
          }
        }
      });

      // Handle manual input
      document.addEventListener("input", function (e) {
        if (e.target.classList.contains("qty-input")) {
          let value = parseInt(e.target.value);
          if (value < 1 || isNaN(value)) {
            e.target.value = 1;
          }
          calculateTotals();
        }
      });

      // Initial calculation
      calculateTotals();            

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


